import * as cheerio from "cheerio";

export class Scraper {
  constructor() {}

  mainTask(
    scrapeTasks: ScrapeTask[],
    $: cheerio.CheerioAPI,
    data: Record<string, unknown>
  ) {
    scrapeTasks.forEach((task) => {
      const el = $(task.selector);

      const scrapedData = task.childTask?.length
        ? this.scrapeChildren($, task, data)
        : this.getText(task, el);

      if (
        task.childTask &&
        typeof scrapedData !== "string" &&
        typeof task.resultTargetKey.key === "string" &&
        this.check(scrapedData, task.resultTargetKey.key)
      ) {
        const filtered = scrapedData[task.resultTargetKey.key].filter(
          (item) => {
            if (task.options) {
              return item[task.options.filter.includes.key].includes(
                task.options.filter.includes.searchString
              );
            }
            return item;
          }
        );
        scrapedData[task.resultTargetKey.key] = filtered;

        this.assignTokey(task, scrapedData, data, task);
      } else {
        console.log("test", scrapedData);
        this.assignTokey(task, scrapedData, data, task);
      }
    });
  }

  scrapeChildren(
    $: cheerio.CheerioAPI,
    task: ScrapeTask,
    parentData: Record<string, unknown>
  ) {
    const data: Record<string, unknown> = {};
    const children = $(task.selector).children();
    let index = 0;
    let isDisabled = false;

    while (!isDisabled && task.childTask) {
      for (let el of children) {
        this.scrape(task.childTask, $, el, data, task, index);
        index++;
      }
      isDisabled = true;
    }

    return data;
  }

  scrape(
    scrapeTasks: ScrapeTask[] | TaskWithMerge[],
    $: cheerio.CheerioAPI,
    el: cheerio.Element,
    data: Record<string, unknown>,
    mainTask: ScrapeTask,
    delegate?: number
  ) {
    scrapeTasks.forEach((task) => {
      const foundString = $(el).find(task.selector).text();
      const allString = $(el).text();

      const scrapedString = this.modifyString(
        task,
        foundString !== "" ? foundString : allString
      );
      this.assignTokey(task, scrapedString, data, mainTask, delegate);
    });
  }

  getText(
    scrapeTask: ScrapeTask,
    el: cheerio.Cheerio<cheerio.AnyNode>
  ): string {
    const foundString = el.text();

    const string = this.modifyString(scrapeTask, foundString);

    return string;
  }

  assignTokey(
    task: ScrapeTask | TaskWithMerge,
    string: string | Record<string, unknown>,
    data1: Record<string, unknown>,
    mainTask: ScrapeTask,
    delegate?: number
  ) {
    let data = data1;

    if (Array.isArray(task.resultTargetKey.key)) {
      const index = task.resultTargetKey.key[1];
      const keys = task.resultTargetKey.key[0].split(".");

      //[test]

      const firstKey = keys[0];
      const secondKey = keys[1];

      if (keys.length === 1 && data[firstKey] && this.check(data, firstKey)) {
        data[firstKey].push(string);
      } else if (keys.length === 1) {
        data[firstKey] = [];

        if (this.check(data, firstKey)) {
          data[firstKey].push(string);
        }
      }

      //[test.test1]

      if (keys.length > 1 && data[firstKey] && this.check(data, firstKey)) {
        const testObj: Record<string, string | Record<string, unknown>> = {};
        testObj[secondKey] = string;

        if (
          task.options &&
          "mergeTask" in task.options &&
          task.options.mergeTask &&
          delegate !== undefined &&
          (delegate === 0 || delegate > 0)
        ) {
          data[firstKey][delegate] = {
            ...data[firstKey][delegate],
            ...testObj
          };
        } else if (typeof index === "number") {
          data[firstKey][index] = { ...data[firstKey][index], ...testObj };
        } else {
          data[firstKey].push(testObj);
        }
      } else if (keys.length > 1) {
        data[firstKey] = [];

        if (this.check(data, firstKey)) {
          const testObj: Record<string, string | Record<string, unknown>> = {};
          testObj[secondKey] = string;
          data[firstKey].push(testObj);
        }
      }
    } else {
      const keys = task.resultTargetKey.key.split(".");
      const key1 = keys[0];
      const key2 = keys[1];

      // key
      if (
        this.isSameKey(
          task.resultTargetKey.key,
          mainTask?.resultTargetKey.key
        ) &&
        typeof string !== "string"
      ) {
        data[key1] = string[key1];
      } else if (keys.length === 1) {
        data[key1] = string;
      }

      //key.key2

      if (keys.length === 2 && data[key1] && this.checkObject(data, key1)) {
        const testObj: Record<string, string | Record<string, unknown>> = {
          ...data[key1]
        };
        testObj[key2] = string;
        data[key1] = testObj;
      } else if (keys.length === 2) {
        const testObj: Record<string, string | Record<string, unknown>> = {};
        testObj[key2] = string;
        data[key1] = testObj;
      }
    }
  }

