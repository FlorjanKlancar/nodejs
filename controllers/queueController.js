import Battle from "../models/Battle.js";
import Queue from "../models/Queue.js";
import User from "../models/User.js";
import Village from "../models/Village.js";
import { getVillageById } from "./villageController.js";

const ELO_DIFFERENCE = 300;

const checkIfUserAlreadyInQ = async (userId) => {
  const userInQ = await Queue.findOne({ userId: userId });

  if (userInQ) {
    return true;
  } else {
    return false;
  }
};

const addUserToQueue = async (userId, selectedSquad, socketId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).send("No user found");
  }

  const { units: currentVillageUnits, elo } = await getVillageById(userId);

  const updatedUnitsInVillage = currentVillageUnits.map((unitInVillage) => {
    const findUnit = selectedSquad.find(
      (unit) => unit.name === unitInVillage.name
    );
    if (findUnit && unitInVillage.name === findUnit.name) {
      if (unitInVillage.amount < findUnit.amount) {
        return {
          status: 400,
          msg: `Not enough units in village - ${findUnit.name}`,
        };
      }
      return {
        _id: unitInVillage._id,
        level: unitInVillage.level,
        name: unitInVillage.name,
        amount: unitInVillage.amount - findUnit.amount,
      };
    } else {
      return {
        _id: unitInVillage._id,
        level: unitInVillage.level,
        name: unitInVillage.name,
        amount: unitInVillage.amount,
      };
    }
  });

  const isUserAlreadyInQueue = await checkIfUserAlreadyInQ(userId);
  if (isUserAlreadyInQueue) {
    return { status: 400, msg: "User is already in queue" };
  } else {
    const village = await Village.findOne({ userId: userId });

    village.units = updatedUnitsInVillage;
    await village.save();

    const addUserToQ = new Queue({
      userId,
      unitsInQueue: selectedSquad,
      elo,
      socketId,
    });
    await addUserToQ.save();

    return { status: 200, msg: "User added to queue", userId };
  }
};

const matchUsersInQueue = async (userId) => {
  const queue = await Queue.find({}).sort({ createdAt: -1 });

  const firstPlayer = queue.find(
    (player) => player.userId.toString() === userId
  );
  const findOpponent = queue.find((player) => {
    if (player.userId !== userId) {
      if (Math.abs(player.elo - firstPlayer.elo) < ELO_DIFFERENCE) {
        return player;
      }
    }
  });

  if (findOpponent) {
    const battle = new Battle({
      playerOne: firstPlayer.userId,
      playerTwo: findOpponent.userId,

      unitsPlayerOne: firstPlayer.unitsInQueue,
      unitsPlayerTwo: findOpponent.unitsInQueue,
      eloPlayerOne: firstPlayer.elo,
      eloPlayerTwo: findOpponent.elo,

      playerOneSocketId: firstPlayer.socketId,
      playerTwoSocketId: findOpponent.socketId,
      winner: "Calculate",
    });

    await battle.save();

    await Queue.findOneAndRemove({ userId: firstPlayer.userId });
    await Queue.findOneAndRemove({ userId: findOpponent.userId });

    return { status: 200, battle };
  } else return { status: 400, msg: "No opponent found yet!" };
};

export { addUserToQueue, matchUsersInQueue };
