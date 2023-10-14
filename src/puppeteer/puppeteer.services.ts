import * as cheerio from "cheerio";
import puppeteer, { Page } from "puppeteer";

export class Puppeteer {
  async goToNextPage(page: Page) {
    try {
      await page.click("#pagination > a:nth-child(4)");
    } catch (error) {
      console.log(error);
    }
  }

  async isLastChildHas(page: Page, $: cheerio.CheerioAPI) {
    const parentElement = $("#pagination");

    const lastChild = parentElement.find(":last-child");
    const isLastChildCurrent = lastChild.hasClass("current");
    return isLastChildCurrent;
  }
}
