import dayjs from "dayjs";
import {StatusCodes} from "http-status-codes";
import schedule from "node-schedule";
import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";
import Village from "../models/Village.js";
import {updateResourcesToDate} from "./gameController.js";
import {getBuildingById} from "./gsBuildingsController.js";
import {getUnits} from "./gsUnitsController.js";
import {getVillageById} from "./villageController.js";

const createUpdatedObject = (
  isBuilding,
  buildingName,
  fieldId,
  villageObject,
  getBuildingCurrentLevel,
  getBuildingNextLevel,
  buildingObject
) => {
  let updatedObjectTemp = {};

  const iteration =
    isBuilding === true
      ? villageObject.villageBuildings
      : villageObject.resourceFields;

  updatedObjectTemp = iteration.map((item) => {
    if (item.id === fieldId) {
      return {
        gridPosition: item.gridPosition,
        description: item.description,
        id: item.id,
        type: item.type,
        level: getBuildingCurrentLevel ? getBuildingCurrentLevel.level + 1 : 1,
        imageGrid: getBuildingNextLevel.image
          ? getBuildingNextLevel.image
          : buildingObject.image,
        ...(isBuilding === true && {
          type: buildingName,
        }),
        ...(buildingObject.description && {
          description: buildingObject.description,
        }),
      };
    } else {
      return item;
    }
  });

  return updatedObjectTemp;
};

