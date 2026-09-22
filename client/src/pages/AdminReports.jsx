import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  getAdminReports,
} from "../services/adminService";

function money(value) {
  return `₹${Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
}

function AdminReports() {
  const [reports, setReports] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function load() {
      try {
        setReports(
          await getAdminReports()
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] p-10 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Admin dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Reports & analytics
        </h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Active subscribers
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {reports.subscriptions.active}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Total prize pool
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {money(
                reports.draws.totalPrizePool
              )}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Total winners
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {reports.winners.total}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Paid winnings
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {reports.winners.paid}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">
              Subscription overview
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Total
                </span>

                <strong>
                  {reports.subscriptions.total}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Active
                </span>

                <strong>
                  {reports.subscriptions.active}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Inactive
                </span>

                <strong>
                  {reports.subscriptions.inactive}
                </strong>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-semibold">
              Winner overview
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Total
                </span>

                <strong>
                  {reports.winners.total}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Pending verification
                </span>

                <strong>
                  {reports.winners.pending}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Approved
                </span>

                <strong>
                  {reports.winners.approved}
                </strong>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Total winnings
                </span>

                <strong>
                  {money(
                    reports.winners.totalAmount
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-3xl bg-white border border-gray-200 p-6">
          <h2 className="text-xl font-semibold">
            Charity engagement
          </h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 pr-6 text-sm text-gray-500">
                    Charity
                  </th>

                  <th className="py-3 pr-6 text-sm text-gray-500">
                    Selections
                  </th>

                  <th className="py-3 text-sm text-gray-500">
                    Avg. contribution
                  </th>
                </tr>
              </thead>

              <tbody>
                {reports.charityStats.map(
                  (charity) => (
                    <tr
                      key={charity.id}
                      className="border-b last:border-0 border-gray-100"
                    >
                      <td className="py-4 pr-6 font-medium">
                        {charity.name}
                      </td>

                      <td className="py-4 pr-6">
                        {charity.selections}
                      </td>

                      <td className="py-4">
                        {charity.averageContribution}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-gray-900 text-white p-7">
          <p className="text-sm uppercase tracking-wider text-gray-400">
            Draw activity
          </p>

          <h2 className="mt-2 text-2xl font-semibold">
            Recent published draws
          </h2>

          <div className="mt-6 space-y-3">
            {reports.recentDraws.map(
              (draw) => (
                <div
                  key={draw.id}
                  className="flex justify-between items-center border-b border-gray-700 pb-3"
                >
                  <span>
                    {new Date(
                      `${draw.draw_month}T00:00:00`
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>

                  <strong>
                    {money(draw.prize_pool)}
                  </strong>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminReports;