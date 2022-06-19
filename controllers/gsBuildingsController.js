import {StatusCodes} from "http-status-codes";
import Building from "../models/Building.js";

const getBuildingById = async (buildingId) => {
  const response = await Building.find({type: buildingId});

  return response;
};
export {getBuildingById};
