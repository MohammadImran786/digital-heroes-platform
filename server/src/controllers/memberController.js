import { supabase } from "../config/supabase.js";

export async function getMemberDashboard(req, res) {
  try {
    const userId = req.user.id;

    const [
      profileResult,
      subscriptionResult,
      charityResult,
      scoresResult,
      winnersResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle(),

      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("user_charities")
        .select(`
          id,
          charity_id,
          contribution_percentage,
          charities (
            id,
            name,
            description,
            image_url,
            website
          )
        `)
        .eq("user_id", userId)
        .maybeSingle(),

      supabase
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .order("score_date", {
          ascending: false,
        }),

      supabase
        .from("winners")
        .select(`
          *,
          draws (
            draw_month,
            winning_numbers
          )
        `)
        .eq("user_id", userId)
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (profileResult.error) {
      throw profileResult.error;
    }

    if (subscriptionResult.error) {
      throw subscriptionResult.error;
    }

    if (charityResult.error) {
      throw charityResult.error;
    }

    if (scoresResult.error) {
      throw scoresResult.error;
    }

    if (winnersResult.error) {
      throw winnersResult.error;
    }

    return res.status(200).json({
      success: true,

      profile: profileResult.data,

      subscription:
        subscriptionResult.data || null,

      charity:
        charityResult.data || null,

      scores:
        scoresResult.data || [],

      winnings:
        winnersResult.data || [],
    });
  } catch (error) {
    console.error(
      "Member dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load member dashboard",
    });
  }
}