const postBuilding = async (req, res, next) => {
  const villageId = req.body.villageId;
  const buildingName = req.body.buildingName;
  const fieldId = req.body.fieldId;
  const isBuilding = req.body.isBuilding;
  const cancleJob = req.body.cancleJob;
  const forceFinishJob = req.body.forceFinishJob;

  const village = await Village.findOne({userId: villageId});
  const buildingNamePrefix = buildingName.split("_");

  if (forceFinishJob && Object.keys(schedule.scheduledJobs).length !== 0) {
    var my_job = schedule.scheduledJobs[buildingName];

    my_job.cancel();

    const villageObject = await getVillageById(villageId);
    const buildingObject = await getBuildingById(buildingName);

    const getBuildingCurrentLevel = (
      isBuilding === true
        ? villageObject.villageBuildings
        : villageObject.resourceFields
    ).find((building) => building.id === fieldId);
    const getBuildingNextLevel =
      buildingObject.levels[0][
        `${!getBuildingCurrentLevel ? 1 : getBuildingCurrentLevel.level + 1}`
      ];

    const updatedObject = createUpdatedObject(
      isBuilding,
      buildingName,
      fieldId,
      villageObject,
      getBuildingCurrentLevel,
      getBuildingNextLevel,
      buildingObject
    );

    console.log("Execute update!", dayjs().toDate());

    village.currentlyBuilding = [];

    village.population =
      villageObject.population + getBuildingNextLevel.populationAdd;

    if (isBuilding === true) {
      village.villageBuildings = updatedObject;
    } else {
      village.resourceFields = updatedObject;
      village[`${buildingNamePrefix[0]}ProductionPerH`] =
        getBuildingNextLevel.productionAdd +
        villageObject[`${buildingNamePrefix[0]}ProductionPerH`];
    }

    await village.save();

    return res.status(StatusCodes.OK).send("Force update finished");
  }

  if (cancleJob && Object.keys(schedule.scheduledJobs).length !== 0) {
    var my_job = schedule.scheduledJobs[buildingName];

    console.log("my_job", my_job);
    my_job.cancel();

    console.log("cancled job!");
    village.currentlyBuilding = [];
    village.save();

    return res.status(StatusCodes.OK).json({msg: "Job canceled successfully!"});
  } else {
    if (!villageId || !buildingName || !fieldId) {
      throw new BadRequestError("Parameters are missing!");
    }

    const buildingObject = await getBuildingById(buildingName);
    const villageObject = await getVillageById(villageId);

    if (!buildingObject) {
      throw new NotFoundError("Building not found!");
    }

    if (villageObject.currentlyBuilding.length) {
      throw new BadRequestError("Builders are currently unavailable!");
    }

    const getBuildingCurrentLevel = (
      isBuilding === true
        ? villageObject.villageBuildings
        : villageObject.resourceFields
    ).find((building) => building.id === fieldId);

    if (getBuildingCurrentLevel === undefined) {
      throw new NotFoundError("Building not found!");
    }

    const getBuildingNextLevel =
      buildingObject.levels[0][
        `${!getBuildingCurrentLevel ? 1 : getBuildingCurrentLevel.level + 1}`
      ];

    console.log("getBuildingNextLevel", getBuildingNextLevel);

    if (!getBuildingNextLevel) {
      throw new BadRequestError("Building is max level!");
    }

    if (
      getBuildingCurrentLevel.type !== "empty_field" &&
      getBuildingCurrentLevel?.type !== buildingName
    ) {
      throw new BadRequestError("Wrong buildingId type in request!");
    }

    const villageCurrentResources = await updateResourcesToDate(
      villageObject,
      village._id
    );

    const buildingBuildTime = getBuildingNextLevel.timeToBuild;
    const buildingResourcesNeeded = {
      wood: getBuildingNextLevel.costWood,
      clay: getBuildingNextLevel.costClay,
      iron: getBuildingNextLevel.costIron,
      wheat: getBuildingNextLevel.costWheat,
    };

    if (
      villageCurrentResources.woodAmount < buildingResourcesNeeded.wood ||
      villageCurrentResources.clayAmount < buildingResourcesNeeded.clay ||
      villageCurrentResources.ironAmount < buildingResourcesNeeded.iron ||
      villageCurrentResources.wheatAmount < buildingResourcesNeeded.wheat
    )
      throw new BadRequestError("Insufficient resources!");

    const endBuildTime = dayjs().add(buildingBuildTime, "s").toDate();

    const updatedObject = createUpdatedObject(
      isBuilding,
      buildingName,
      fieldId,
      villageObject,
      getBuildingCurrentLevel,
      getBuildingNextLevel,
      buildingObject
    );

    const resourcesStorageMinus = {
      woodAmount:
        villageCurrentResources.woodAmount - buildingResourcesNeeded.wood,
      clayAmount:
        villageCurrentResources.clayAmount - buildingResourcesNeeded.clay,
      ironAmount:
        villageCurrentResources.ironAmount - buildingResourcesNeeded.iron,
      wheatAmount:
        villageCurrentResources.wheatAmount - buildingResourcesNeeded.wheat,
    };

    village.currentlyBuilding = [
      {
        buildingId: buildingName,
        currentlyBuildingLevel: getBuildingCurrentLevel
          ? getBuildingCurrentLevel.level + 1
          : 1,
        fieldId: fieldId,
        endBuildTime: endBuildTime,
        isBuilding: isBuilding,
      },
    ];

    village.resourcesStorage = resourcesStorageMinus;
    await village.save();

    console.log("Added currently building and reduced resources!");

    const job = schedule.scheduleJob(
      buildingName,
      endBuildTime,
      async function () {
        console.log("Execute update!", dayjs().toDate());

        village.currentlyBuilding = [];

        village.population =
          villageObject.population + getBuildingNextLevel.populationAdd;

        if (isBuilding === true) {
          village.villageBuildings = updatedObject;
        } else {
          village.resourceFields = updatedObject;
          village[`${buildingNamePrefix[0]}ProductionPerH`] =
            getBuildingNextLevel.productionAdd +
            villageObject[`${buildingNamePrefix[0]}ProductionPerH`];
        }

        await village.save();
      }
    );

    return res.status(StatusCodes.OK).json({
      resourcesStorageMinus: resourcesStorageMinus,
      currentlyBuilding: {
        buildingId: buildingName,
        currentlyBuildingLevel: getBuildingCurrentLevel
          ? getBuildingCurrentLevel.level + 1
          : 1,
        fieldId: fieldId,
        endBuildTime: endBuildTime,
      },
    });
  }
};

