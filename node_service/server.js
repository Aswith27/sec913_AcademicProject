const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/subscription_management")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Schema
const LogSchema = new mongoose.Schema({
  user: String,
  action: String,
  plan: String,
  timestamp: String,
});

// Collection
const Log = mongoose.model("subscription_logs", LogSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("Node + MongoDB Service Running");
});

// GET All Logs
app.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find();
    res.json(logs);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// POST New Log
app.post("/logs", async (req, res) => {
  try {
    const log = new Log(req.body);

    await log.save();

    res.status(201).json({
      message: "Log saved successfully",
      data: log,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// Test POST Route
app.post("/test", (req, res) => {
  res.json({
    message: "POST works",
  });
});

mongoose.connect(
  "mongodb://127.0.0.1:27017/subscription_management"
);

const LogSchema = new mongoose.Schema({
  user: String,
  action: String,
  plan: String,
  timestamp: String
});

const Log = mongoose.model(
  "subscription_logs",
  LogSchema
);


// Start Server
app.listen(3001, () => {
  console.log("🚀 Node Server Running On Port 3001");
});