import express from "express";
import cors from "cors";
import "express-async-errors";

import dotenv from "dotenv";
import gsBuildingsRouter from "./routes/gsBuildingsRoutes.js";
import initRouter from "./routes/initRoutes.js";
import gsUnitsRouter from "./routes/gsUnitsRoutes.js";
import villageRouter from "./routes/villageRoutes.js";
import buildRouter from "./routes/buildRoutes.js";
import connectDb from "./db/connect.js";
import statisticRouter from "./routes/statisticsRoutes.js";
import userInfoRouter from "./routes/userInfoRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import {
  addUserToQueue,
  cancelQueue,
  matchUsersInQueue,
} from "./controllers/queueController.js";
import battleRouter from "./routes/battleRoutes.js";
import { confirmBattle } from "./controllers/battlesController.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome from nodejss!");
});

app.use("/api/gsBuildings", gsBuildingsRouter);
app.use("/api/gsUnits", gsUnitsRouter);
app.use("/api/village", villageRouter);
app.use("/api/build", buildRouter);
app.use("/api/init", initRouter);
app.use("/api/statistics", statisticRouter);
app.use("/api/user", userInfoRouter);
app.use("/api/battle", battleRouter);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    httpServer.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

//instead of queueRoom we can just save clients in array
let clientsArray = [];
let battleRoomArray = [];
io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("disconnect", reason);
  });

  //we save users id and create a separate channel to talk only to them
  //userId nared iz user idja in ne iz socket idja
  const userId = socket.id;

  //This function calls everytime that new client is connected so we don't need an interval?

  socket.on("addUserToQueue", async ({ userId, selectedSquad }) => {
    //We check if userId already exists and delete it from clientArray so that we dont have 2 same clients
    const i = clientsArray.findIndex((e) => e.userId === userId);
    if (i > -1) {
      clientsArray.splice(i, 1);
    }
    //mmr je treba preverjat iz serverja, zaenkrat sm ga dal na 1000
    let tmpPayload = {
      userId: userId,
      selectedSquad: selectedSquad,
      socketId: socket.id,
      connectionTime: new Date(),
      MMR: 1000,
      matchedWithOpponent: false,
      currentOpponent: null,
      opponentSocket: null,
      matchAccepted: false,
      roomName: null,
    };

    let matchAcceptPayload = {
      matchAcceptStartDate: new Date(),
    };
    if (clientsArray.length > 0)
      for await (let x of clientsArray) {
        if (x.MMR > tmpPayload.MMR) {
          if (x.MMR - tmpPayload.MMR >= 0 && x.MMR - tmpPayload.MMR <= 500) {
            if (!x.matchedWithOpponent) {
              x.currentOpponent = tmpPayload.userId;
              x.opponentSocket = tmpPayload.socketId;
              console.log("prvi " + x.socketId);
              console.log("drugi " + tmpPayload.socketId);
              socket.join(x.socketId);
              socket.join(tmpPayload.socketId);
              io.to(x.socketId)
                .to(tmpPayload.socketId)
                .emit("acceptMatch", matchAcceptPayload);
              setMatchAcceptCountdown(x.socketId, tmpPayload.socketId);
              battleRoomArray.push({
                name: x.userId,
                player1: x.userId,
                player2: tmpPayload.userId,
              });
              x.matchedWithOpponent = true;
              tmpPayload.matchedWithOpponent = true;
              break;
            }
          }
        } else if (
          tmpPayload.MMR - x.MMR >= 0 &&
          tmpPayload.MMR - x.MMR <= 500
        ) {
          if (!x.matchedWithOpponent) {
            x.currentOpponent = tmpPayload.userId;
            x.opponentSocket = tmpPayload.socketId;
            console.log("prvi " + x.socketId);
            console.log("drugi " + tmpPayload.socketId);
            socket.join(x.socketId);
            socket.join(tmpPayload.socketId);
            io.to(x.socketId)
              .to(tmpPayload.socketId)
              .emit("acceptMatch", matchAcceptPayload);
            setMatchAcceptCountdown(x.socketId, tmpPayload.socketId);
            battleRoomArray.push({
              name: x.userId,
              player1: x.userId,
              player2: tmpPayload.userId,
            });
            x.matchedWithOpponent = true;
            tmpPayload.matchedWithOpponent = true;
            break;
          }
        }
      }

    clientsArray.push(tmpPayload);
    console.log(clientsArray);
  });

  const FIVE_MIN = 5 * 60 * 1000;

  let matchAcceptInTimePayload = {
    message: "Both players havent accepted the match",
  };

  function setMatchAcceptCountdown(p1Socket, p2Socket) {
    let timeToAccept = 30;

    var timerId = setInterval(countdown, 1000);

    function countdown() {
      if (timeToAccept == -1) {
        clearTimeout(timerId);
        console.log("cas je potekel");
        socket.join(p1Socket);
        socket.join(p2Socket);
        io.to(p1Socket)
          .to(p2Socket)
          .emit("matchNotAccepted", matchAcceptInTimePayload);
        //preverimo če sta igralca že v igri, drugače emitamo na client da sta timed out
      } else {
        timeToAccept--;
      }
    }
  }

  //na vsakih 10 sekund prevermo če kdo čaka več kot 5 min in ga skenslamo, al pa mu damo bota kasneje
  setInterval(() => {
    var date = new Date();
    for (let x in clientsArray) {
      if (
        date - clientsArray[x].connectionTime > FIVE_MIN &&
        !clientsArray[x].matchedWithOpponent
      ) {
        console.log(clientsArray[x].userId + " caka 5 min");
      }
    }
  }, 10000);

  socket.on("cancelUserFromQueue", async ({ userId }) => {
    const response = await cancelQueue(userId);

    socket.emit("cancelResponse", { response });
  });

  //mogoce je treba izbrat boljsa imena kot acceptMatch in matchAccepted
  socket.on("matchAccepted", async ({ userId, battleSquad }) => {
    //v arrayu dodaj da je en od igralcev sprejel match, ko sta oba sprejela nared nov room in obema pošl id do rooma

    let roomPayload = {
      name: null,
      player1: null,
      player2: null,
    };

    console.log("en je acceptov", userId);
    const i = clientsArray.findIndex((e) => e.userId === userId);
    if (i > -1) {
      clientsArray[i].matchAccepted = true;
      const y = battleRoomArray.findIndex(
        (e) => e.player1 === userId || e.player2 === userId
      );
      if (y > -1) {
        debugger;
        socket.join(battleRoomArray[y].name);
      }

      //poiščemo clienta ki ima nasprotnika in imata oba matchAccept na true, in jim dodelimo sobo
      debugger;
      console.log(JSON.stringify(battleRoomArray) + "to je room array");
      // for (let x in clientsArray) {
      //   if (clientsArray[x].currentOpponent) {
      //     if (clientsArray[x].matchAccepted) {
      //       const y = clientsArray.findIndex(
      //         (e) => e.userId === clientsArray[x].currentOpponent
      //       );
      //       if (y > -1) {
      //         socket.join(clientsArray[x].currentOpponent);
      //         battleRoomArray.push({});
      //       }
      //     }
      //   }
      // }
    }

    socket.on("greenButton", async ({ userId, battleRoom }) => {
      console.log(userId + " tale user je pritisnu zelen gumb");
      const i = battleRoomArray.findIndex(
        (e) => e.player1 === userId || e.player2 === userId
      );
      if (i > -1) {
        io.to(battleRoomArray[i].name).emit("serverResponseGreen", userId);
      }
    });

    socket.on("redButton", async ({ userId, battleRoom }) => {
      console.log(userId + " tale user je pritisnu rdec gumb");
      const i = battleRoomArray.findIndex(
        (e) => e.player1 === userId || e.player2 === userId
      );
      if (i > -1) {
        io.to(battleRoomArray[i].name).emit("serverResponseGreen", userId);
      }
    });
  });
});
