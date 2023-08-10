import { Request, Response } from "express";
import puppeteer from "puppeteer";

const startTask = async (req: Request, res: Response) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://google.com");
  await page.screenshot({ path: "example.png" });
  await browser.close();

  res.status(200).send("done");
};

export { startTask };
