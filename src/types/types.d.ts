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
    key: string;
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

interface Options {
  mergeTask: boolean;
  filter: FilterOption;
}

type TaskWithMerge = Omit<ScrapeTask, "childTask" | "options"> & {
  options: Omit<Options, "filter">;
};

interface ScrapeTask {
  options?: Omit<Options, "mergeTask">;
  childTask?: TaskWithMerge[];
  resultTargetKey: ResultTargetKey;
  selector: string;
  stringTask: StringTask[];
}

type MainTask = ScrapeTask | TaskWithMerge;

interface ScrapeRequest {
  index: number;
}

const REQUEST: ScrapeRequest = {
  link: "https://www.brooklyncraftcompany.com/collections/all-workshops",
  scrapeTasks: [
    {
      options: {
        filter: {
          type: "filter",
          includes: { key: "schedule", searchString: "Nov" }
        }
      },
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
          options: {
            mergeTask: true,
            filter: {
              type: "filter",
              includes: ""
            }
          },
          resultTargetKey: {
            key: ["course.title"]
          },
          selector: "div.product-info > div > a > h3",
          stringTask: [
            {
              type: "trim"
            },
            {
              type: "split",
              separator: " "
            },
            {
              type: "find",
              includes: {
                searchString: ".00"
              }
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
