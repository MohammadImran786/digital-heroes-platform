import { supabase } from "../config/supabase.js";

function generateRandomNumbers() {
  const numbers = new Set();

  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  return [...numbers].sort((a, b) => a - b);
}

function generateWeightedNumbers(scores) {
  const frequency = new Map();

  for (let number = 1; number <= 45; number++) {
    frequency.set(number, 0);
  }

  for (const score of scores) {
    frequency.set(
      score,
      (frequency.get(score) || 0) + 1
    );
  }

  const selected = new Set();

  while (selected.size < 5) {
    const candidates = [];

    for (let number = 1; number <= 45; number++) {
      if (selected.has(number)) continue;

      const count = frequency.get(number) || 0;

      candidates.push({
        number,
        weight: 1 + count * 5,
      });
    }

    const totalWeight = candidates.reduce(
      (sum, item) => sum + item.weight,
      0
    );

    let random = Math.random() * totalWeight;

    for (const candidate of candidates) {
      random -= candidate.weight;

      if (random <= 0) {
        selected.add(candidate.number);
        break;
      }
    }
  }

  return [...selected].sort((a, b) => a - b);
}

export function calculateMatchCount(
  entryNumbers,
  winningNumbers
) {
  const uniqueEntryNumbers = [
    ...new Set(entryNumbers),
  ];

  return uniqueEntryNumbers.filter((number) =>
    winningNumbers.includes(number)
  ).length;
}

async function getActiveSubscribers() {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("user_id, amount, plan")
    .eq("status", "active");

  if (error) {
    throw error;
  }

  if (!subscriptions?.length) {
    return [];
  }

  const userIds = subscriptions.map(
    (subscription) => subscription.user_id
  );

  const { data: scores, error: scoreError } =
    await supabase
      .from("scores")
      .select("user_id, score, score_date")
      .in("user_id", userIds)
      .order("score_date", {
        ascending: false,
      });

  if (scoreError) {
    throw scoreError;
  }

  const groupedScores = new Map();

  for (const score of scores || []) {
    if (!groupedScores.has(score.user_id)) {
      groupedScores.set(score.user_id, []);
    }

    const userScores = groupedScores.get(score.user_id);

    if (userScores.length < 5) {
      userScores.push(score.score);
    }
  }

  return subscriptions
    .map((subscription) => ({
      ...subscription,
      scores:
        groupedScores.get(subscription.user_id) || [],
    }))
    .filter(
      (subscription) => subscription.scores.length === 5
    );
}

async function getIncomingJackpotRollover() {
  const { data: previousDraw, error } = await supabase
    .from("draws")
    .select("*")
    .eq("status", "published")
    .order("draw_month", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!previousDraw) {
    return 0;
  }

  const { data: jackpotWinners, error: winnerError } =
    await supabase
      .from("winners")
      .select("id")
      .eq("draw_id", previousDraw.id)
      .eq("tier", "5-match");

  if (winnerError) {
    throw winnerError;
  }

  if (jackpotWinners?.length) {
    return 0;
  }

  const previousJackpot =
    Number(previousDraw.prize_pool || 0) * 0.4;

  return (
    previousJackpot +
    Number(previousDraw.jackpot_rollover || 0)
  );
}

export async function createDrawSimulation({
  drawMonth,
  drawType,
}) {
  const subscribers = await getActiveSubscribers();

  if (!subscribers.length) {
    throw new Error(
      "At least one active subscriber with five scores is required"
    );
  }

  const { data: settings, error: settingsError } =
    await supabase
      .from("platform_settings")
      .select(
        "prize_pool_percentage, minimum_charity_percentage"
      )
      .eq("id", 1)
      .single();

  if (settingsError) {
    throw settingsError;
  }

  const incomingRollover =
    await getIncomingJackpotRollover();

  const monthlySubscriptionValue =
    subscribers.reduce((sum, subscriber) => {
      const amount = Number(subscriber.amount || 0);

      if (subscriber.plan === "yearly") {
        return sum + amount / 12;
      }

      return sum + amount;
    }, 0);

  const prizePool =
    monthlySubscriptionValue *
      (Number(settings.prize_pool_percentage) / 100) +
    incomingRollover;

  const allScores = subscribers.flatMap(
    (subscriber) => subscriber.scores
  );

  const winningNumbers =
    drawType === "algorithmic"
      ? generateWeightedNumbers(allScores)
      : generateRandomNumbers();

  const entries = subscribers.map((subscriber) => {
    const matchCount = calculateMatchCount(
      subscriber.scores,
      winningNumbers
    );

    return {
      user_id: subscriber.user_id,
      numbers: subscriber.scores,
      match_count: matchCount,
    };
  });

  const tierDefinitions = {
    "5-match": {
      percentage: 40,
      matchCount: 5,
    },
    "4-match": {
      percentage: 35,
      matchCount: 4,
    },
    "3-match": {
      percentage: 25,
      matchCount: 3,
    },
  };

  const tierCounts = {};

  for (const [tier, definition] of Object.entries(
    tierDefinitions
  )) {
    tierCounts[tier] = entries.filter(
      (entry) =>
        entry.match_count === definition.matchCount
    ).length;
  }

  const payouts = {};

  for (const [tier, definition] of Object.entries(
    tierDefinitions
  )) {
    const tierPool =
      prizePool * (definition.percentage / 100);

    const winnerCount = tierCounts[tier];

    payouts[tier] =
      winnerCount > 0
        ? tierPool / winnerCount
        : 0;
  }

  return {
    drawMonth,
    drawType,
    winningNumbers,
    participantCount: subscribers.length,
    prizePool,
    incomingRollover,
    tierCounts,
    payouts,
    entries,
  };
}