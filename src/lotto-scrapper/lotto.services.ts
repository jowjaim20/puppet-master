import { supabase } from "../controllers/initSupabase";
import { load } from "cheerio";
import axios from "axios";

const links = [
  {
    id: 8,
    link: "https://www.national-lottery.com/megamillions/results/history"
  },
  {
    id: 9,
    link: "https://www.lottery.co.uk/euromillions/results/past"
  },
  {
    id: 1,
    link: "https://www.lottopcso.com/6-42-lotto-result-history-and-summary/"
  },
  {
    id: 4,
    link: "https://www.lottopcso.com/6-45-lotto-result-history-and-summary/"
  },
  {
    id: 5,
    link: "https://www.lottopcso.com/6-49-lotto-result-history-and-summary/"
  },
  {
    id: 2,
    link: "https://www.lottopcso.com/6-55-lotto-result-history-and-summary/"
  },
  {
    id: 3,
    link: "https://www.lottopcso.com/6-58-lotto-result-history-and-summary/"
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

const signInWithPassword = async (email: string, password: string) => {
  const { data: session, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.log(error);
  }

  if (session) {
    console.log("sign-in session", session);
  }
};

const getSession = async () => {
  // TODo no session on refresh app
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.log("error", error);
  }

  if (data.session) {
    console.log("data.session", data.session);
  } else {
    await signInWithPassword("jowjaim27@gmail.com", "fruitylottery");
  }
};

const addResult = async (resultPayload: AddResult) => {
  console.log("resultPayload", resultPayload);
  const today = new Date();

  if (
    new Date(resultPayload.date).getTime() > today.getTime() ||
    resultPayload.numbers.length === 0
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
        // notification.openNotification({
        //   message: "thank you for contributing. We wish you all the luck!",
        //   type: "default"
        // });
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

const fetchData658 = async (index: number) => {
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

    addResult({
      date,
      game_id: links[index].id,
      numbers: arrEmpty[0].split("-").map((num: any) => +num)
    });
  } catch (error) {
    console.log("error", error);
  }
};

export { addResult, fetchData658 };