const postUnitsBuild = async (req, res, next) => {
  const villageId = req.body.villageId;
  const buildingName = req.body.buildingName;
  const unitName = req.body.unitName;
  const unitAmount = req.body.unitAmount;

  const village = await Village.findOne({userId: villageId});

  const allUnits = await getUnits();
  const villageObject = await getVillageById(villageId);

  const currentlyBuildingUnits = villageObject.unitTrainQueue;
  const lastUnitBuilding = currentlyBuildingUnits.slice(-1)[0] || null;

  const unitObject = allUnits.find((unit) => unit.unitName === buildingName);
  console.log("unitObject", unitObject);
  const specifiedUnit = unitObject.units[unitName];

  const villageCurrentResources = await updateResourcesToDate(
    villageObject,
    village._id
  );

  async function getLatestVillageInfo(villageId) {
    const latestVillageObject = await getVillageById(villageId);

    console.log("latestVillageObject", latestVillageObject);
    let latestVillageInfo = {
      allUnitsInVillage: latestVillageObject.units,
      unitTrainQueue: latestVillageObject.unitTrainQueue,
    };

    return latestVillageInfo;
  }

  const unitResourcesNeeded = {
    wood: specifiedUnit.costWood * unitAmount,
    clay: specifiedUnit.costClay * unitAmount,
    iron: specifiedUnit.costIron * unitAmount,
    wheat: specifiedUnit.costWheat * unitAmount,
  };

  if (
    villageCurrentResources.resourcesStorage.woodAmount <
      unitResourcesNeeded.wood ||
    villageCurrentResources.resourcesStorage.clayAmount <
      unitResourcesNeeded.clay ||
    villageCurrentResources.resourcesStorage.ironAmount <
      unitResourcesNeeded.iron ||
    villageCurrentResources.resourcesStorage.wheatAmount <
      unitResourcesNeeded.wheat
  )
    throw new BadRequestError("Insufficient resources!");

  const resourcesStorageMinus = {
    woodAmount:
      villageCurrentResources.resourcesStorage.woodAmount -
      unitResourcesNeeded.wood,
    clayAmount:
      villageCurrentResources.resourcesStorage.clayAmount -
      unitResourcesNeeded.clay,
    ironAmount:
      villageCurrentResources.resourcesStorage.ironAmount -
      unitResourcesNeeded.iron,
    wheatAmount:
      villageCurrentResources.resourcesStorage.wheatAmount -
      unitResourcesNeeded.wheat,
  };

  let currentTime = dayjs().toDate();
  let unitsBuildTime = unitObject.units[unitName].timeToBuild;
  let endBuildTime = dayjs(currentTime).add(unitsBuildTime, "s").toDate();
  let queueEndTime = dayjs(
    !lastUnitBuilding ? currentTime : lastUnitBuilding.endThisBuild.toDate()
  )
    .add(unitsBuildTime * unitAmount, "s")
    .toDate();

  village.update({
    resourcesStorage: resourcesStorageMinus,
    unitTrainQueue: [
      ...currentlyBuildingUnits,
      {unit: unitName, amount: unitAmount, endThisBuild: queueEndTime},
    ],
  });

  village.save();
  console.log("Reduced resources!");
  let i = 0;

  if (lastUnitBuilding) {
    const job = schedule.scheduleJob(
      lastUnitBuilding.endThisBuild.toDate(),
      async function () {
        scheduleJobFunc(
          currentTime,
          dayjs(lastUnitBuilding.endThisBuild.toDate())
            .add(unitsBuildTime, "s")
            .toDate(),
          (i = 0)
        );
      }
    );
  } else {
    scheduleJobFunc(currentTime, endBuildTime, i);
  }

  async function scheduleJobFunc(currentTime, endBuildTime, i) {
    console.log("start scheduleJobFunc");

    console.log("i = ", i, "Unit am: ", unitAmount);
    i = i + 1;
    if (i <= unitAmount) {
      const job = schedule.scheduleJob(endBuildTime, async function () {
        console.log("Unit built!, NEXT!");

        let {allUnitsInVillage} = await getLatestVillageInfo(villageId);

        allUnitsInVillage = allUnitsInVillage.map((unit) => {
          if (unit.name === unitName) {
            return {
              ...unit,
              amount: unit.amount + 1,
            };
          } else return unit;
        });

        console.log("updatedArray", allUnitsInVillage);

        village.update({
          units: allUnitsInVillage,
        });
        village.save();

        currentTime = await getServerTime();

        endBuildTime = dayjs(currentTime).add(unitsBuildTime, "s").toDate();
        scheduleJobFunc(currentTime, endBuildTime, i);
      });
    } else {
      let {unitTrainQueue} = await getLatestVillageInfo(villageId);

      const [, ...rest] = unitTrainQueue;

      village.update({
        unitTrainQueue: rest,
      });
      village.save();
    }
  }

  return res
    .status(StatusCodes.OK)
    .json({msg: "Unit build request sent successfully!"});
};

export {postBuilding, postUnitsBuild};
