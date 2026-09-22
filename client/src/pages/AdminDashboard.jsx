import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getAdminOverview } from "../services/adminService";

function money(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

function AdminDashboard() {
  const { profile, logout } = useAuth();

  const [stats, setStats] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data =
          await getAdminOverview();

        setStats(data.stats);
      } catch (error) {
        console.error(
          "Admin dashboard error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/admin">
            <span className="font-semibold text-xl">
              Digital Heroes Admin
            </span>
          </Link>

          <button
            onClick={logout}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-3 text-4xl font-semibold text-gray-900">
          Welcome, {profile?.full_name || "Admin"}.
        </h1>

        <p className="mt-3 text-gray-600">
          Manage the platform from one place.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Total users
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {loading ? "..." : stats?.totalUsers}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Active subscribers
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {loading
                ? "..."
                : stats?.activeSubscribers}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Prize pool
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {loading
                ? "..."
                : money(stats?.totalPrizePool)}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Winners
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {loading
                ? "..."
                : stats?.totalWinners}
            </p>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            to="/admin/users"
            className="rounded-3xl bg-white border border-gray-200 p-6 hover:border-gray-400 transition"
          >
            <h2 className="font-semibold text-lg">
              User management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Manage profiles, subscriptions and scores.
            </p>
          </Link>

          <Link
            to="/admin/draws"
            className="rounded-3xl bg-white border border-gray-200 p-6 hover:border-gray-400 transition"
          >
            <h2 className="font-semibold text-lg">
              Draw management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Simulate and publish monthly draws.
            </p>
          </Link>

          <Link
            to="/admin/charities"
            className="rounded-3xl bg-white border border-gray-200 p-6 hover:border-gray-400 transition"
          >
            <h2 className="font-semibold text-lg">
              Charity management
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add, edit and manage charity listings.
            </p>
          </Link>

          <Link
            to="/admin/winners"
            className="rounded-3xl bg-white border border-gray-200 p-6 hover:border-gray-400 transition"
          >
            <h2 className="font-semibold text-lg">
              Winner verification
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Review proof and manage payouts.
            </p>
          </Link>

          <Link
            to="/admin/reports"
            className="rounded-3xl bg-gray-900 text-white p-6 hover:bg-gray-800 transition"
          >
            <h2 className="font-semibold text-lg">
              Reports & analytics
            </h2>

            <p className="mt-2 text-sm text-gray-300">
              View platform activity and performance.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;