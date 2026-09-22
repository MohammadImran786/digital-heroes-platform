import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

import api from "../services/api";

function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadWinners = async () => {
    try {
      const { data } =
        await api.get("/api/winners/admin");

      setWinners(data.winners || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load winners"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWinners();
  }, []);

  const review = async (
    id,
    verificationStatus
  ) => {
    setWorkingId(id);
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/api/winners/${id}/review`,
        {
          verificationStatus,
        }
      );

      setMessage(
        verificationStatus === "approved"
          ? "Winner approved."
          : "Winner rejected."
      );

      await loadWinners();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update winner"
      );
    } finally {
      setWorkingId(null);
    }
  };

  const markPaid = async (id) => {
    setWorkingId(id);
    setError("");
    setMessage("");

    try {
      await api.patch(
        `/api/winners/${id}/pay`
      );

      setMessage(
        "Payout marked as paid."
      );

      await loadWinners();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to mark payout"
      );
    } finally {
      setWorkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        Loading winners...
      </div>
    );
  }

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
          Winner verification
        </h1>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid gap-5">
          {winners.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gray-200 p-8 text-gray-500">
              No winners available yet.
            </div>
          ) : (
            winners.map((winner) => (
              <div
                key={winner.id}
                className="rounded-3xl bg-white border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <p className="text-sm text-gray-500">
                      Winner
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {winner.profiles?.full_name ||
                        "Member"}
                    </h2>

                    <p className="mt-2 text-gray-600">
                      {winner.tier} · ₹
                      {Number(
                        winner.amount
                      ).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-3 flex gap-2 flex-wrap">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        Verification:{" "}
                        {winner.verification_status}
                      </span>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                        Payment:{" "}
                        {winner.payment_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {winner.proofUrl && (
                      <a
                        href={winner.proofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium"
                      >
                        View proof
                        <ExternalLink size={15} />
                      </a>
                    )}

                    {winner.verification_status ===
                      "pending" && (
                      <>
                        <button
                          onClick={() =>
                            review(
                              winner.id,
                              "approved"
                            )
                          }
                          disabled={
                            workingId === winner.id
                          }
                          className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            review(
                              winner.id,
                              "rejected"
                            )
                          }
                          disabled={
                            workingId === winner.id
                          }
                          className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {winner.verification_status ===
                      "approved" &&
                      winner.payment_status !==
                        "paid" && (
                        <button
                          onClick={() =>
                            markPaid(winner.id)
                          }
                          disabled={
                            workingId === winner.id
                          }
                          className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
                        >
                          Mark as paid
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminWinners;