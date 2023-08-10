import { Request, Response } from "express";
import puppeteer from "puppeteer";

const startTask = async (req: Request, res: Response) => {
  const link = req.body?.url;
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
    headless: "new",
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath()
  });
  const page = await browser.newPage();
  await page.goto(link);
  //   await page.screenshot({ path: "example.png" });
  await browser.close();

  res.status(200).send("done");
};

export { startTask };
