import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";

import api from "../services/api";

function Draws() {
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [drawResponse, winningsResponse] =
        await Promise.all([
          api.get("/api/draws"),
          api.get("/api/winners/my"),
        ]);

      setDraws(drawResponse.data.draws || []);
      setWinnings(
        winningsResponse.data.winners || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load draw information"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProofUpload = async (
    winnerId,
    file
  ) => {
    if (!file) return;

    setUploadingId(winnerId);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("proof", file);

      await api.post(
        `/api/winners/${winnerId}/proof`,
        formData
      );

      setMessage(
        "Proof uploaded successfully. It is now awaiting admin review."
      );

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to upload proof"
      );
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        Loading draws...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link
            to="/dashboard"
            className="inline-flex gap-2 items-center text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Monthly rewards
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Draws & winnings
        </h1>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-10 grid gap-5">
          {draws.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gray-200 p-8">
              No published draws yet.
            </div>
          ) : (
            draws.map((draw) => (
              <div
                key={draw.id}
                className="rounded-3xl bg-white border border-gray-200 p-7"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Monthly draw
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {new Date(
                        `${draw.draw_month}T00:00:00`
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </h2>
                  </div>

                  <span className="text-sm text-gray-500 capitalize">
                    {draw.draw_type}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {draw.winning_numbers?.map(
                    (number) => (
                      <div
                        key={number}
                        className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold"
                      >
                        {number}
                      </div>
                    )
                  )}
                </div>

                <p className="mt-5 text-gray-600">
                  Prize pool:{" "}
                  <strong>
                    ₹
                    {Number(
                      draw.prize_pool
                    ).toLocaleString("en-IN")}
                  </strong>
                </p>
              </div>
            ))
          )}
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">
            Your winnings
          </h2>

          <div className="mt-5 grid gap-4">
            {winnings.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200 p-6 text-gray-500">
                No winnings yet. Keep playing.
              </div>
            ) : (
              winnings.map((winner) => (
                <div
                  key={winner.id}
                  className="rounded-2xl bg-white border border-gray-200 p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <p className="font-semibold text-lg">
                        {winner.tier}
                      </p>

                      <p className="mt-1 text-gray-500">
                        Won ₹
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

                    <div>
                      {winner.verification_status !==
                        "approved" && (
                        <label
                          className={`inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white cursor-pointer ${
                            uploadingId === winner.id
                              ? "opacity-60"
                              : ""
                          }`}
                        >
                          <Upload size={16} />

                          {uploadingId === winner.id
                            ? "Uploading..."
                            : winner.proof_path
                            ? "Replace proof"
                            : "Upload proof"}

                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            disabled={
                              uploadingId ===
                              winner.id
                            }
                            onChange={(e) =>
                              handleProofUpload(
                                winner.id,
                                e.target.files?.[0]
                              )
                            }
                          />
                        </label>
                      )}

                      {winner.proofUrl && (
                        <a
                          href={winner.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block mt-3 text-sm font-medium underline"
                        >
                          View submitted proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Draws;