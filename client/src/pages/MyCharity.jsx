import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getCharities,
  getUserCharity,
  saveUserCharity,
} from "../services/charityService";

function MyCharity() {
  const { user } = useAuth();

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [percentage, setPercentage] = useState(10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        const [charityData, userCharity] = await Promise.all([
          getCharities(),
          getUserCharity(user.id),
        ]);

        setCharities(charityData || []);

        if (userCharity) {
          setSelectedCharity(userCharity.charity_id);
          setPercentage(Number(userCharity.contribution_percentage));
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!selectedCharity) {
      setError("Please select a charity.");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      await saveUserCharity({
        userId: user.id,
        charityId: selectedCharity,
        percentage,
      });

      setMessage("Your charity preference has been saved.");
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        <p className="text-gray-500">Loading charities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
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

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Your impact
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Choose a cause
            <br />
            you care about.
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Direct at least 10% of your subscription towards a
            charity of your choice.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Select your charity
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-5">
            {charities.map((charity) => {
              const selected = selectedCharity === charity.id;

              return (
                <button
                  key={charity.id}
                  type="button"
                  onClick={() => setSelectedCharity(charity.id)}
                  className={`text-left overflow-hidden rounded-3xl border bg-white transition ${
                    selected
                      ? "border-gray-900 ring-2 ring-gray-900/10"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={charity.image_url}
                    alt={charity.name}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {charity.name}
                        </h3>

                        <p className="mt-2 text-sm text-gray-600 leading-6">
                          {charity.description}
                        </p>
                      </div>

                      {selected && (
                        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-10 max-w-2xl rounded-3xl bg-white border border-gray-200 p-7">
          <h2 className="text-xl font-semibold">
            Your contribution
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Choose how much of your subscription should support your
            selected charity.
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Charity contribution
              </span>

              <span className="text-2xl font-semibold">
                {percentage}%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) =>
                setPercentage(Number(e.target.value))
              }
              className="mt-6 w-full"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>10% minimum</span>
              <span>100%</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-8 w-full rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save charity preference"}
          </button>
        </section>
      </main>
    </div>
  );
}

export default MyCharity;