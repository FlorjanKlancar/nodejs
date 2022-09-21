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
    return {
      status: 400,
      msg: `No user found`,
    };
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

const calculateWinner = (player1, player2) => {
  return "You won";
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
    });

    await battle.save();

    await Queue.findOneAndRemove({ userId: firstPlayer.userId });
    await Queue.findOneAndRemove({ userId: findOpponent.userId });

    /*    const firstPlayerVillage = await Village.findOne({
      userId: firstPlayer.userId,
    });
    const findOpponentVillage = await Village.findOne({
      userId: findOpponent.userId,
    });

    const updateUnitsFirstPlayer = firstPlayerVillage.units.map(
      (villageUnit) => {
        const foundUnit = firstPlayer.unitsInQueue.find((fightUnit) => {
          if (villageUnit.name === fightUnit.name) {
            return fightUnit;
          }
        });

        return {
          _id: villageUnit._id,
          level: foundUnit ? foundUnit.level : villageUnit.level,
          name: villageUnit.name,
          amount: foundUnit
            ? villageUnit.amount + foundUnit.amount
            : villageUnit.amount,
        };
      }
    );
    const updateUnitsfindOpponent = findOpponentVillage.units.map(
      (villageUnit) => {
        const foundUnit = findOpponent.unitsInQueue.find((fightUnit) => {
          if (villageUnit.name === fightUnit.name) {
            return fightUnit;
          }
        });

        return {
          _id: villageUnit._id,
          level: foundUnit ? foundUnit.level : villageUnit.level,
          name: villageUnit.name,
          amount: foundUnit
            ? villageUnit.amount + foundUnit.amount
            : villageUnit.amount,
        };
      }
    );

    firstPlayerVillage.units = updateUnitsFirstPlayer;
    await firstPlayerVillage.save();
    findOpponentVillage.units = updateUnitsfindOpponent;
    await findOpponentVillage.save(); */

    return { status: 200, battle };
  } else return { status: 400, msg: "No opponent found yet!" };
};

const cancelQueue = async (userId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return {
      status: 400,
      msg: `No user found`,
    };
  }

  const findInQueue = await Queue.findOneAndRemove({ userId: userId });
  if (!findInQueue)
    return {
      status: 400,
      msg: `This user is not in queue`,
    };

  const village = await Village.findOne({ userId: userId });

  const updateUnits = village.units.map((villageUnit) => {
    const foundUnit = findInQueue.unitsInQueue.find((fightUnit) => {
      if (villageUnit.name === fightUnit.name) {
        return fightUnit;
      }
    });

    return {
      _id: villageUnit._id,
      level: foundUnit ? foundUnit.level : villageUnit.level,
      name: villageUnit.name,
      amount: foundUnit
        ? villageUnit.amount + foundUnit.amount
        : villageUnit.amount,
    };
  });

  village.units = updateUnits;
  await village.save();

  return {
    status: 200,
    msg: `Removed user from queue!`,
    updateUnits,
  };
};

export { addUserToQueue, matchUsersInQueue, cancelQueue };
