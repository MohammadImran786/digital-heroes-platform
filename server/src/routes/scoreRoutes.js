import express from "express";

import {
  getScores,
  createScore,
  updateScore,
  deleteScore,
} from "../controllers/scoreController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getScores);

router.post("/", requireAuth, createScore);

router.put("/:id", requireAuth, updateScore);

router.delete("/:id", requireAuth, deleteScore);

export default router;