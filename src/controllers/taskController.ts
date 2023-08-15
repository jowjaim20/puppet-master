import { Request, Response } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

const startTask = async (req: Request, res: Response) => {
  const link = req.body?.url;
  const pContainerClass = req.body?.pContainerClass;
  const titleSelector = req.body?.titleSelector;
  const hasPagination = req.body?.hasPagination;
  const dateSelector = req.body?.dateSelector;
  const priceSelector = req.body?.priceSelector;

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
  const testArr: any[] = [];

  // await page.screenshot({ path: "example.png" });
  let isDisabled = false;
  while (!isDisabled) {
    const $ = cheerio.load(await page.content());
    const parentContainer = $(pContainerClass);
    const childs = parentContainer.children();
    childs.each((i, el) => {
      const title = getText(titleSelector, el, $);
      const date =
        new Date(getText(dateSelector, el, $)).toLocaleDateString() ||
        new Date().toLocaleDateString();
      const price = getText(priceSelector, el, $);

      const schedule = {
        title,
        date,
        price
      };
      testArr.push(schedule);
    });

    if (hasPagination) {
      const isLastChildCurrent = await isLastChildHas(page, $);
      !isLastChildCurrent && (await goToNextPage(page));
      isDisabled = isLastChildCurrent;
    } else {
      isDisabled = true;
    }
  }

  await browser.close();

  res.status(200).json({
    text: testArr
  });
};

const getText = (
  selector: string,
  el: cheerio.Element,
  $: cheerio.CheerioAPI
) => {
  return selector ? $(el).find(selector).text().trim() : $(el).text().trim();
};

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
