import { supabase } from "../lib/supabaseClient";

export async function getCharities() {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .order("featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCharityById(id) {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserCharity(userId) {
  const { data, error } = await supabase
    .from("user_charities")
    .select(`
      id,
      contribution_percentage,
      charity_id,
      charities (
        id,
        name,
        description,
        image_url,
        website
      )
    `)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function saveUserCharity({
  userId,
  charityId,
  percentage,
}) {
  const { data, error } = await supabase
    .from("user_charities")
    .upsert(
      {
        user_id: userId,
        charity_id: charityId,
        contribution_percentage: percentage,
      },
      {
        onConflict: "user_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}