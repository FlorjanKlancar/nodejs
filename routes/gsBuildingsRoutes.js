import express from "express";
import {
  getBuildingByIdEndpoint,
  getBuildingsEndpoint,
} from "../controllers/gsBuildingsController.js";

const router = express.Router();

router.route("/").get(getBuildingsEndpoint);
router.route("/:id").get(getBuildingByIdEndpoint);

export default router;
