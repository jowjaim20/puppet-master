import { Request, Response } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

const startTask1 = async (req: Request, res: Response) => {
  const link = req.body?.link;
  const targetPageContainerSelector = req.body.targetPageContainerSelector;
  const titleSelector: Selector = req.body.titleSelector;
  const hasPagination = req.body.hasPagination;
  const dateSelector: Selector = req.body.dateSelector;
  const priceSelector: Selector = req.body.priceSelector;
  const testArr: any[] = [];
  console.time("browser");
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

  console.timeEnd("browser");

  console.time("loop");

  let isDisabled = false;
  while (!isDisabled) {
    const $ = cheerio.load(await page.content());
    const parentContainer = $(targetPageContainerSelector);
    const childs = parentContainer.children();
    for (let el of childs) {
      const getAlltext = async () => {
        const [title, date, price] = await Promise.all([
          getText(titleSelector, el, $),
          getText(dateSelector, el, $),
          getText(priceSelector, el, $)
        ]);

        const schedule = {
          title,
          date,
          price
        };

        return schedule;
      };
      const schedule = await getAlltext();

      testArr.push(schedule);
    }

    if (hasPagination) {
      const isLastChildCurrent = await isLastChildHas(page, $);
      !isLastChildCurrent && (await goToNextPage(page));
      isDisabled = isLastChildCurrent;
    } else {
      isDisabled = true;
    }
  }

  console.timeEnd("loop");

  await browser.close();

  res.status(200).json({
    text: testArr
  });
};

const isStringArray = (arr: any): arr is string[] => {
  return arr[0].length > 1 || arr.length === 0;
};

const isNotEmptyString = (string: string | string[]) => {
  return string !== "";
};

const getText = async (
  selector: Selector,
  el: cheerio.Element,
  $: cheerio.CheerioAPI
) => {
  let mainString: string | string[];

  const foundString = selector.selector
    ? $(el).find(selector.selector).text()
    : $(el).text();

  mainString = foundString;
  var x = 0,
    l = selector.task.length;
  while (x < l) {
    const task = selector.task[x];
    switch (task.type) {
      case "trim":
        if (isNotEmptyString(mainString) && typeof mainString === "string")
          mainString = mainString.trim();
        break;
      case "filter":
        if (isNotEmptyString(mainString) && isStringArray(mainString)) {
          const filterSearchString = task.includes.searchString;
          mainString = mainString.filter((text) =>
            text.includes(filterSearchString)
          );
        }
        break;
      case "find":
        if (isNotEmptyString(mainString) && isStringArray(mainString)) {
          const findSearchString = task.includes.searchString;
          mainString =
            mainString.find((text) => text.includes(findSearchString)) || "";
        }
        break;
      case "replace":
        if (isNotEmptyString(mainString) && typeof mainString === "string")
          mainString = mainString.replace(task.searchValue, task.replaceValue);

        break;
      case "split":
        if (isNotEmptyString(mainString) && typeof mainString === "string")
          mainString = mainString.split(task.separator);

        break;

      default:
        break;
    }
    x++;
  }

  return mainString;
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

export { startTask1 };
