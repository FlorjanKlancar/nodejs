import Village from "../models/Village.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnAuthenticatedError,
  NotFoundError,
} from "../errors/index.js";

const getAllVillages = async (req, res) => {
  const response = await Village.find({});

  res.status(StatusCodes.OK).json(response);
};

const getVillageById = async (villageId) => {
  const response = await Village.find({ _id: villageId });

  return response;
};
export { getAllVillages, getVillageById };
