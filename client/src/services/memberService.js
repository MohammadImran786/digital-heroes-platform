import api from "./api";

export async function getMemberDashboard() {
  const { data } = await api.get(
    "/api/member/dashboard"
  );

  return data;
}