import { supabase } from "../config/supabase.js";

export async function getScores(req, res) {
  try {
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("score_date", { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      scores: data,
    });
  } catch (error) {
    console.error("Get scores error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch scores",
    });
  }
}

export async function createScore(req, res) {
  try {
    const { score, scoreDate } = req.body;

    const numericScore = Number(score);

    if (!Number.isInteger(numericScore)) {
      return res.status(400).json({
        success: false,
        message: "Score must be a whole number",
      });
    }

    if (numericScore < 1 || numericScore > 45) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    if (!scoreDate) {
      return res.status(400).json({
        success: false,
        message: "Score date is required",
      });
    }

    const { data, error } = await supabase
      .from("scores")
      .insert({
        user_id: req.user.id,
        score: numericScore,
        score_date: scoreDate,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "A score already exists for this date",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Score added successfully",
      score: data,
    });
  } catch (error) {
    console.error("Create score error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create score",
    });
  }
}

export async function updateScore(req, res) {
  try {
    const { id } = req.params;
    const { score, scoreDate } = req.body;

    const numericScore = Number(score);

    if (!Number.isInteger(numericScore)) {
      return res.status(400).json({
        success: false,
        message: "Score must be a whole number",
      });
    }

    if (numericScore < 1 || numericScore > 45) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    if (!scoreDate) {
      return res.status(400).json({
        success: false,
        message: "Score date is required",
      });
    }

    const { data, error } = await supabase
      .from("scores")
      .update({
        score: numericScore,
        score_date: scoreDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "A score already exists for this date",
        });
      }

      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Score not found",
        });
      }

      throw error;
    }

    return res.json({
      success: true,
      message: "Score updated successfully",
      score: data,
    });
  } catch (error) {
    console.error("Update score error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update score",
    });
  }
}

export async function deleteScore(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    console.error("Delete score error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete score",
    });
  }
}