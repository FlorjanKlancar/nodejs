import dayjs from "dayjs";
import {StatusCodes} from "http-status-codes";
import schedule from "node-schedule";
import BadRequestError from "../errors/bad-request.js";
import {getBuildingById} from "./gsBuildingsController.js";
import {getVillageById} from "./villageController.js";

const postBuilding = async (req, res, next) => {
  const villageId = req.body.villageId;
  const buildingName = req.body.buildingName;
  const fieldId = req.body.fieldId;
  const isBuilding = req.body.isBuilding;
  const cancleJob = req.body.cancleJob;

  console.log("req.body", req.body);

  /*      const docRef = db.collection("village").doc(villageId);
  
    if (cancleJob && Object.keys(schedule.scheduledJobs).length !== 0) {
      var my_job = schedule.scheduledJobs[buildingName];
      my_job.cancel();
  
      console.log("cancled job!");
      docRef.update({
        currentlyBuilding: [],
      });
  
      return res
        .status(StatusCodes.OK)
        .json({ msg: "Job canceled successfully!" });
    } else {  */
  if (!villageId || !buildingName || !fieldId) {
    throw new BadRequestError("Parameters are missing!");
  }

  const buildingObject = await getBuildingById(buildingName);
  const villageObject = await getVillageById(villageId);

  if (buildingObject.status === 404) {
    throw new NotFoundError("Building not found!");
  }

  if (villageObject[0].currentlyBuilding.length) {
    throw new BadRequestError("Builders are currently unavailable!");
  }

  const getBuildingCurrentLevel = (
    isBuilding === true
      ? villageObject[0].villageBuildings
      : villageObject[0].resourceFields
  ).find((building) => building.id === fieldId);

  if (getBuildingCurrentLevel === undefined) {
    throw new NotFoundError("Building not found!");
  }

  const getBuildingNextLevel =
    buildingObject[0].levels[0][`${getBuildingCurrentLevel.level + 1}`];

  if (!getBuildingNextLevel) {
    throw new BadRequestError("Building is max level!");
  }

  if (
    getBuildingCurrentLevel.type !== "empty_field" &&
    getBuildingCurrentLevel?.type !== buildingName
  ) {
    throw new BadRequestError("Wrong buildingId type in request!");
  }

  const villageCurrentResources = {
    resourcesStorage: {
      woodAmount: 1200,
      clayAmount: 1200,
      ironAmount: 1200,
      wheatAmount: 1200,
    },
  };

  const buildingBuildTime = getBuildingNextLevel.timeToBuild;
  const buildingResourcesNeeded = {
    wood: getBuildingNextLevel.costWood,
    clay: getBuildingNextLevel.costClay,
    iron: getBuildingNextLevel.costIron,
    wheat: getBuildingNextLevel.costWheat,
  };

  if (
    villageCurrentResources.resourcesStorage.woodAmount <
      buildingResourcesNeeded.wood ||
    villageCurrentResources.resourcesStorage.clayAmount <
      buildingResourcesNeeded.clay ||
    villageCurrentResources.resourcesStorage.ironAmount <
      buildingResourcesNeeded.iron ||
    villageCurrentResources.resourcesStorage.wheatAmount <
      buildingResourcesNeeded.wheat
  )
    throw new BadRequestError("Insufficient resources!");

  /* const currentTime = await getServerTime(); */
  const endBuildTime = dayjs().add(buildingBuildTime, "s").toDate();
  const timenow = dayjs().toDate();
  console.log("timenow", timenow);

  let updatedObject = {};

  const iteration =
    isBuilding === true
      ? villageObject[0].villageBuildings
      : villageObject[0].resourceFields;

  updatedObject = iteration.map((item) => {
    if (item.id === fieldId) {
      return {
        ...item,
        level: getBuildingCurrentLevel.level + 1,
        imageGrid: getBuildingNextLevel.image
          ? getBuildingNextLevel.image
          : buildingObject[0].image,
        ...(isBuilding === true && {
          type: buildingName,
        }),
        ...(buildingObject[0].description && {
          description: buildingObject[0].description,
        }),
      };
    } else {
      return item;
    }
  });

  const resourcesStorageMinus = {
    woodAmount:
      villageCurrentResources.resourcesStorage.woodAmount -
      buildingResourcesNeeded.wood,
    clayAmount:
      villageCurrentResources.resourcesStorage.clayAmount -
      buildingResourcesNeeded.clay,
    ironAmount:
      villageCurrentResources.resourcesStorage.ironAmount -
      buildingResourcesNeeded.iron,
    wheatAmount:
      villageCurrentResources.resourcesStorage.wheatAmount -
      buildingResourcesNeeded.wheat,
  };

  const buildingNamePrefix = buildingName.split("_");

  /*   docRef.update({
    currentlyBuilding: [
      {
        buildingId: buildingName,
        currentlyBuildingLevel: getBuildingCurrentLevel.level + 1,
        fieldId,
        endBuildTime,
      },
    ],
    resourcesStorage: resourcesStorageMinus,
  }); */
  console.log("Added currently building and reduced resources!");

  console.log("endBuildTime", endBuildTime);

  const job = schedule.scheduleJob(buildingName, endBuildTime, function () {
    console.log("Execute update!", dayjs().toDate());

    /*     const docRef = db.collection("village").doc(villageId);

    docRef.update({
      currentlyBuilding: [],
      population:
        villageObject[0].population + getBuildingNextLevel.populationAdd,

      ...(isBuilding === true
        ? { villageBuildings: updatedObject }
        : {
            resourceFields: updatedObject,
            [`${buildingNamePrefix[0]}ProductionPerH`]:
              getBuildingNextLevel.productionAdd +
              villageObject[0][`${buildingNamePrefix[0]}ProductionPerH`],
          }),
    }); */
  });

  return res
    .status(StatusCodes.OK)
    .json({msg: "Request for upgrade in progress!"});
  /* } */
};

export {postBuilding};
