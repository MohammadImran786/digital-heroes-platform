import express from "express";
import multer from "multer";

import {
  getMyWinners,
  uploadProof,
  getAdminWinners,
  reviewWinner,
  markWinnerPaid,
} from "../controllers/winnerController.js";

import { requireAuth } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG or PDF files are allowed"
        )
      );
    }

    cb(null, true);
  },
});

router.get(
  "/my",
  requireAuth,
  getMyWinners
);

router.post(
  "/:id/proof",
  requireAuth,
  upload.single("proof"),
  uploadProof
);

router.get(
  "/admin",
  requireAuth,
  requireAdmin,
  getAdminWinners
);

router.patch(
  "/:id/review",
  requireAuth,
  requireAdmin,
  reviewWinner
);

router.patch(
  "/:id/pay",
  requireAuth,
  requireAdmin,
  markWinnerPaid
);

export default router;