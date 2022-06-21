import { StatusCodes } from "http-status-codes";
import Building from "../models/Building.js";

const getBuildingById = async (buildingId) => {
  const response = await Building.findOne({ type: buildingId });

  return response;
};

const getBuildingsEndpoint = async (req, res, next) => {
  const response = await Building.find({});

  return res.status(StatusCodes.OK).json(response);
};

export { getBuildingById, getBuildingsEndpoint };
