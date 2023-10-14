import { Request, Response, NextFunction } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";
import { Scraper } from "./cheerio.services";
import axios from "axios";

const startTask = async (req: Request, res: Response) => {
  const { link, scrapeTasks }: ScrapeRequest = req.body;
  console.time("task");

  const data: Record<string, unknown> = {};

  let html;

  // try {
  //   const data = await axios.get(link);
  //   html = data.data;
  // } catch (error) {
  //   res.status(500).json({
  //     error: "something went wrong"
  //   });
  //   return;
  // }
  console.time("puppetter");

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      // "--single-process",
      "--no-zygote"
    ],
    headless: "new",
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath()
  });
  const page = await browser.newPage();
  await page.goto(link, { waitUntil: "domcontentloaded" });
  html = await page.content();
  await browser.close();
  console.timeEnd("puppetter");
  console.time("cheerio");

  const $ = cheerio.load(html);

  const scraper = new Scraper();

  scraper.mainTask(scrapeTasks, $, data);

  console.timeEnd("task");
  console.timeEnd("cheerio");

  res.status(200).json(data);
};

export { startTask };