  modifyString(scrapeTask: MainTask, foundString: string) {
    const stringTask = new StringTask(foundString);

    let x = 0;
    while (x !== undefined && x < scrapeTask.stringTask.length) {
      const task = scrapeTask.stringTask[x];
      switch (task.type) {
        case "trim":
          stringTask.trim();
          break;
        case "filter":
          stringTask.filter(task.includes.searchString);
          break;
        case "find":
          stringTask.find(task.includes.searchString);
          break;
        case "replace":
          stringTask.replace(task.searchValue, task.replaceValue);
          break;
        case "split":
          stringTask.split(task.separator);
          break;

        default:
          break;
      }
      x++;
    }

    return typeof stringTask.string === "string" ? stringTask.string : "error";
  }

  check(
    data: Record<string, unknown>,
    key: string
  ): data is Record<string, any[]> {
    if (Array.isArray(data[key])) {
      return true;
    } else {
      return false;
    }
  }

  checkObject(
    data: Record<string, unknown>,
    key: string
  ): data is Record<string, Record<string, string | Record<string, unknown>>> {
    if (key in data) {
      return true;
    } else {
      return false;
    }
  }
  isSameKey(
    key1: ResultTargetKey[keyof ResultTargetKey],
    key2: ResultTargetKey[keyof ResultTargetKey]
  ) {
    let isSame = false;
    const key = key1;
    const mainKey = key2;

    if (typeof key === "string" && typeof mainKey === "string") {
      isSame = key.split(".")[0] === mainKey.split(".")[0];
    }

    if (Array.isArray(key) && Array.isArray(mainKey)) {
      isSame = key[0].split(".")[0] === mainKey[0].split(".")[0];
    }

    if (Array.isArray(key) && typeof mainKey === "string") {
      isSame = key[0].split(".")[0] === mainKey.split(".")[0];
    }

    if (typeof key === "string" && Array.isArray(mainKey)) {
      isSame = key.split(".")[0] === mainKey[0].split(".")[0];
    }

    return isSame;
  }
}

class StringTask {
  string: string | string[];
  constructor(task: string) {
    this.string = task;
  }

  private isStringArray(arr: any): arr is string[] {
    return arr[0].length >= 1 || arr.length === 0;
  }

  private isNotEmptyString(string: string | string[]) {
    return string !== "";
  }

  trim() {
    if (this.isNotEmptyString(this.string) && typeof this.string === "string") {
      this.string = this.string.trim();
    }
  }

  split(separator: string) {
    if (this.isNotEmptyString(this.string) && typeof this.string === "string")
      this.string = this.string.split(separator);
  }

  find(searchString: string) {
    if (this.isNotEmptyString(this.string) && this.isStringArray(this.string)) {
      const foundString = this.string.find((text) =>
        text.includes(searchString)
      );
      console.log("foundString", foundString);

      if (foundString) {
        this.string = foundString;
      }
    }
  }

  replace(searchValue: string, replaceValue: string) {
    if (this.isNotEmptyString(this.string) && typeof this.string === "string")
      this.string = this.string.replace(searchValue, replaceValue);
  }

  filter(filterValue: string) {
    if (this.isNotEmptyString(this.string) && this.isStringArray(this.string)) {
      this.string = this.string.filter((text) => text.includes(filterValue));
    }
  }
}
