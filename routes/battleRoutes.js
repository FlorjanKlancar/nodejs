import express from "express";
import {
  getBattleById,
  getBattlesForUser,
} from "../controllers/battlesController.js";

const router = express.Router();

router.route("/user/:userId").get(getBattlesForUser);
router.route("/:battleId").get(getBattleById);

export default router;
