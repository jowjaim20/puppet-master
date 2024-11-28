import dotenv from "dotenv";
dotenv.config();
import express from "express";
import taskRouter from "./cheerio/cheerio.route";
import lottoRouter2 from "./lotto-scrapper/lotto.route";
import lottoRouter3 from "./lotto-scrapper3/lotto.route";
import lottoRouter4 from "./lotto-scrapper4/lotto.route";
import lottoRouter5 from "./lotto-scrapper5/lotto.route";
import lottoRouter6 from "./lotto-scrapper6/lotto.route";
import lottoRouter7 from "./lotto-scrapper-mega-mil/lotto.route";
import lottoRouter8 from "./lotto-scrapper-euro/lotto.route";
import lottoRouter9 from "./lotto-scrapper-powerball/lotto.route";

import pingRouter from "./ping/ping.route";

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
app.use("/ping", pingRouter);

app.use("/scrape", taskRouter);
app.use("/lotto2", lottoRouter2);
app.use("/lotto3", lottoRouter3);
app.use("/lotto4", lottoRouter4);
app.use("/lotto5", lottoRouter5);
app.use("/lotto6", lottoRouter6);
app.use("/lottomegamil", lottoRouter7);
app.use("/lottoeuro", lottoRouter8);
app.use("/powerball", lottoRouter9);

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
