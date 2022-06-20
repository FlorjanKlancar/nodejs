import express from "express";
import {getUnitsEndpoint} from "../controllers/gsUnitsController.js";

const router = express.Router();

router.route("/").get(getUnitsEndpoint);

export default router;
