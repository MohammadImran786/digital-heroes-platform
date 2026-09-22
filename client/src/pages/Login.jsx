import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, profile } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
        await login(formData);
        navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Digital Heroes
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-gray-900">
            Welcome back.
          </h1>

          <p className="mt-3 text-gray-600">
            Sign in to manage your scores, charity and rewards.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-3xl p-7 shadow-sm"
        >
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-gray-900 underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;