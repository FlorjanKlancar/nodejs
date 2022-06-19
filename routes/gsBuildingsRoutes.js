import express from "express";

const router = express.Router();

router.route("/:id").get();

export default router;
