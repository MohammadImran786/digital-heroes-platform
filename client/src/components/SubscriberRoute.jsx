import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SubscriberRoute({ children }) {
  const {
    user,
    subscription,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        <p className="text-gray-500">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !subscription ||
    subscription.status !== "active"
  ) {
    return (
      <Navigate
        to="/pricing"
        replace
      />
    );
  }

  return children;
}

export default SubscriberRoute;