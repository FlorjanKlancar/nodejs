import express from "express";
import {getBuildingsEndpoint} from "../controllers/gsBuildingsController.js";

const router = express.Router();

router.route("/").get(getBuildingsEndpoint);

export default router;
