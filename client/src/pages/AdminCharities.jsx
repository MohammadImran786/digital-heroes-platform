import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import {
  getCharities,
} from "../services/charityService";

import {
  createAdminCharity,
  updateAdminCharity,
  deleteAdminCharity,
} from "../services/adminService";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  website: "",
  featured: false,
};

function AdminCharities() {
  const [charities, setCharities] =
    useState([]);

  const [form, setForm] =
    useState(emptyForm);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const loadCharities = async () => {
    try {
      setCharities(
        await getCharities()
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharities();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const save = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      if (editingId) {
        await updateAdminCharity(
          editingId,
          form
        );

        setMessage(
          "Charity updated successfully."
        );
      } else {
        await createAdminCharity(
          form
        );

        setMessage(
          "Charity created successfully."
        );
      }

      reset();
      await loadCharities();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message
      );
    }
  };

  const edit = (charity) => {
    setEditingId(charity.id);

    setForm({
      name: charity.name,
      slug: charity.slug,
      description:
        charity.description || "",
      imageUrl:
        charity.image_url || "",
      website:
        charity.website || "",
      featured:
        charity.featured,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const remove = async (id) => {
    if (!window.confirm(
      "Delete this charity?"
    )) {
      return;
    }

    try {
      await deleteAdminCharity(id);

      setMessage(
        "Charity deleted successfully."
      );

      await loadCharities();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message
      );
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
          Charity management
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

        <div className="mt-8 grid lg:grid-cols-[380px_1fr] gap-6">
          <form
            onSubmit={save}
            className="rounded-3xl bg-white border border-gray-200 p-6 h-fit"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingId
                  ? "Edit charity"
                  : "Add charity"}
              </h2>

              {editingId && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-sm underline"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Charity name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="slug"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows="5"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="Image URL"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="Website URL"
                className="w-full rounded-xl border border-gray-300 px-4 py-3"
              />

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                />

                Featured charity
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3 text-white font-medium inline-flex justify-center items-center gap-2"
            >
              <Plus size={17} />
              {editingId
                ? "Update charity"
                : "Create charity"}
            </button>
          </form>

          <div>
            {loading ? (
              <p>Loading charities...</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {charities.map((charity) => (
                  <div
                    key={charity.id}
                    className="rounded-3xl bg-white border border-gray-200 overflow-hidden"
                  >
                    {charity.image_url && (
                      <img
                        src={charity.image_url}
                        alt={charity.name}
                        className="h-44 w-full object-cover"
                      />
                    )}

                    <div className="p-5">
                      <div className="flex justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {charity.name}
                          </h3>

                          {charity.featured && (
                            <span className="inline-block mt-2 text-xs rounded-full bg-gray-100 px-3 py-1">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              edit(charity)
                            }
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() =>
                              remove(
                                charity.id
                              )
                            }
                            className="p-2 rounded-lg hover:bg-gray-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-gray-600 leading-6">
                        {charity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminCharities;