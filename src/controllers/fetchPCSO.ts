import { supabase } from "../controllers/initSupabase";
import { load } from "cheerio";
import axios from "axios";

async function sendPushNotification(
  expoPushToken: string,
  data: { result: Result; name: string }
) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: `New result for ${data.name}`,
    body: "Checkout the winning numbers now!",
    data: data
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });
}

const links = [
  {
    id: 8,
    link: "https://www.national-lottery.com/megamillions/results/history",
    name: "Mega Millions"
  },
  {
    id: 9,
    link: "https://www.lottery.co.uk/euromillions/results/past",
    name: "Euro Millions"
  },
  {
    id: 1,
    link: "https://www.lottopcso.com/6-42-lotto-result-history-and-summary/",
    name: "PCSO Lotto 6/42"
  },
  {
    id: 4,
    link: "https://www.lottopcso.com/6-45-lotto-result-history-and-summary/",
    name: "PCSO MEGA Lotto 6/45"
  },
  {
    id: 5,
    link: "https://www.lottopcso.com/6-49-lotto-result-history-and-summary/",
    name: "PCSO SUPER Lotto 6/49"
  },
  {
    id: 2,
    link: "https://www.lottopcso.com/6-55-lotto-result-history-and-summary/",
    name: "PCSO GRAND Lotto 6/55"
  },
  {
    id: 3,
    link: "https://www.lottopcso.com/6-58-lotto-result-history-and-summary/",
    name: "PCSO ULTRA Lotto 6/58"
  }
];

interface Result {
  id: number;
  game_id: number;
  created_at: string;
  numbers: number[];
  date: string;
  jackpot_prize?: number;
  specialNumber?: number;
  numbers_set2?: number[];
}

type defaultKeys = "id" | "created_at";

export type AddResult = Omit<Result, defaultKeys>;

const addResult = async (
  resultPayload: AddResult,
  index: number,
  length: number
) => {
  console.log("resultPayload", resultPayload);
  const today = new Date();

  if (
    new Date(resultPayload.date).getTime() > today.getTime() ||
    resultPayload.numbers.length !== length
  ) {
    console.log("payloaderror");
  } else {
    // await getSession();
    const { data: result, error: resultError } = await supabase
      .from("result")
      .select("*")
      .eq("date", resultPayload.date)
      .eq("game_id", resultPayload.game_id);

    if (resultError) {
      console.log(resultError);
    }

    console.log("result", result);

    if (result?.length === 0) {
      const { data, error } = await supabase
        .from("result")
        .insert([resultPayload])
        .select()
        .single<Result>();

      if (error) {
        console.log("error", error);
      }

      if (data) {
        const { data: result, error: resultError } = await supabase
          .from("tokens")
          .select("*")
          .eq("game_id", resultPayload.game_id);

        result?.forEach((item) =>
          sendPushNotification(item.token, {
            result: data,
            name: links[index].name
          })
        );
      }
    } else {
      //   notification.openNotification({
      //     message: "date is already added",
      //     type: "default"
      //   });

      console.log("date is already added");
    }
  }
};

const fetchEuro = async () => {
  const index = 1;
  const arrEmpty: string[] = [];
  let date: string = "";

  try {
    let data = await axios.get(links[index].link);

    let $ = await load(data.data);

    $(" div.main > table > tbody>tr").each((i, el) => {
      const arrText: string[] = [];
      const text = $(el)
        .find("td:nth-child(2)")
        //@ts-ignore
        .children((ii, eell) => {
          //@ts-ignore
          arrText.push(+$(eell).text());
        });

      if (i === 0) {
        const date1 = $(el).find("td:nth-child(1) > a").text();
        date = date1;
      }

      const newArr = arrText.filter((num, i) => i < 7);

      arrEmpty.push(newArr.join("-"));
    });

    const split = date.split(" ");
    const removedth = split[1].substring(0, 2);
    split.splice(1, 1, removedth);
    split.join(" ");

    addResult(
      {
        //@ts-ignore
        date: new Date(split).toDateString(),
        game_id: links[index].id,
        numbers: arrEmpty[0]
          .split("-")
          .map((num: any) => +num)
          .filter((_, index) => index <= 4),
        numbers_set2: arrEmpty[0]
          .split("-")
          .map((num: any) => +num)
          .filter((_, index) => index >= 5)
      },
      index,
      5
    );
  } catch (error) {
    console.log("error", error);
  }
};

const fetchMegaMillions = async () => {
  const arrEmpty: string[] = [];
  let date: string = "";
  let price = null;

  try {
    let data = await axios.get(links[0].link);

    let $ = await load(data.data);
    $(" table > tbody > tr").each((i, el) => {
      const arrText: any[] = [];

      const text = $(el)
        .find("td.noBefore.nowrap > ul")
        //@ts-ignore
        .children((_, eell) => {
          arrText.push($(eell).text());
        });

      if (i === 0) {
        const date1 = $(el).find(" td.noBefore.colour > a").text();
        const price1 = $(el).find("tr:nth-child(1) > td:nth-child(3)").text();
        price = price1.trim();
        date = date1;
      }

      const test = arrText.filter((e, i) => i !== arrText.length - 1);

      arrEmpty.push(test.join("-"));
    });

    addResult(
      {
        date,
        game_id: links[0].id,
        numbers: arrEmpty[0]
          .split("-")
          .map((num: any) => +num)
          .filter((_, index) => index <= 4),
        numbers_set2: arrEmpty[0]
          .split("-")
          .map((num: any) => +num)
          .filter((_, index) => index >= 5)
      },
      0,
      5
    );
  } catch (error) {
    console.log("error", error);
  }
};

const fetchPCSO = async (index: number) => {
  console.log("index", index);
  const arrEmpty: any = [];
  let date: string = "";
  let price = null;
  console.log("links[index].link", links[index].link);

  try {
    let res = await axios.get(links[index].link);
    let $ = await load(res.data);
    $(" table > tbody > tr").each((i, el) => {
      const text = $(el.childNodes[1]).text();
      if (i === 0) {
        date = $(el.childNodes[0]).text();
        price = `₱${$(el.childNodes[2]).text()}`;
      }

      arrEmpty.push(text);
    });

    console.log("arrEmpty", arrEmpty[0]);
    console.log("date", date);

    addResult(
      {
        date,
        game_id: links[index].id,
        numbers: arrEmpty[0].split("-").map((num: any) => +num)
      },
      index,
      6
    );
  } catch (error) {
    console.log("error", error);
  }
};

export { fetchPCSO, fetchMegaMillions, fetchEuro };
