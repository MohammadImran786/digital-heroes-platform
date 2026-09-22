import express from "express";

import { getMemberDashboard } from "../controllers/memberController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  requireAuth,
  getMemberDashboard
);

export default router;