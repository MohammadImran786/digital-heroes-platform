import { Link } from "react-router-dom";

function SubscriptionSuccess() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-6">
      <div className="max-w-lg w-full rounded-3xl bg-white border border-gray-200 p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-semibold">
          Payment successful.
        </h1>

        <p className="mt-4 text-gray-600 leading-7">
          Your payment has been received. Your membership status
          will be synchronized from Stripe and appear in your
          dashboard.
        </p>

        <Link
          to="/dashboard"
          className="inline-block mt-7 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

export default SubscriptionSuccess;