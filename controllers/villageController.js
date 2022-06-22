import Village from "../models/Village.js";
import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  UnAuthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import { updateResourcesToDate } from "./gameController.js";
import { createUnits } from "../utils/createUnits.js";
import { newVillage } from "../utils/createVillageDummy.js";

const createVillage = async (req, res) => {
  if (!req.body.userId) {
    throw new BadRequestError("Missing userId!");
  }

  const checkVillages = await Village.findOne({
    userId: req.body.userId,
  });
  if (checkVillages) {
    throw new BadRequestError("Your village already exists!");
  }

  const allUnits = createUnits.map((unit) => {
    return {
      name: unit.unitName,
      amount: 5,
      level: 0,
    };
  });

  const village = new Village({
    ...newVillage,
    units: allUnits,
    userId: req.body.userId,
  });

  village.save();

  return res.status(StatusCodes.CREATED).json(village);
};

const getVillageById = async (villageId) => {
  const response = await Village.findOne({ userId: villageId });

  return response;
};

const endpointGetVillageByUserId = async (req, res, next) => {
  const { id } = req.params;

  const villageResponse = await Village.findOne({ userId: id });

  if (!villageResponse) {
    throw new NotFoundError("Village not found!");
  } else {
    const updatedResources = await updateResourcesToDate(
      villageResponse,
      villageResponse._id
    );

    villageResponse.resourcesStorage = updatedResources;

    return res.status(StatusCodes.OK).send(villageResponse);
  }
};

export { getVillageById, endpointGetVillageByUserId, createVillage };
