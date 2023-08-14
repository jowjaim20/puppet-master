import { Request, Response } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

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
    const parentContainer = $("#product-loop");
    const childs = parentContainer.children();
    childs.each((i, el) => {
      const text = $(el).find("div.product-info > div > a").text();
      testArr.push(text.trim());
    });

    const isLastChildCurrent = await isLastChildHas(page, $);
    !isLastChildCurrent && (await goToNextPage(page));
    isDisabled = isLastChildCurrent;
  }

  await browser.close();

  res.status(200).json({
    text: testArr
  });
};

const getText = () => {};

const goToNextPage = async (page: Page) => {
  try {
    await page.click("#pagination > a:nth-child(4)");
  } catch (error) {
    console.log(error);
  }
};

const isLastChildHas = async (page: Page, $: cheerio.CheerioAPI) => {
  const parentElement = $("#pagination");

  const lastChild = parentElement.find(":last-child");
  const isLastChildCurrent = lastChild.hasClass("current");
  return isLastChildCurrent;
};

export { startTask };
