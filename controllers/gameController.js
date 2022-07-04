import {getBuildingById} from "./gsBuildingsController.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration.js";
import Village from "../models/Village.js";

dayjs.extend(duration);

async function updateResourcesToDate(villageObject, villageId) {
  const serverTime = dayjs().toDate();

  const lastVillageUpdateTime = villageObject.updatedAt;
  const villageWoodProduction = villageObject.woodProductionPerH;
  const villageClayProduction = villageObject.clayProductionPerH;
  const villageIronProduction = villageObject.ironProductionPerH;
  const villageWheatProduction = villageObject.wheatProductionPerH;

  const findWarehouseInVillage = villageObject.villageBuildings.find(
    (building) => building.type === "warehouse"
  );

  const findGranaryInVillage = villageObject.villageBuildings.find(
    (building) => building.type === "granary"
  );

  const warehouseAllLevels = await getBuildingById("warehouse");
  const granaryAllLevels = await getBuildingById("warehouse");

  const warehouseMaxResourcesForCurrentLevel = findWarehouseInVillage
    ? warehouseAllLevels.levels[0][`${findWarehouseInVillage.level}`]
        .warehouseResourceLimit
    : 800;

  const granaryMaxResourcesForCurrentLevel = findGranaryInVillage
    ? granaryAllLevels.levels[0][`${findGranaryInVillage.level}`]
        .warehouseResourceLimit
    : 800;

  const date1 = dayjs(serverTime);
  const date2 = dayjs(lastVillageUpdateTime);
  const diffInMS = date1.diff(date2);

  const diffInH = dayjs.duration(diffInMS).asHours();

  const woodCalculation =
    villageObject.resourcesStorage.woodAmount + villageWoodProduction * diffInH;
  const clayCalculation =
    villageObject.resourcesStorage.clayAmount + villageClayProduction * diffInH;
  const ironCalculation =
    villageObject.resourcesStorage.ironAmount + villageIronProduction * diffInH;
  const wheatCalculation =
    villageObject.resourcesStorage.wheatAmount +
    villageWheatProduction * diffInH;

  const updateStorageWith = {
    woodAmount:
      woodCalculation > warehouseMaxResourcesForCurrentLevel
        ? warehouseMaxResourcesForCurrentLevel
        : woodCalculation,
    clayAmount:
      clayCalculation > warehouseMaxResourcesForCurrentLevel
        ? warehouseMaxResourcesForCurrentLevel
        : clayCalculation,
    ironAmount:
      ironCalculation > warehouseMaxResourcesForCurrentLevel
        ? warehouseMaxResourcesForCurrentLevel
        : ironCalculation,
    wheatAmount:
      wheatCalculation > granaryMaxResourcesForCurrentLevel
        ? granaryMaxResourcesForCurrentLevel
        : wheatCalculation,
  };

  const village = await Village.findOne({_id: villageId});
  village.resourcesStorage = updateStorageWith;
  village.save();

  console.log("updateStorageWith", updateStorageWith);

  console.log("Updated resources and current date/time field!");

  return updateStorageWith;
}

export {updateResourcesToDate};
