import { Request, Response } from "express";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

const startTask = async (req: Request, res: Response) => {
  const link = req.body?.url;
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
  await page.goto(link);
  const testArr: string[] = [];

  // await page.screenshot({ path: "example.png" });
  let isDisabled = false;
  while (!isDisabled) {
    const $ = cheerio.load(await page.content());
    const sib = $("#product-loop");
    const child = sib.children();
    child.each((i, el) => {
      const text = $(el).find("div.product-info > div > a").text();
      testArr.push(text.trim());
    });

    console.log("testArr", testArr);

    // await page.waitForSelector("#pagination > a:nth-child(4)", {
    //   visible: true
    // });

    const parentElement = $("#pagination");

    // Check if the last span has the "current" class
    const lastChild = parentElement.find(":last-child");
    const isLastChildCurrent = lastChild.hasClass("current");
    console.log("isLastSpanCurrent", isLastChildCurrent);

    isDisabled = isLastChildCurrent;

    if (!isLastChildCurrent) {
      try {
        await page.click("#pagination > a:nth-child(4)");
      } catch (error) {
        console.log(error);
      }
      // await page.waitForNavigation();
    }
  }

  await browser.close();

  res.status(200).json({
    text: testArr
  });
};

export { startTask };
