import express from "express";
import {postBuilding, postUnitsBuild} from "../controllers/buildController.js";

const router = express.Router();

router.route("/buildings").post(postBuilding);
router.route("/units").post(postUnitsBuild);

export default router;
