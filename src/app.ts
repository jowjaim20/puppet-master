import dotenv from "dotenv";
dotenv.config();
import express from "express";
import taskRouter from "./cheerio/cheerio.route";
import cors from "cors";

import bodyParser from "body-parser";
const PORT = process.env.PORT || 3500;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const whitelist = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://courseville-website-jowjaim20.vercel.app",
  "https://admin-courseville.netlify.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("origin", origin);
      if (whitelist.indexOf(origin || "") !== -1 || !origin) {
        console.log("origin", origin);
        callback(null, true);
      } else {
        callback(new Error("Not Allowed by Cors"));
      }
    },
    optionsSuccessStatus: 200
  })
);

app.get("/", (req, res) => {
  res.send("Express + TypeScript test");
});

app.use("/task", taskRouter);
app.use("/scrape", taskRouter);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
