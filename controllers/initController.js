import { StatusCodes } from "http-status-codes";
import Building from "../models/Building.js";
import { createBuildings } from "../utils/createBuildings.js";

const initController = async (req, res) => {
  createBuildings.forEach(async (item) => {
    console.log(item);
    const building = new Building({
      type: item.type,
      description: item.description,
      image: item.image,
      levels: item.levels,
    });

    building.save();
  });

  res.status(StatusCodes.OK).json("response");
};

export { initController };
