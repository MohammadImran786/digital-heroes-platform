import express from "express";

import {
  simulateDraw,
  publishDraw,
  getPublishedDraws,
  getMyWinnings,
} from "../controllers/drawController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get(
  "/",
  requireAuth,
  getPublishedDraws
);

router.get(
  "/my-winnings",
  requireAuth,
  getMyWinnings
);

router.post(
  "/simulate",
  requireAuth,
  requireAdmin,
  simulateDraw
);

router.post(
  "/publish",
  requireAuth,
  requireAdmin,
  publishDraw
);

export default router;