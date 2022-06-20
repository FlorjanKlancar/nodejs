import {StatusCodes} from "http-status-codes";
import Unit from "../models/Unit.js";

const getUnitsEndpoint = async (req, res, next) => {
  const response = await Unit.find({});

  return res.status(StatusCodes.OK).json(response);
};

export {getUnitsEndpoint};
