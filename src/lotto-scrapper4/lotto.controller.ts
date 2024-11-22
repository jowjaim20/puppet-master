import { Request, Response, NextFunction } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import axios from "axios";
import { addResult, fetchData658 } from "./lotto.services";
import { fetchPCSO } from "../controllers/fetchPCSO";

const startTask = async (req: Request, res: Response) => {
  //   addResult({ date: "2024-11-21", game_id: 4, numbers: [1, 2, 3, 4, 5, 6] });
  const { index }: ScrapeRequest = req.body;
  console.log("index", index);

  fetchPCSO(4);

  res.status(200).json({ status: 200 });
};

export { startTask };
