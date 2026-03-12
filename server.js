import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./src/db/db.js";
import indexRouter from "./src/routes/index.route.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: [process.env.URL,"http://localhost:3000",true], // frontend URL
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api", indexRouter);

await connectDb();

app.listen(port, () => console.log(`app run on ${port}`));
