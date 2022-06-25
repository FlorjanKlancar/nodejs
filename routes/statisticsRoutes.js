import express from "express";
import { getStatisticsEndpoint } from "../controllers/statisticsController.js";

const router = express.Router();

router.route("/").get(getStatisticsEndpoint);

export default router;
