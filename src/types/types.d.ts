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

interface Selector {
  selector: string;
  task: Task[];
}

interface ScrapeRequest {
  link: string;
  targetPageContainerSelector: string;
  hasPagination: boolean;
  titleSelector: Selector;
  dateSelector: Selector;
  priceSelector: Selector;
}
