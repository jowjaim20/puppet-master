import dotenv from "dotenv";
dotenv.config();
import express from "express";
import taskRouter from "./routes/task";

const app = express();
const PORT = process.env.PORT || 3500;

app.get("/", (req, res) => {
  res.send("Express + TypeScript test");
});

app.use("/task", taskRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
