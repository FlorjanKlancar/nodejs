import express from "express";
import cors from "cors";
import "express-async-errors";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import notFoundMiddleware from "./middleware/not-found.js";
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

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

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
    origin: "https://dem-mongo.vercel.app",
  },
});
io.on("connection", (socket) => {
  console.log("client connected: ", socket.id);

  socket.on("disconnect", (reason) => {
    console.log("disconnect", reason);
  });

  socket.on("addUserToQueue", async ({ userId, selectedSquad }) => {
    console.log("socket", socket.id);
    const response = await addUserToQueue(userId, selectedSquad, socket.id);

    socket.emit("queueResponse", { response });
    if (response.status === 200) {
      const battleResponse = await matchUsersInQueue(response.userId);

      if (battleResponse.status === 200) {
        setTimeout(() => {
          socket.emit("matchFoundWaitingForAccept", {
            response: battleResponse.battle,
          });
          socket
            .to(battleResponse.battle.playerTwoSocketId)
            .emit("matchFoundWaitingForAccept", {
              response: battleResponse.battle,
            });
        }, 1500);
      }
    }
  });

  socket.on("cancelUserFromQueue", async ({ userId }) => {
    const response = await cancelQueue(userId);

    socket.emit("cancelResponse", { response });
  });

  socket.on("matchAccepted", async ({ sessionId: userId, battleInfo }) => {
    const response = await confirmBattle(userId, battleInfo);

    console.log({ response });
    if (response.status === 200) {
      socket.emit("matchAcceptedByUser", {
        response: response.msg,
      });
    }

    if (response.status === 201) {
      io.emit("matchCreated", {
        response: response.msg,
      });

      //this is not good, it sends the msg to all clients - correct way:CREATE ROOM AND JOIN TWO SOCKET IDS send them msg
    }
  });
});
