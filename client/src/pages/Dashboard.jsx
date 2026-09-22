import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getUserCharity } from "../services/charityService";
import {
  getMySubscription,
  cancelSubscription,
} from "../services/subscriptionService";
import api from "../services/api";

function Dashboard() {
  const { user, profile, logout } = useAuth();

  const [userCharity, setUserCharity] = useState(null);
  const [scoreCount, setScoreCount] = useState(0);
  const [subscription, setSubscription] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;

      try {
        const [charity, scoresResponse] = await Promise.all([
          getUserCharity(user.id),
          api.get("/api/scores"),
        ]);

        setUserCharity(charity);
        
        // Safety check for scores response array
        const scoresList = Array.isArray(scoresResponse.data) 
          ? scoresResponse.data 
          : (scoresResponse.data?.scores || []);
          
        setScoreCount(scoresList.length);
      } catch (error) {
        console.error("Dashboard loading error:", error);
      }
    }

    loadDashboard();
  }, [user]);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const data = await getMySubscription();
        // Handle array response from API if array is returned
        const activeSub = Array.isArray(data) ? data[0] : data;
        setSubscription(activeSub);
      } catch (error) {
        console.error("Subscription loading error:", error);
      }
    }

    loadSubscription();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/dashboard">
            <span className="font-semibold text-xl">Digital Heroes</span>
          </Link>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Member dashboard
          </p>

          <h1 className="mt-3 text-4xl font-semibold text-gray-900">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}.
          </h1>

          <p className="mt-3 text-gray-600">
            Your golf journey and charitable impact, all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {/* Dynamic Subscription Card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500">Subscription</p>

              {subscription?.status === "active" ? (
                <div className="mt-4">
                  <span className="inline-flex rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                    Active
                  </span>

                  <p className="mt-3 text-sm text-gray-500">
                    {subscription.plan === "yearly"
                      ? "Yearly membership"
                      : "Monthly membership"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Renewal:{" "}
                    {subscription.renewal_date || "Not available"}
                  </p>

                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Cancel subscription at the end of the current billing period?"
                      );

                      if (!confirmed) return;

                      setCancelLoading(true);

                      try {
                        await cancelSubscription();

                        setSubscription((previous) => ({
                          ...previous,
                          status: "active",
                        }));

                        alert(
                          "Your subscription is scheduled for cancellation at the end of the billing period."
                        );
                      } catch (error) {
                        alert(
                          error.response?.data?.message ||
                            "Unable to cancel subscription"
                        );
                      } finally {
                        setCancelLoading(false);
                      }
                    }}
                    disabled={cancelLoading}
                    className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline block disabled:opacity-50"
                  >
                    {cancelLoading ? "Updating..." : "Cancel at period end"}
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="inline-flex rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-sm font-medium">
                    Inactive
                  </span>

                  <div className="mt-4">
                    <Link
                      to="/pricing"
                      className="inline-block rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      Become a member
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scores Card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500">Latest scores</p>

              <p className="mt-3 text-2xl font-semibold">{scoreCount} / 5</p>
            </div>

            <Link
              to="/dashboard/scores"
              className="inline-block mt-4 text-sm font-medium underline"
            >
              Manage scores
            </Link>
          </div>

          {/* Charity Card */}
          <div className="rounded-2xl bg-white border border-gray-200 p-6 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500">Charity contribution</p>

              <p className="mt-3 text-2xl font-semibold">
                {userCharity
                  ? `${userCharity.contribution_percentage}%`
                  : "Not selected"}
              </p>
            </div>

            <Link
              to="/dashboard/charity"
              className="inline-block mt-4 text-sm font-medium underline"
            >
              {userCharity ? "Change charity" : "Choose charity"}
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="rounded-3xl bg-white border border-gray-200 p-7">
            <p className="text-sm uppercase tracking-wider text-gray-500">
              Your chosen cause
            </p>

            {userCharity ? (
              <>
                <h2 className="mt-3 text-2xl font-semibold">
                  {userCharity.charities?.name}
                </h2>

                <p className="mt-3 text-gray-600 leading-7">
                  {userCharity.charities?.description}
                </p>

                <div className="mt-6 rounded-2xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">Contribution</p>

                  <p className="mt-1 text-xl font-semibold">
                    {userCharity.contribution_percentage}%
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}
                      of your subscription
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-2xl font-semibold">
                  No charity selected yet
                </h2>

                <p className="mt-3 text-gray-600">
                  Choose a cause and start creating impact through your
                  membership.
                </p>

                <Link
                  to="/dashboard/charity"
                  className="inline-block mt-6 rounded-xl bg-gray-900 text-white px-5 py-3 font-medium hover:bg-gray-800 transition-colors"
                >
                  Choose a charity
                </Link>
              </>
            )}
          </div>

          <div className="rounded-3xl bg-gray-900 text-white p-7">
            <p className="text-sm uppercase tracking-wider text-gray-400">
              What's next
            </p>

            <h2 className="mt-3 text-3xl font-semibold">Play. Give. Win.</h2>

            <p className="mt-4 text-gray-300 leading-7">
              Keep your latest five scores updated, support a cause you care
              about and take part in monthly reward draws.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/dashboard/scores"
                className="rounded-xl bg-white text-gray-900 px-5 py-3 font-medium hover:bg-gray-100 transition-colors"
              >
                Update scores
              </Link>

              <Link
                to="/dashboard/charity"
                className="rounded-xl border border-gray-600 px-5 py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                My charity
              </Link>

              <Link
                to="/dashboard/draws"
                className="rounded-xl border border-gray-300 bg-white text-gray-900 px-5 py-3 font-medium hover:bg-gray-50 transition-colors"
              >
                View draws
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;