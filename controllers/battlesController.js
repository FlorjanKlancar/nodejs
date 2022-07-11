import {StatusCodes} from "http-status-codes";
import Battle from "../models/Battle.js";

const getBattlesForUser = async (req, res) => {
  const {userId} = req.params;

  const battles = await Battle.find({
    $or: [
      {
        playerOne: userId,
      },
      {
        playerTwo: userId,
      },
    ],
  }).sort({createdAt: -1});

  const filterUnReadBattles = battles.filter((battle) => battle.newReport);

  res
    .status(StatusCodes.OK)
    .json({battles, newReports: filterUnReadBattles.length});
};

const getBattleById = async (req, res) => {
  const {battleId} = req.params;

  const battle = await Battle.findOneAndUpdate(
    {
      _id: battleId,
    },
    {
      newReport: false,
    }
  );

  console.log("battle", battle);
  if (!battle) return res.status(StatusCodes.NOT_FOUND).send("Not found");

  res.status(StatusCodes.OK).json(battle);
};

export {getBattlesForUser, getBattleById};
