import "dotenv/config";

import express from "express";
import cors from "cors";

import scoreRoutes from "./routes/scoreRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import { stripeWebhook } from "./controllers/stripeWebhookController.js";
import drawRoutes from "./routes/drawRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// --- UPDATED DYNAMIC CORS MIDDLEWARE ---
const allowedOrigins = [
  "https://digital-heroes-platform-orcin.vercel.app",
  "https://digital-heroes-platform.vercel.app",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Postman, server-to-server, ya allowed domains ko approve karein
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev/Demo test ke liye cross-origin requests allow karein
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhook must receive the raw body
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Normal JSON requests
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Digital Heroes API is running",
  });
});

app.use("/api/scores", scoreRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/draws", drawRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});