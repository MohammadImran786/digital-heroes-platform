import { useState } from "react";
import { Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { createCheckoutSession } from "../services/subscriptionService";

function Pricing() {
  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] = useState("");
  const [error, setError] = useState("");

  const handleSubscribe = async (plan) => {
    setError("");
    setLoadingPlan(plan);

    try {
      const data = await createCheckoutSession(plan);

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error("Checkout URL was not returned");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to start checkout"
      );
    } finally {
      setLoadingPlan("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="font-semibold text-xl"
          >
            Digital Heroes
          </Link>

          <Link
            to="/dashboard/charity"
            className="text-sm font-medium underline"
          >
            Choose charity
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Membership
          </p>

          <h1 className="mt-3 text-5xl font-semibold tracking-tight">
            Choose how you want to play.
          </h1>

          <p className="mt-5 text-lg text-gray-600">
            Join the community, track your scores, support a cause
            and participate in monthly reward draws.
          </p>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="rounded-3xl border border-gray-200 bg-white p-7">
            <p className="text-sm uppercase tracking-wider text-gray-500">
              Monthly
            </p>

            <div className="mt-4">
              <span className="text-4xl font-semibold">
                ₹499
              </span>

              <span className="text-gray-500">
                {" "}
                / month
              </span>
            </div>

            <div className="mt-7 space-y-3">
              {[
                "Track your latest 5 scores",
                "Choose a charity",
                "Participate in monthly draws",
                "View your winnings",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 items-center text-sm text-gray-600"
                >
                  <Check size={17} />
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loadingPlan !== ""}
              className="mt-8 w-full rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loadingPlan === "monthly"
                ? "Opening checkout..."
                : "Choose monthly"}
            </button>
          </div>

          <div className="rounded-3xl border-2 border-gray-900 bg-gray-900 p-7 text-white">
            <p className="text-sm uppercase tracking-wider text-gray-400">
              Yearly
            </p>

            <div className="mt-4">
              <span className="text-4xl font-semibold">
                ₹4,990
              </span>

              <span className="text-gray-400">
                {" "}
                / year
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-400">
              One annual payment for uninterrupted membership.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Everything in monthly",
                "One annual billing cycle",
                "Continuous draw participation",
                "Charity contribution tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 items-center text-sm text-gray-300"
                >
                  <Check size={17} />
                  {item}
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loadingPlan !== ""}
              className="mt-8 w-full rounded-xl bg-white text-gray-900 px-5 py-3 font-medium hover:bg-gray-100 disabled:opacity-60"
            >
              {loadingPlan === "yearly"
                ? "Opening checkout..."
                : "Choose yearly"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Pricing;