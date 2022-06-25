import { StatusCodes } from "http-status-codes";
import Village from "../models/Village.js";

const getStatisticsEndpoint = async (req, res) => {
  const villageResponse = await Village.find({}).select({
    population: 1,
    createdAt: 1,
  });

  if (!villageResponse) {
    throw new NotFoundError("Village not found!");
  } else {
    return res.status(StatusCodes.OK).send(villageResponse);
  }
};

export { getStatisticsEndpoint };
