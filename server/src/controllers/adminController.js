import { supabase } from "../config/supabase.js";

/* =========================================
   ADMIN OVERVIEW
========================================= */

export async function getAdminOverview(req, res) {
  try {
    const [
      profilesResult,
      subscriptionsResult,
      drawsResult,
      winnersResult,
      donationsResult,
      userCharitiesResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role, created_at"),

      supabase
        .from("subscriptions")
        .select(
          "id, user_id, plan, status, amount, renewal_date"
        ),

      supabase
        .from("draws")
        .select("id, prize_pool, status, draw_month")
        .eq("status", "published"),

      supabase
        .from("winners")
        .select(
          "id, amount, verification_status, payment_status"
        ),

      supabase
        .from("donations")
        .select("amount"),

      supabase
        .from("user_charities")
        .select(
          "user_id, charity_id, contribution_percentage, charities(name)"
        ),
    ]);

    if (profilesResult.error) throw profilesResult.error;
    if (subscriptionsResult.error)
      throw subscriptionsResult.error;
    if (drawsResult.error) throw drawsResult.error;
    if (winnersResult.error) throw winnersResult.error;
    if (donationsResult.error)
      throw donationsResult.error;
    if (userCharitiesResult.error)
      throw userCharitiesResult.error;

    const profiles = profilesResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const draws = drawsResult.data || [];
    const winners = winnersResult.data || [];
    const donations = donationsResult.data || [];
    const userCharities =
      userCharitiesResult.data || [];

    const activeSubscribers =
      subscriptions.filter(
        (item) => item.status === "active"
      ).length;

    const totalPrizePool = draws.reduce(
      (sum, draw) => sum + Number(draw.prize_pool || 0),
      0
    );

    const totalWinnings = winners.reduce(
      (sum, winner) =>
        sum + Number(winner.amount || 0),
      0
    );

    const paidWinnings = winners
      .filter((winner) => winner.payment_status === "paid")
      .reduce(
        (sum, winner) =>
          sum + Number(winner.amount || 0),
        0
      );

    const trackedDonations = donations.reduce(
      (sum, donation) =>
        sum + Number(donation.amount || 0),
      0
    );

    return res.json({
      success: true,
      stats: {
        totalUsers: profiles.length,
        activeSubscribers,
        totalPrizePool,
        totalWinnings,
        paidWinnings,
        trackedDonations,
        publishedDraws: draws.length,
        totalWinners: winners.length,
      },
      charitySelections: userCharities,
      recentUsers: profiles.slice(0, 10),
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin overview",
    });
  }
}

/* =========================================
   USER MANAGEMENT
========================================= */

export async function getUsers(req, res) {
  try {
    const { data: profiles, error: profileError } =
      await supabase
        .from("profiles")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (profileError) throw profileError;

    const { data: subscriptions, error: subError } =
      await supabase
        .from("subscriptions")
        .select("*");

    if (subError) throw subError;

    const users = (profiles || []).map((profile) => ({
      ...profile,
      subscription:
        subscriptions?.find(
          (subscription) =>
            subscription.user_id === profile.id
        ) || null,
    }));

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullName, role } = req.body;

    if (
      role &&
      !["user", "admin"].includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    /*
      Prevent an admin from accidentally
      removing their own admin access.
    */
    if (
      id === req.user.id &&
      role === "user"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin access",
      });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (fullName !== undefined) {
      updates.full_name = fullName;
    }

    if (role !== undefined) {
      updates.role = role;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "User updated successfully",
      user: data,
    });
  } catch (error) {
    console.error("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update user",
    });
  }
}

export async function updateUserSubscription(
  req,
  res
) {
  try {
    const { userId } = req.params;

    const {
      plan,
      status,
      amount,
      renewalDate,
    } = req.body;

    if (
      plan &&
      !["monthly", "yearly"].includes(plan)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    if (
      status &&
      ![
        "active",
        "inactive",
        "cancelled",
        "past_due",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status",
      });
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (plan !== undefined) {
      updateData.plan = plan;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (amount !== undefined) {
      updateData.amount = Number(amount);
    }

    if (renewalDate !== undefined) {
      updateData.renewal_date = renewalDate;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan: plan || "monthly",
          status: status || "inactive",
          amount:
            amount !== undefined
              ? Number(amount)
              : 0,
          renewal_date: renewalDate || null,
          ...updateData,
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Subscription updated successfully",
      subscription: data,
    });
  } catch (error) {
    console.error(
      "Update user subscription error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update subscription",
    });
  }
}

/* =========================================
   USER SCORE MANAGEMENT
========================================= */

export async function getUserScores(req, res) {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", userId)
      .order("score_date", {
        ascending: false,
      });

    if (error) throw error;

    return res.json({
      success: true,
      scores: data || [],
    });
  } catch (error) {
    console.error("Get user scores error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load user scores",
    });
  }
}

