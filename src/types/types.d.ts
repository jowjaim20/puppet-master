const KEYS = {
  filter: "filter",
  trim: "trim",
  replace: "replace",
  split: "split",
  find: "find"
} as const;

type FilterOption = {
  type: typeof KEYS.filter;
  includes: {
    searchString: string;
  };
};

type FindOptions = {
  type: typeof KEYS.find;
  includes: {
    searchString: string;
  };
};

type TrimOptions = {
  type: typeof KEYS.trim;
};

type ReplaceOptions = {
  type: typeof KEYS.replace;
  searchValue: string;
  replaceValue: string;
};

type SplitOptions = {
  type: typeof KEYS.split;
  separator: string;
};

type Task =
  | SplitOptions
  | ReplaceOptions
  | TrimOptions
  | FindOptions
  | FilterOption;

type StringTask =
  | SplitOptions
  | ReplaceOptions
  | TrimOptions
  | FindOptions
  | FilterOption;

interface ResultTargetKey {
  key: string | [string] | [string, number];
}

type TaskWithMerge = Omit<ScrapeTask & { mergeTask: boolean }, "childTask">;

interface ScrapeTask {
  childTask: TaskWithMerge[] | null;
  resultTargetKey: ResultTargetKey;
  selector: string;
  stringTask: StringTask[];
}

interface ScrapeRequest {
  link: string;
  scrapeTasks: ScrapeTask[];
}

const REQUEST: ScrapeRequest = {
  link: "https://www.brooklyncraftcompany.com/collections/all-workshops",
  scrapeTasks: [
    {
      resultTargetKey: {
        key: "courses"
      },
      selector: "#product-loop",
      stringTask: [
        {
          type: "trim"
        }
      ],
      childTask: [
        {
          mergeTask: true,
          resultTargetKey: {
            key: ["course.title"]
          },
          selector: "div.product-info > div > a > h3",
          stringTask: [
            {
              type: "trim"
            },
            {
              type: "replace",
              searchValue: "GREENPOINT WORKSHOP",
              replaceValue: "Joel"
            }
          ]
        },
        {
          mergeTask: true,
          resultTargetKey: {
            key: ["course.price"]
          },
          selector: "div.product-info > div > div.price > div",
          stringTask: [
            {
              type: "trim"
            }
          ]
        }
      ]
    }
  ]
};
//
