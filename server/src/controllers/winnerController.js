import { supabase } from "../config/supabase.js";

const BUCKET = "winner-proofs";

export async function getMyWinners(req, res) {
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

    const winners = await Promise.all(
      (data || []).map(async (winner) => {
        let proofUrl = null;

        if (winner.proof_path) {
          const { data: signedData } =
            await supabase.storage
              .from(BUCKET)
              .createSignedUrl(
                winner.proof_path,
                3600
              );

          proofUrl = signedData?.signedUrl || null;
        }

        return {
          ...winner,
          proofUrl,
        };
      })
    );

    return res.json({
      success: true,
      winners,
    });
  } catch (error) {
    console.error("Get my winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch winnings",
    });
  }
}

export async function uploadProof(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a proof file",
      });
    }

    const { data: winner, error: winnerError } =
      await supabase
        .from("winners")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found",
      });
    }

    if (
      winner.verification_status === "approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Proof cannot be changed after approval",
      });
    }

    const extension =
      req.file.originalname
        .split(".")
        .pop()
        .toLowerCase();

    const filePath =
      `${req.user.id}/${winner.id}-${Date.now()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from(BUCKET)
        .upload(
          filePath,
          req.file.buffer,
          {
            contentType: req.file.mimetype,
            upsert: true,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const { data: updatedWinner, error: updateError } =
      await supabase
        .from("winners")
        .update({
          proof_path: filePath,
          verification_status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", winner.id)
        .select()
        .single();

    if (updateError) {
      throw updateError;
    }

    return res.json({
      success: true,
      message: "Proof uploaded successfully",
      winner: updatedWinner,
    });
  } catch (error) {
    console.error("Upload proof error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to upload proof",
    });
  }
}

export async function getAdminWinners(req, res) {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        profiles (
          full_name
        ),
        draws (
          draw_month,
          winning_numbers
        )
      `)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    const winners = await Promise.all(
      (data || []).map(async (winner) => {
        let proofUrl = null;

        if (winner.proof_path) {
          const { data: signedData } =
            await supabase.storage
              .from(BUCKET)
              .createSignedUrl(
                winner.proof_path,
                3600
              );

          proofUrl = signedData?.signedUrl || null;
        }

        return {
          ...winner,
          proofUrl,
        };
      })
    );

    return res.json({
      success: true,
      winners,
    });
  } catch (error) {
    console.error("Admin winners error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch winners",
    });
  }
}

export async function reviewWinner(req, res) {
  try {
    const { id } = req.params;
    const { verificationStatus } = req.body;

    if (
      !["approved", "rejected"].includes(
        verificationStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status",
      });
    }

    const { data: winner, error } =
      await supabase
        .from("winners")
        .update({
          verification_status:
            verificationStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message:
        verificationStatus === "approved"
          ? "Winner approved"
          : "Winner rejected",
      winner,
    });
  } catch (error) {
    console.error("Review winner error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to review winner",
    });
  }
}

export async function markWinnerPaid(req, res) {
  try {
    const { id } = req.params;

    const { data: winner, error: winnerError } =
      await supabase
        .from("winners")
        .select("*")
        .eq("id", id)
        .single();

    if (winnerError || !winner) {
      return res.status(404).json({
        success: false,
        message: "Winner not found",
      });
    }

    if (
      winner.verification_status !== "approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Winner must be approved before payment",
      });
    }

    const { data: updatedWinner, error } =
      await supabase
        .from("winners")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      message: "Payout marked as paid",
      winner: updatedWinner,
    });
  } catch (error) {
    console.error("Mark paid error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to mark payout as paid",
    });
  }
}