import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getMemberDashboard } from "../services/memberService";
import { cancelSubscription } from "../services/subscriptionService";

function Dashboard() {
  const { user, logout } = useAuth();

  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMemberDashboard();

      setMemberData(data);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      "Cancel subscription at the end of the current billing period?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelLoading(true);
      setError("");
      setMessage("");

      await cancelSubscription();

      setMessage(
        "Your subscription has been scheduled for cancellation at the end of the current billing period."
      );
    } catch (error) {
      console.error("Cancel subscription error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to cancel subscription"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Digital Heroes
          </p>

          <p className="mt-3 text-gray-600">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!memberData) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl bg-white border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-gray-600">
            {error || "No member data was returned."}
          </p>

          <button
            onClick={loadDashboard}
            className="mt-6 rounded-xl bg-gray-900 px-5 py-3 text-white font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const profile = memberData.profile;

  const subscription = memberData.subscription;

  const charity = memberData.charity;

  const scores = memberData.scores || [];

  const winnings = memberData.winnings || [];

  const isActiveSubscriber =
    subscription?.status === "active";

  const totalWinnings = winnings.reduce(
    (total, winner) =>
      total + Number(winner.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      {/* HEADER */}

      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="font-semibold text-xl text-gray-900"
          >
            Digital Heroes
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* INTRO */}

        <section>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Member dashboard
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            Welcome
            {profile?.full_name
              ? `, ${profile.full_name}`
              : ""}
            .
          </h1>

          <p className="mt-4 max-w-2xl text-gray-600 text-lg">
            Your golf journey, charitable impact and monthly rewards
            in one place.
          </p>
        </section>

        {/* MESSAGES */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* STATS */}

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {/* SUBSCRIPTION */}

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Subscription
            </p>

            <div className="mt-4">
              {isActiveSubscriber ? (
                <>
                  <span className="inline-flex rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                    Active
                  </span>

                  <p className="mt-3 text-sm text-gray-500 capitalize">
                    {subscription.plan || "Monthly"} membership
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Renewal:{" "}
                    {subscription.renewal_date ||
                      "Not available"}
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm font-medium">
                    Inactive
                  </span>

                  <Link
                    to="/pricing"
                    className="inline-block mt-4 rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Become a member
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* SCORES */}

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Latest scores
            </p>

            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {scores.length} / 5
            </p>

            <Link
              to="/dashboard/scores"
              className="inline-block mt-4 text-sm font-medium underline"
            >
              Manage scores
            </Link>
          </div>

          {/* CHARITY */}

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Charity contribution
            </p>

            <p className="mt-3 text-3xl font-semibold text-gray-900">
              {charity
                ? `${charity.contribution_percentage}%`
                : "Not selected"}
            </p>

            <Link
              to="/dashboard/charity"
              className="inline-block mt-4 text-sm font-medium underline"
            >
              {charity
                ? "Change charity"
                : "Choose charity"}
            </Link>
          </div>

          {/* WINNINGS */}

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            <p className="text-sm text-gray-500">
              Total winnings
            </p>

            <p className="mt-3 text-3xl font-semibold text-gray-900">
              ₹
              {totalWinnings.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })}
            </p>

            <Link
              to="/dashboard/draws"
              className="inline-block mt-4 text-sm font-medium underline"
            >
              View winnings
            </Link>
          </div>
        </section>

        {/* LOWER CARDS */}

        <section className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* CHARITY */}

          <div className="rounded-3xl bg-white border border-gray-200 p-7">
            <p className="text-sm uppercase tracking-wider text-gray-500">
              Your chosen cause
            </p>

            {charity ? (
              <>
                {charity.charities?.image_url && (
                  <img
                    src={charity.charities.image_url}
                    alt={charity.charities.name}
                    className="mt-5 h-48 w-full rounded-2xl object-cover"
                  />
                )}

                <h2 className="mt-6 text-2xl font-semibold text-gray-900">
                  {charity.charities?.name ||
                    "Selected charity"}
                </h2>

                <p className="mt-3 text-gray-600 leading-7">
                  {charity.charities?.description ||
                    "Thank you for supporting this cause."}
                </p>

                <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Your contribution
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {charity.contribution_percentage}%
                    <span className="ml-1 text-sm text-gray-500 font-normal">
                      of your subscription
                    </span>
                  </p>
                </div>

                <Link
                  to="/dashboard/charity"
                  className="inline-block mt-6 rounded-xl bg-gray-900 text-white px-5 py-3 font-medium hover:bg-gray-800 transition"
                >
                  Manage charity
                </Link>
              </>
            ) : (
              <>
                <h2 className="mt-4 text-2xl font-semibold">
                  Choose a cause
                </h2>

                <p className="mt-3 text-gray-600 leading-7">
                  Select a charity and direct at least 10% of your
                  membership towards it.
                </p>

                <Link
                  to="/dashboard/charity"
                  className="inline-block mt-6 rounded-xl bg-gray-900 text-white px-5 py-3 font-medium"
                >
                  Choose charity
                </Link>
              </>
            )}
          </div>

          {/* MEMBERSHIP / QUICK ACTIONS */}

          <div className="rounded-3xl bg-gray-900 text-white p-7">
            <p className="text-sm uppercase tracking-wider text-gray-400">
              Your membership
            </p>

            <h2 className="mt-3 text-3xl font-semibold">
              Play. Give. Win.
            </h2>

            <p className="mt-4 text-gray-300 leading-7">
              Keep your latest five scores updated, support a cause you
              care about and take part in monthly reward draws.
            </p>

            <div className="mt-7 grid sm:grid-cols-2 gap-3">
              <Link
                to="/dashboard/scores"
                className="rounded-xl bg-white text-gray-900 px-5 py-3 font-medium text-center hover:bg-gray-100 transition"
              >
                Update scores
              </Link>

              <Link
                to="/dashboard/charity"
                className="rounded-xl border border-gray-600 px-5 py-3 font-medium text-center hover:bg-gray-800 transition"
              >
                My charity
              </Link>

              <Link
                to="/dashboard/draws"
                className="rounded-xl border border-gray-600 px-5 py-3 font-medium text-center hover:bg-gray-800 transition"
              >
                View draws
              </Link>

              {!isActiveSubscriber && (
                <Link
                  to="/pricing"
                  className="rounded-xl bg-white text-gray-900 px-5 py-3 font-medium text-center hover:bg-gray-100 transition"
                >
                  Activate membership
                </Link>
              )}

              {isActiveSubscriber && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                  className="rounded-xl border border-gray-600 px-5 py-3 font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {cancelLoading
                    ? "Updating..."
                    : "Cancel membership"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* RECENT SCORES */}

        <section className="mt-8 rounded-3xl bg-white border border-gray-200 p-7">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-500">
                Performance
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Latest five scores
              </h2>
            </div>

            <Link
              to="/dashboard/scores"
              className="text-sm font-medium underline"
            >
              View all
            </Link>
          </div>

          {scores.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-gray-50 p-6 text-center">
              <p className="font-medium">
                No scores recorded yet.
              </p>

              <Link
                to="/dashboard/scores"
                className="inline-block mt-3 underline text-sm"
              >
                Add your first score
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
              {scores.map((score) => (
                <div
                  key={score.id}
                  className="rounded-2xl bg-gray-50 p-5 text-center"
                >
                  <p className="text-3xl font-semibold">
                    {score.score}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(
                      `${score.score_date}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;