import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";

function Scores() {
  const [scores, setScores] = useState([]);

  const [form, setForm] = useState({
    score: "",
    scoreDate: new Date().toISOString().split("T")[0],
  });

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    try {
      const response = await api.get("/api/scores");

      setScores(response.data.scores || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load scores"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      score: "",
      scoreDate: new Date().toISOString().split("T")[0],
    });

    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/api/scores/${editingId}`, form);

        setMessage("Score updated successfully.");
      } else {
        await api.post("/api/scores", form);

        setMessage("Score added successfully.");
      }

      resetForm();
      await fetchScores();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to save score"
      );
    }
  };

  const handleEdit = (score) => {
    setEditingId(score.id);

    setForm({
      score: String(score.score),
      scoreDate: score.score_date,
    });

    setError("");
    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this score?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/api/scores/${id}`);

      setMessage("Score deleted successfully.");

      await fetchScores();
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to delete score"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <span className="font-semibold">Digital Heroes</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Performance
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-gray-900">
            Your latest scores
          </h1>

          <p className="mt-3 text-gray-600">
            Keep your five most recent Stableford scores up to date.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl p-6">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit score" : "Add a score"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 grid md:grid-cols-[1fr_1fr_auto] gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stableford score
              </label>

              <input
                type="number"
                name="score"
                min="1"
                max="45"
                value={form.score}
                onChange={handleChange}
                required
                placeholder="1 - 45"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>

              <input
                type="date"
                name="scoreDate"
                value={form.scoreDate}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
              >
                <Plus size={18} />
                {editingId ? "Update" : "Add"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            Maximum 5 scores are retained. Adding a new score when
            you already have 5 automatically removes the oldest one.
          </p>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-3xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Score history</h2>

              <span className="text-sm text-gray-500">
                {scores.length} / 5 scores
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-gray-500">
              Loading scores...
            </div>
          ) : scores.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-gray-900">
                No scores yet
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Add your first Stableford score above.
              </p>
            </div>
          ) : (
            <div>
              {scores.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-5 border-b last:border-b-0 border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
                      {item.score}
                    </div>

                    <div>
                      <p className="font-medium text-gray-900">
                        Stableford score
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {item.score_date
                          ? new Date(
                              item.score_date.includes("T")
                                ? item.score_date
                                : `${item.score_date}T00:00:00`
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Scores;