import dotenv from "dotenv";
dotenv.config();
import express from "express";
import taskRouter from "./routes/task";
import scrapeRouter from "./routes/scrape";

import bodyParser from "body-parser";
const PORT = process.env.PORT || 3500;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Express + TypeScript test");
});

app.use("/task", taskRouter);
app.use("/scrape", scrapeRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
