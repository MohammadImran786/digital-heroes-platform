import api from "./api";

export async function getAdminOverview() {
  const { data } = await api.get(
    "/api/admin/overview"
  );

  return data;
}

export async function getAdminUsers() {
  const { data } = await api.get(
    "/api/admin/users"
  );

  return data.users;
}

export async function updateAdminUser(
  userId,
  payload
) {
  const { data } = await api.patch(
    `/api/admin/users/${userId}`,
    payload
  );

  return data;
}

export async function updateAdminSubscription(
  userId,
  payload
) {
  const { data } = await api.patch(
    `/api/admin/users/${userId}/subscription`,
    payload
  );

  return data;
}

export async function getAdminUserScores(
  userId
) {
  const { data } = await api.get(
    `/api/admin/users/${userId}/scores`
  );

  return data.scores;
}

export async function updateAdminScore(
  scoreId,
  payload
) {
  const { data } = await api.patch(
    `/api/admin/scores/${scoreId}`,
    payload
  );

  return data;
}

export async function deleteAdminScore(
  scoreId
) {
  const { data } = await api.delete(
    `/api/admin/scores/${scoreId}`
  );

  return data;
}

export async function createAdminCharity(
  payload
) {
  const { data } = await api.post(
    "/api/admin/charities",
    payload
  );

  return data;
}

export async function updateAdminCharity(
  charityId,
  payload
) {
  const { data } = await api.patch(
    `/api/admin/charities/${charityId}`,
    payload
  );

  return data;
}

export async function deleteAdminCharity(
  charityId
) {
  const { data } = await api.delete(
    `/api/admin/charities/${charityId}`
  );

  return data;
}

export async function getAdminReports() {
  const { data } = await api.get(
    "/api/admin/reports"
  );

  return data;
}