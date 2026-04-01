import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

// Root route
app.get("/", (req, res) => res.send("🚀 NSG Backend is LIVE"));

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// Google callback test
app.get("/auth/google/callback", (req, res) => res.send("Google callback working ✅"));

// Railway port + 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));