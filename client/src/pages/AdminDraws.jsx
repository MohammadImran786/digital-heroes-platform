import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import api from "../services/api";

function AdminDraws() {
  const [drawMonth, setDrawMonth] = useState(
    `${new Date().getFullYear()}-${String(
      new Date().getMonth() + 1
    ).padStart(2, "0")}-01`
  );

  const [drawType, setDrawType] =
    useState("random");

  const [simulation, setSimulation] =
    useState(null);

  const [drawId, setDrawId] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const simulate = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(
        "/api/draws/simulate",
        {
          drawMonth,
          drawType,
        }
      );

      setSimulation(data.simulation);
      setDrawId(data.simulation.drawId);

      setMessage(
        "Simulation generated successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Simulation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await api.post(
        "/api/draws/publish",
        {
          drawId,
        }
      );

      setMessage(
        "Draw published successfully."
      );

      setSimulation(null);

      console.log("Published draw:", data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Publishing failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Admin dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Draw management
        </h1>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white border border-gray-200 p-7">
          <h2 className="text-xl font-semibold">
            Create simulation
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Draw month
              </label>

              <input
                type="date"
                value={drawMonth}
                onChange={(e) =>
                  setDrawMonth(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Draw type
              </label>

              <select
                value={drawType}
                onChange={(e) =>
                  setDrawType(e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              >
                <option value="random">
                  Random
                </option>

                <option value="algorithmic">
                  Algorithmic
                </option>
              </select>
            </div>
          </div>

          <button
            onClick={simulate}
            disabled={loading}
            className="mt-6 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : "Run simulation"}
          </button>
        </div>

        {simulation && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-200 p-7">
            <h2 className="text-xl font-semibold">
              Simulation result
            </h2>

            <p className="mt-4 text-gray-600">
              Participants:{" "}
              <strong>
                {simulation.participantCount}
              </strong>
            </p>

            <p className="mt-2 text-gray-600">
              Prize pool:{" "}
              <strong>
                ₹
                {Number(
                  simulation.prizePool
                ).toLocaleString("en-IN")}
              </strong>
            </p>

            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Winning numbers
              </p>

              <div className="flex gap-3 mt-3">
                {simulation.winningNumbers.map(
                  (number) => (
                    <span
                      key={number}
                      className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold"
                    >
                      {number}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="mt-7 grid md:grid-cols-3 gap-4">
              {Object.entries(
                simulation.tierCounts
              ).map(([tier, count]) => (
                <div
                  key={tier}
                  className="rounded-2xl bg-gray-50 p-5"
                >
                  <p className="text-sm text-gray-500">
                    {tier}
                  </p>

                  <p className="mt-2 text-2xl font-semibold">
                    {count}
                  </p>

                  <p className="mt-2 text-sm">
                    Prize each: ₹
                    {Number(
                      simulation.payouts[tier]
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={publish}
              disabled={loading}
              className="mt-8 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white disabled:opacity-60"
            >
              Publish draw
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDraws;