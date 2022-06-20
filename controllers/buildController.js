import dayjs from "dayjs";
import {StatusCodes} from "http-status-codes";
import schedule from "node-schedule";
import BadRequestError from "../errors/bad-request.js";
import Village from "../models/Village.js";
import {updateResourcesToDate} from "./gameController.js";
import {getBuildingById} from "./gsBuildingsController.js";
import {getVillageById} from "./villageController.js";

const postBuilding = async (req, res, next) => {
  const villageId = req.body.villageId;
  const buildingName = req.body.buildingName;
  const fieldId = req.body.fieldId;
  const isBuilding = req.body.isBuilding;
  const cancleJob = req.body.cancleJob;

  const village = await Village.findOne({_id: villageId});

  if (cancleJob && Object.keys(schedule.scheduledJobs).length !== 0) {
    var my_job = schedule.scheduledJobs[buildingName];
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

    const villageCurrentResources = await updateResourcesToDate(
      villageObject[0],
      villageId
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
        villageCurrentResources.woodAmount - buildingResourcesNeeded.wood,
      clayAmount:
        villageCurrentResources.clayAmount - buildingResourcesNeeded.clay,
      ironAmount:
        villageCurrentResources.ironAmount - buildingResourcesNeeded.iron,
      wheatAmount:
        villageCurrentResources.wheatAmount - buildingResourcesNeeded.wheat,
    };

    const buildingNamePrefix = buildingName.split("_");

    village.currentlyBuilding = [
      {
        buildingId: buildingName,
        currentlyBuildingLevel: getBuildingCurrentLevel.level + 1,
        fieldId: fieldId,
        endBuildTime: endBuildTime,
      },
    ];
    (village.resourcesStorage = resourcesStorageMinus), await village.save();

    console.log("Added currently building and reduced resources!");

    const job = schedule.scheduleJob(
      buildingName,
      endBuildTime,
      async function () {
        console.log("Execute update!", dayjs().toDate());

        village.currentlyBuilding = [];
        village.population =
          villageObject[0].population + getBuildingNextLevel.populationAdd;

        isBuilding === true
          ? village.villageBuildings.updatedObject
          : {
              resourceFields: updatedObject,
              [`${buildingNamePrefix[0]}ProductionPerH`]:
                getBuildingNextLevel.productionAdd +
                villageObject[0][`${buildingNamePrefix[0]}ProductionPerH`],
            };

        await village.save();
      }
    );

    return res
      .status(StatusCodes.OK)
      .json({msg: "Request for upgrade in progress!"});
  }
};

export {postBuilding};
