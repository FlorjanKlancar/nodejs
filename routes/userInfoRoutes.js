import express from "express";
import {
  getUserByIdEndpoint,
  updateUserEndpoint,
} from "../controllers/userInfoController.js";

const router = express.Router();

router.route("/:id").get(getUserByIdEndpoint);
router.route("/:id").put(updateUserEndpoint);

export default router;
