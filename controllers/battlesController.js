import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import Battle from "../models/Battle.js";
import User from "../models/User.js";

const getBattlesForUser = async (req, res) => {
  const { userId } = req.params;

  const battles = await Battle.find({
    $or: [
      {
        playerOne: userId,
      },
      {
        playerTwo: userId,
      },
    ],
  }).sort({ createdAt: -1 });

  const filterUnReadBattles = battles.filter((battle) => battle.newReport);

  res
    .status(StatusCodes.OK)
    .json({ battles, newReports: filterUnReadBattles.length });
};

const getBattleById = async (req, res) => {
  const { battleId } = req.params;

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

const confirmBattle = async (userId, battleInfo) => {
  if (!userId || !battleInfo) return { status: 500, msg: "Missing parameters" };

  const user = await User.findOne({ _id: userId });
  if (!user) return { status: 404, msg: "User not found" };

  const battleDoc = await Battle.findOne({
    _id: battleInfo._id,
  });

  if (!battleDoc) return { status: 404, msg: "Battle not found" };
  if (!dayjs().diff(battleDoc.createdAt, "seconds") > 60) {
    await Battle.findOneAndRemove({ _id: battleInfo._id });
    return { status: 500, msg: "Time for battle expired" };
  }

  const generatedUpdateAcceptedField =
    battleDoc.playerOne === userId
      ? { playerOneAccepted: true }
      : { playerTwoAccepted: true };

  const updatedBattle = await Battle.findOneAndUpdate(
    {
      _id: battleInfo._id,
    },
    generatedUpdateAcceptedField
  );

  const checkUpdatedDocument = {
    ...updatedBattle._doc,
    ...generatedUpdateAcceptedField,
  };

  if (
    !checkUpdatedDocument.playerOneAccepted ||
    !checkUpdatedDocument.playerTwoAccepted
  )
    return {
      status: 200,
      msg: "Match has been accepted by you. Waiting for opponent!",
    };
  else
    return {
      status: 201,
      msg: "Found opponent create room!",
      battleDocument: checkUpdatedDocument,
    };
};

export { getBattlesForUser, getBattleById, confirmBattle };
