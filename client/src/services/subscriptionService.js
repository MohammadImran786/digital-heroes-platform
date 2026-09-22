import api from "./api";

export async function getMySubscription() {
  const response = await api.get("/api/subscription");

  return response.data.subscription;
}

export async function createCheckoutSession(plan) {
  const response = await api.post(
    "/api/subscription/checkout",
    {
      plan,
    }
  );

  return response.data;
}

export async function cancelSubscription() {
  const response = await api.post(
    "/api/subscription/cancel"
  );

  return response.data;
}