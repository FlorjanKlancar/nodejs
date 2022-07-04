import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import Village from "../models/Village.js";

const getUserByIdEndpoint = async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).send("No user found");
  }

  const villages = await Village.find({})
    .select({
      population: 1,
      createdAt: 1,
      userId: 1,
    })
    .sort({ population: -1 });

  const getUserPositionOnLadder = villages.findIndex(
    (village) => village.userId.toString() === user._id.toString()
  );

  res.status(StatusCodes.OK).json({
    user,
    villageResponse: villages[getUserPositionOnLadder],
    positionOnLadder: getUserPositionOnLadder + 1,
  });
};

const updateUserEndpoint = async (req, res) => {
  const { id } = req.params;
  const { displayName, heroIcon } = req.body;

  const user = await User.findOne({ _id: id });

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).send("No user found");
  }

  if (displayName && displayName.length) {
    user.displayName = displayName;
  }
  if (heroIcon && heroIcon.length) {
    user.heroIcon = heroIcon;
  }

  const updatedUser = await user.save();

  res.status(StatusCodes.OK).json(updatedUser);
};

export { getUserByIdEndpoint, updateUserEndpoint };
