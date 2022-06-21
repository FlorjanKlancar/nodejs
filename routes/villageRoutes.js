import express from "express";

import {
  createVillage,
  endpointGetVillageByUserId,
} from "../controllers/villageController.js";

const router = express.Router();

router.route("/:id").get(endpointGetVillageByUserId);
router.route("/").post(createVillage);

export default router;
