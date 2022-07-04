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

dotenv.config();

const app = express();
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

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
