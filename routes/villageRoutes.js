import express from "express";

import {endpointGetVillageById} from "../controllers/villageController.js";
import authenticateUser from "../middleware/auth.js";

const router = express.Router();

router.route("/:id").get(endpointGetVillageById);

export default router;