export async function updateUserScore(
  req,
  res
) {
  try {
    const { scoreId } = req.params;
    const { score, scoreDate } = req.body;

    const numericScore = Number(score);

    if (
      !Number.isInteger(numericScore) ||
      numericScore < 1 ||
      numericScore > 45
    ) {
      return res.status(400).json({
        success: false,
        message: "Score must be a whole number from 1 to 45",
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
      .eq("id", scoreId)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message:
            "Another score already exists for this date",
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
    console.error(
      "Admin update score error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update score",
    });
  }
}

export async function deleteUserScore(
  req,
  res
) {
  try {
    const { scoreId } = req.params;

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", scoreId);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Score deleted successfully",
    });
  } catch (error) {
    console.error(
      "Admin delete score error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete score",
    });
  }
}

/* =========================================
   CHARITY MANAGEMENT
========================================= */

export async function createCharity(
  req,
  res
) {
  try {
    const {
      name,
      slug,
      description,
      imageUrl,
      website,
      featured,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const { data, error } = await supabase
      .from("charities")
      .insert({
        name,
        slug,
        description: description || "",
        image_url: imageUrl || "",
        website: website || "",
        featured: Boolean(featured),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "A charity with this slug already exists",
        });
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Charity created successfully",
      charity: data,
    });
  } catch (error) {
    console.error("Create charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create charity",
    });
  }
}

export async function updateCharity(
  req,
  res
) {
  try {
    const { id } = req.params;

    const {
      name,
      slug,
      description,
      imageUrl,
      website,
      featured,
    } = req.body;

    const { data, error } = await supabase
      .from("charities")
      .update({
        name,
        slug,
        description,
        image_url: imageUrl,
        website,
        featured: Boolean(featured),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      message: "Charity updated successfully",
      charity: data,
    });
  } catch (error) {
    console.error("Update charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update charity",
    });
  }
}

export async function deleteCharity(
  req,
  res
) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "23503") {
        return res.status(409).json({
          success: false,
          message:
            "This charity is already selected by a user and cannot be deleted",
        });
      }

      throw error;
    }

    return res.json({
      success: true,
      message: "Charity deleted successfully",
    });
  } catch (error) {
    console.error("Delete charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete charity",
    });
  }
}

/* =========================================
   REPORTS
========================================= */

export async function getReports(
  req,
  res
) {
  try {
    const [
      subscriptionsResult,
      drawsResult,
      winnersResult,
      charitiesResult,
      userCharitiesResult,
    ] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*"),

      supabase
        .from("draws")
        .select("*")
        .eq("status", "published")
        .order("draw_month", {
          ascending: false,
        }),

      supabase
        .from("winners")
        .select("*"),

      supabase
        .from("charities")
        .select("*"),

      supabase
        .from("user_charities")
        .select(
          "charity_id, contribution_percentage"
        ),
    ]);

    if (subscriptionsResult.error)
      throw subscriptionsResult.error;

    if (drawsResult.error)
      throw drawsResult.error;

    if (winnersResult.error)
      throw winnersResult.error;

    if (charitiesResult.error)
      throw charitiesResult.error;

    if (userCharitiesResult.error)
      throw userCharitiesResult.error;

    const subscriptions =
      subscriptionsResult.data || [];

    const draws =
      drawsResult.data || [];

    const winners =
      winnersResult.data || [];

    const charities =
      charitiesResult.data || [];

    const userCharities =
      userCharitiesResult.data || [];

    const charityStats = charities
      .map((charity) => {
        const selections =
          userCharities.filter(
            (item) =>
              item.charity_id === charity.id
          );

        const averageContribution =
          selections.length
            ? selections.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.contribution_percentage || 0
                  ),
                0
              ) / selections.length
            : 0;

        return {
          id: charity.id,
          name: charity.name,
          selections: selections.length,
          averageContribution:
            Number(
              averageContribution
            ).toFixed(1),
        };
      })
      .sort(
        (a, b) =>
          b.selections - a.selections
      );

    return res.json({
      success: true,

      subscriptions: {
        total: subscriptions.length,
        active: subscriptions.filter(
          (item) =>
            item.status === "active"
        ).length,
        inactive: subscriptions.filter(
          (item) =>
            item.status !== "active"
        ).length,
      },

      draws: {
        total: draws.length,
        totalPrizePool:
          draws.reduce(
            (sum, draw) =>
              sum +
              Number(
                draw.prize_pool || 0
              ),
            0
          ),
      },

      winners: {
        total: winners.length,
        approved: winners.filter(
          (winner) =>
            winner.verification_status ===
            "approved"
        ).length,
        pending: winners.filter(
          (winner) =>
            winner.verification_status ===
            "pending"
        ).length,
        paid: winners.filter(
          (winner) =>
            winner.payment_status ===
            "paid"
        ).length,
        totalAmount:
          winners.reduce(
            (sum, winner) =>
              sum +
              Number(
                winner.amount || 0
              ),
            0
          ),
      },

      charityStats,
      recentDraws: draws.slice(0, 6),
    });
  } catch (error) {
    console.error("Reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load reports",
    });
  }
}