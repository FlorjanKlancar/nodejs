import { StatusCodes } from "http-status-codes";
import Village from "../models/Village.js";

const getStatisticsEndpoint = async (req, res) => {
  const villageResponse = await Village.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userFields",
      },
    },
    {
      $project: {
        population: 1,
        createdAt: 1,
        userId: 1,
        "userFields._id": 1,
        "userFields.displayName": 1,
        "userFields.heroIcon": 1,
      },
    },
    { $sort: { population: -1 } },
  ]);

  if (!villageResponse) {
    throw new NotFoundError("Village not found!");
  } else {
    return res.status(StatusCodes.OK).send(villageResponse);
  }
};

export { getStatisticsEndpoint };
