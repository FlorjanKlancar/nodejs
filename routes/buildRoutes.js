import express from "express";
import { postBuilding } from "../controllers/buildController.js";

const router = express.Router();

router.route("/buildings").post(postBuilding);
router.route("/units").post();

export default router;
