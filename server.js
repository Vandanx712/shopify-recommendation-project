import express from "express";
import dotenv from "dotenv";
import cors from 'cors'

dotenv.config();

const port = process.env.PORT;

const app = express(cors());

app.use(express.json());

app.post("/api/track", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const userAgent = req.headers["user-agent"];

  const event = {
    ...req.body,
    ip,
    userAgent,
    receivedAt: new Date(),
  };

  console.log("📦 EVENT RECEIVED:");
  console.log(JSON.stringify(event, null, 2));

  res.status(200).json({ success: true });
});

app.listen(port, () => console.log(`app run on ${port}`));
