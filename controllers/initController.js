import { StatusCodes } from "http-status-codes";
import Building from "../models/Building.js";
import Rank from "../models/Rank.js";
import Unit from "../models/Unit.js";
import { createBuildings } from "../utils/createBuildings.js";
import { createRankings } from "../utils/createRankings.js";
import { createUnits } from "../utils/createUnits.js";

const initController = async (req, res) => {
  createBuildings.forEach(async (item) => {
    const building = new Building({
      type: item.type,
      name: item.name,
      description: item.description,
      image: item.image,
      levels: item.levels,
    });

    building.save();
  });

  createUnits.forEach(async (item) => {
    const unit = new Unit({
      unitName: item.unitName,
      costWood: item.costWood,
      costClay: item.costClay,
      costIron: item.costIron,
      costWheat: item.costWheat,
      timeToBuild: item.timeToBuild,
      attack: item.attack,
      defense: item.defense,
      type: item.type,
      upkeep: item.upkeep,
      unitIcon: item.unitIcon,
      unitBuilding: item.unitBuilding,
    });

    unit.save();
  });

  createRankings.forEach(async (item) => {
    const rank = new Rank({
      rank: item.rank,
      upToElo: item.upToElo,
      upkeepLimit: item.upkeepLimit,
      rankIcon: item.rankIcon,
    });

    rank.save();
  });

  res.status(StatusCodes.OK).json("response");
};

export { initController };
