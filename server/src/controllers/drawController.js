import { supabase } from "../config/supabase.js";
import { createDrawSimulation } from "../services/drawService.js";

export async function simulateDraw(req, res) {
  try {
    const { drawMonth, drawType } = req.body;

    if (!drawMonth) {
      return res.status(400).json({
        success: false,
        message: "Draw month is required",
      });
    }

    if (!["random", "algorithmic"].includes(drawType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draw type",
      });
    }

    const simulation = await createDrawSimulation({
      drawMonth,
      drawType,
    });

    /*
      Remove an existing unpublished draw for this month.
      This lets admin re-run simulations before publishing.
    */

    const { data: existingDraw, error: existingError } =
      await supabase
        .from("draws")
        .select("id")
        .eq("draw_month", drawMonth)
        .neq("status", "published")
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingDraw) {
      await supabase
        .from("draws")
        .delete()
        .eq("id", existingDraw.id);
    }

    const { data: draw, error: drawError } =
      await supabase
        .from("draws")
        .insert({
          draw_month: drawMonth,
          draw_type: drawType,
          status: "simulated",
          winning_numbers: simulation.winningNumbers,
          prize_pool: simulation.prizePool,
          jackpot_rollover:
            simulation.incomingRollover,
          simulation_result: {
            participantCount:
              simulation.participantCount,
            winningNumbers:
              simulation.winningNumbers,
            tierCounts:
              simulation.tierCounts,
            payouts:
              simulation.payouts,
          },
        })
        .select()
        .single();

    if (drawError) {
      throw drawError;
    }

    const entries = simulation.entries.map((entry) => ({
      draw_id: draw.id,
      user_id: entry.user_id,
      numbers: entry.numbers,
      match_count: entry.match_count,
    }));

    const { error: entryError } =
      await supabase
        .from("draw_entries")
        .insert(entries);

    if (entryError) {
      throw entryError;
    }

    return res.json({
      success: true,
      message: "Draw simulation created",
      simulation: {
        ...simulation,
        drawId: draw.id,
      },
    });
  } catch (error) {
    console.error("Simulate draw error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to simulate draw",
    });
  }
}

export async function publishDraw(req, res) {
  try {
    const { drawId } = req.body;

    if (!drawId) {
      return res.status(400).json({
        success: false,
        message: "Draw ID is required",
      });
    }

    const { data: draw, error: drawError } =
      await supabase
        .from("draws")
        .select("*")
        .eq("id", drawId)
        .eq("status", "simulated")
        .single();

    if (drawError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Simulated draw not found",
      });
    }

    const { data: entries, error: entryError } =
      await supabase
        .from("draw_entries")
        .select("*")
        .eq("draw_id", draw.id);

    if (entryError) {
      throw entryError;
    }

    const winningNumbers =
      draw.winning_numbers || [];

    const tierRules = [
      {
        tier: "5-match",
        matchCount: 5,
        percentage: 0.40,
      },
      {
        tier: "4-match",
        matchCount: 4,
        percentage: 0.35,
      },
      {
        tier: "3-match",
        matchCount: 3,
        percentage: 0.25,
      },
    ];

    const prizePool = Number(draw.prize_pool || 0);

    const allWinners = [];

    let jackpotWon = false;

    for (const rule of tierRules) {
      const tierWinners = entries.filter(
        (entry) =>
          entry.match_count === rule.matchCount
      );

      const tierPool =
        prizePool * rule.percentage;

      if (
        rule.tier === "5-match" &&
        tierWinners.length > 0
      ) {
        jackpotWon = true;
      }

      const individualAmount =
        tierWinners.length > 0
          ? tierPool / tierWinners.length
          : 0;

      for (const winner of tierWinners) {
        allWinners.push({
          draw_id: draw.id,
          user_id: winner.user_id,
          tier: rule.tier,
          match_count: rule.matchCount,
          amount: individualAmount,
          verification_status: "pending",
          payment_status: "pending",
        });
      }
    }

    if (allWinners.length > 0) {
      const { error: winnerError } =
        await supabase
          .from("winners")
          .insert(allWinners);

      if (winnerError) {
        throw winnerError;
      }
    }

    /*
      Only the 5-match tier rolls over.
      If there are no 5-match winners, we retain the
      information on the draw and the next draw will
      include it.
    */

    const { data: updatedDraw, error } =
      await supabase
        .from("draws")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", draw.id)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: "Draw published successfully",
      draw: updatedDraw,
      winners: allWinners,
      jackpotWon,
    });
  } catch (error) {
    console.error("Publish draw error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to publish draw",
    });
  }
}

export async function getPublishedDraws(req, res) {
  try {
    const { data, error } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("draw_month", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      draws: data,
    });
  } catch (error) {
    console.error("Get published draws error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch draws",
    });
  }
}

export async function getMyWinnings(req, res) {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws (
          draw_month,
          winning_numbers
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      winnings: data,
    });
  } catch (error) {
    console.error("Get winnings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch winnings",
    });
  }
}