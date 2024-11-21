import { supabase } from "../controllers/initSupabase";

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

  if (new Date(resultPayload.date).getTime() > today.getTime()) {
    // notification.openNotification({
    //   message: "Result is not available yet. Cannot add future dates",
    //   type: "default"
    // });
  } else {
    await getSession();
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

export { addResult };
