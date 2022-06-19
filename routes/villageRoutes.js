import express from "express";

import {
  getAllVillages,
  getVillageById,
} from "../controllers/villageController.js";
import authenticateUser from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(getAllVillages);
router.route("/:id").get(getVillageById);

export default router;
