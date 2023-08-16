import { Request, Response } from "express";
import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

const KEYS = {
  filter: "filter",
  trim: "trim",
  replace: "replace",
  split: "split",
  find: "find"
} as const;

type taskPNames = keyof typeof KEYS;

type filterOptions<T extends typeof KEYS.filter> = {
  key: T;
  includes: {
    searchString: string;
  };
};
type findOptions<T extends typeof KEYS.find> = {
  key: T;
  includes: {
    searchString: string;
  };
};
type trimOptions<T extends typeof KEYS.trim> = {
  key: T;
};
type replaceOptions<T extends typeof KEYS.replace> = {
  key: T;
  searchValue: string;
  replaceValue: string;
};
type splitOptions<T extends typeof KEYS.split> = {
  key: T;
  separator: string;
};
interface Task<T extends taskPNames> {
  options: T extends typeof KEYS.filter
    ? filterOptions<T>
    : T extends typeof KEYS.trim
    ? trimOptions<T>
    : T extends typeof KEYS.replace
    ? replaceOptions<T>
    : T extends typeof KEYS.split
    ? splitOptions<T>
    : T extends typeof KEYS.find
    ? findOptions<T>
    : undefined;
}
// const stringTask: Task<taskPNames>[] = [
//   { options: { key: "trim" } },
//   { options: { key: "filter", includes: "d" } },
//   {
//     options: { key: "replace", replaceValue: "dfsdf", searchValue: "sdfsd" }
//   }
// ];

interface Selector {
  selector: "string";
  task: Task<taskPNames>[];
}

const startTask = async (req: Request, res: Response) => {
  const link = req.body?.url;
  const pContainerClass = req.body.pContainerClass;
  const titleSelector: Selector = req.body.titleSelector;
  const hasPagination = req.body.hasPagination;
  const dateSelector: Selector = req.body.dateSelector;
  const priceSelector: Selector = req.body.priceSelector;

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
        getText(dateSelector, el, $) || new Date().toLocaleDateString();
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

const isStringArray = (arr: any): arr is string[] => {
  return arr[0].length > 1 || arr.length === 0;
};

const getText = (
  selector: Selector,
  el: cheerio.Element,
  $: cheerio.CheerioAPI
) => {
  let mainString: string | string[];
  const foundString = selector.selector
    ? $(el).find(selector.selector).text()
    : $(el).text();
  mainString = foundString;
  for (let task of selector.task) {
    switch (task.options.key) {
      case "trim":
        if (typeof mainString === "string") mainString = mainString.trim();
        break;
      case "filter":
        const filterSearchString = task.options.includes.searchString;
        if (isStringArray(mainString))
          mainString = mainString.filter((text) =>
            text.includes(filterSearchString)
          );
        break;
      case "find":
        const findSearchString = task.options.includes.searchString;
        if (isStringArray(mainString)) {
          console.log("isArray");

          mainString =
            mainString.find((text) => text.includes(findSearchString)) || "";
        }
        break;
      case "replace":
        if (typeof mainString === "string")
          mainString = mainString.replace(
            task.options.searchValue,
            task.options.replaceValue
          );

        break;
      case "split":
        if (typeof mainString === "string")
          mainString = mainString.split(task.options.separator);

        break;

      default:
        break;
    }
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

export { startTask };
