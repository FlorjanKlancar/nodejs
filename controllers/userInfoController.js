import {StatusCodes} from "http-status-codes";
import User from "../models/User.js";

const getUserByIdEndpoint = async (req, res) => {
  const {id} = req.params;

  const user = await User.findOne({_id: id});

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).send("No user found");
  }

  res.status(StatusCodes.OK).json(user);
};

const updateUserEndpoint = async (req, res) => {
  const {id} = req.params;
  const {displayName, heroIcon} = req.body;

  const user = await User.findOne({_id: id});

  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).send("No user found");
  }

  if (displayName.length) {
    user.displayName = displayName;
  }
  if (heroIcon.length) {
    user.heroIcon = heroIcon;
  }

  const updatedUser = await user.save();

  res.status(StatusCodes.OK).json(updatedUser);
};

export {getUserByIdEndpoint, updateUserEndpoint};
