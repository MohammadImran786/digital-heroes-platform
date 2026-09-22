import express from "express";

import {
  getMySubscription,
  createCheckoutSession,
  cancelSubscription,
} from "../controllers/subscriptionController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", requireAuth, getMySubscription);

router.post("/checkout", requireAuth, createCheckoutSession);

router.post("/cancel", requireAuth, cancelSubscription);

export default router;