import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wpbdtthvbtktdwwivcvd.supabase.co";
const supabaseAnonKey = "sb_publishable_Q2GO9-BoHoqpWWIYh9MIcg_ZUHO3Ek0";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Fetching daily scores...");
  const { data: scoresData, error: scoresError } = await supabase
    .from("sudoku_daily_scores")
    .select("*");

  if (scoresError) {
    console.error("Scores Error:", scoresError);
  } else {
    console.log("Daily Scores Data:", scoresData);
  }
}

test();
