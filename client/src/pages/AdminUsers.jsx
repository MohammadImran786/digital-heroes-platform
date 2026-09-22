import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getAdminUsers,
  updateAdminUser,
  updateAdminSubscription,
  getAdminUserScores,
  updateAdminScore,
  deleteAdminScore,
} from "../services/adminService";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [scores, setScores] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [working, setWorking] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadUsers = async () => {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      setError(
        error.message ||
          "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const selectUser = async (user) => {
    setSelectedUser(user);
    setMessage("");
    setError("");

    try {
      const data =
        await getAdminUserScores(user.id);

      setScores(data);
    } catch (error) {
      setError(
        error.message ||
          "Unable to load scores"
      );
    }
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    setWorking(true);
    setMessage("");
    setError("");

    try {
      await updateAdminUser(
        selectedUser.id,
        {
          fullName:
            selectedUser.full_name,
          role: selectedUser.role,
        }
      );

      if (selectedUser.subscription) {
        await updateAdminSubscription(
          selectedUser.id,
          {
            plan:
              selectedUser.subscription.plan,
            status:
              selectedUser.subscription.status,
            amount:
              selectedUser.subscription.amount,
            renewalDate:
              selectedUser.subscription.renewal_date,
          }
        );
      }

      setMessage(
        "User information updated."
      );

      await loadUsers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to update user"
      );
    } finally {
      setWorking(false);
    }
  };

  const saveScore = async (score) => {
    setWorking(true);
    setMessage("");
    setError("");

    try {
      await updateAdminScore(
        score.id,
        {
          score: score.score,
          scoreDate: score.score_date,
        }
      );

      setMessage("Score updated.");

      if (selectedUser) {
        setScores(
          await getAdminUserScores(
            selectedUser.id
          )
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setWorking(false);
    }
  };

  const removeScore = async (id) => {
    if (!window.confirm(
      "Delete this score?"
    )) {
      return;
    }

    setWorking(true);

    try {
      await deleteAdminScore(id);

      if (selectedUser) {
        setScores(
          await getAdminUserScores(
            selectedUser.id
          )
        );
      }

      setMessage("Score deleted.");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Admin dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Administration
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          User management
        </h1>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="mt-8 grid lg:grid-cols-[1.5fr_1fr] gap-6">
          <div className="rounded-3xl bg-white border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="font-semibold">
                Registered users
              </h2>
            </div>

            {loading ? (
              <div className="p-6">
                Loading users...
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() =>
                      selectUser(user)
                    }
                    className={`w-full text-left px-6 py-5 hover:bg-gray-50 ${
                      selectedUser?.id === user.id
                        ? "bg-gray-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {user.full_name ||
                            "Unnamed user"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {user.id.slice(0, 12)}...
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs rounded-full bg-gray-100 px-3 py-1 capitalize">
                          {user.role}
                        </span>

                        <p className="text-xs text-gray-500 mt-2">
                          {user.subscription?.status ||
                            "No subscription"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white border border-gray-200 p-6">
            {!selectedUser ? (
              <div className="py-10 text-center text-gray-500">
                Select a user to manage their profile,
                subscription and scores.
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold">
                  Manage user
                </h2>

                <div className="mt-6">
                  <label className="text-sm font-medium">
                    Full name
                  </label>

                  <input
                    value={
                      selectedUser.full_name || ""
                    }
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        full_name:
                          e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium">
                    Role
                  </label>

                  <select
                    value={selectedUser.role}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        role: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium">
                    Subscription status
                  </label>

                  <select
                    value={
                      selectedUser.subscription
                        ?.status || "inactive"
                    }
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        subscription: {
                          ...selectedUser.subscription,
                          plan:
                            selectedUser.subscription
                              ?.plan ||
                            "monthly",
                          amount:
                            selectedUser.subscription
                              ?.amount ||
                            499,
                          renewal_date:
                            selectedUser.subscription
                              ?.renewal_date ||
                            null,
                          status:
                            e.target.value,
                        },
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3"
                  >
                    <option value="active">
                      Active
                    </option>
                    <option value="inactive">
                      Inactive
                    </option>
                    <option value="cancelled">
                      Cancelled
                    </option>
                    <option value="past_due">
                      Past due
                    </option>
                  </select>
                </div>

                <button
                  onClick={saveUser}
                  disabled={working}
                  className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 text-white font-medium disabled:opacity-50"
                >
                  {working
                    ? "Saving..."
                    : "Save changes"}
                </button>

                <div className="mt-10">
                  <h3 className="font-semibold">
                    User scores
                  </h3>

                  <div className="mt-4 space-y-3">
                    {scores.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No scores.
                      </p>
                    ) : (
                      scores.map((score) => (
                        <div
                          key={score.id}
                          className="rounded-2xl bg-gray-50 p-4"
                        >
                          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                            <div>
                              <label className="text-xs text-gray-500">
                                Score
                              </label>

                              <input
                                type="number"
                                min="1"
                                max="45"
                                value={score.score}
                                onChange={(e) =>
                                  setScores(
                                    scores.map(
                                      (item) =>
                                        item.id ===
                                        score.id
                                          ? {
                                              ...item,
                                              score:
                                                e.target.value,
                                            }
                                          : item
                                    )
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">
                                Date
                              </label>

                              <input
                                type="date"
                                value={
                                  score.score_date
                                }
                                onChange={(e) =>
                                  setScores(
                                    scores.map(
                                      (item) =>
                                        item.id ===
                                        score.id
                                          ? {
                                              ...item,
                                              score_date:
                                                e.target
                                                  .value,
                                            }
                                          : item
                                    )
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                              />
                            </div>

                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  saveScore(
                                    score
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-white"
                                title="Save"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  removeScore(
                                    score.id
                                  )
                                }
                                className="p-2 rounded-lg hover:bg-white"
                                title="Delete"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminUsers;