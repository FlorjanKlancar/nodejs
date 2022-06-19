import express from "express";
import { initController } from "../controllers/initController.js";

const router = express.Router();

router.route("/").post(initController);

export default router;
