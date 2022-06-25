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

const getBuildingByIdEndpoint = async (req, res, next) => {
  const { id } = req.params;
  const response = await Building.findOne({ type: id });

  if (!response) {
    res.status(StatusCodes.BAD_REQUEST).send("No village");
  }

  return res.status(StatusCodes.OK).json(response);
};

export { getBuildingById, getBuildingsEndpoint, getBuildingByIdEndpoint };
