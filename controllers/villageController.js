import Village from "../models/Village.js";
import {StatusCodes} from "http-status-codes";
import {
  BadRequestError,
  UnAuthenticatedError,
  NotFoundError,
} from "../errors/index.js";
import {updateResourcesToDate} from "./gameController.js";

const getVillageById = async (villageId) => {
  const response = await Village.find({_id: villageId});

  return response;
};

const endpointGetVillageById = async (req, res, next) => {
  const villageResponse = await Village.find({_id: req.params.id});

  if (!villageResponse.length) {
    throw new NotFoundError("Village not found!");
  } else {
    const updatedResources = await updateResourcesToDate(
      villageResponse[0],
      req.params.id
    );

    villageResponse[0].resourcesStorage = updatedResources;

    return res.status(StatusCodes.OK).send(villageResponse);
  }
};

export {getVillageById, endpointGetVillageById};
