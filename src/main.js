import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));

// ✅ Root route (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("🚀 NSG Backend is LIVE");
});

// ✅ Health route
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ✅ Google callback test
app.get("/auth/google/callback", (req, res) => {
  res.send("Google callback working ✅");
});

// ✅ IMPORTANT: Railway PORT fix
const PORT = process.env.PORT;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});