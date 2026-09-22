import express from "express";

import {
  getAdminOverview,
  getUsers,
  updateUser,
  updateUserSubscription,
  getUserScores,
  updateUserScore,
  deleteUserScore,
  createCharity,
  updateCharity,
  deleteCharity,
  getReports,
} from "../controllers/adminController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

/* Overview */
router.get("/overview", getAdminOverview);

/* Users */
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);

router.patch(
  "/users/:userId/subscription",
  updateUserSubscription
);

/* Scores */
router.get(
  "/users/:userId/scores",
  getUserScores
);

router.patch(
  "/scores/:scoreId",
  updateUserScore
);

router.delete(
  "/scores/:scoreId",
  deleteUserScore
);

/* Charities */
router.post(
  "/charities",
  createCharity
);

router.patch(
  "/charities/:id",
  updateCharity
);

router.delete(
  "/charities/:id",
  deleteCharity
);

/* Reports */
router.get(
  "/reports",
  getReports
);

export default router;