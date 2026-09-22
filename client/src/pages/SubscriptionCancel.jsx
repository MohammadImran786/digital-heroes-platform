import { Link } from "react-router-dom";

function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-3xl bg-white border border-gray-200 p-8 text-center">
        <h1 className="text-3xl font-semibold">
          Checkout cancelled.
        </h1>

        <p className="mt-4 text-gray-600">
          No subscription was activated.
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <Link
            to="/pricing"
            className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white"
          >
            Back to plans
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-gray-300 px-5 py-3 font-medium"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCancel;