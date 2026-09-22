import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { getCharities } from "../services/charityService";

function Charities() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCharities() {
      try {
        const data = await getCharities();
        setCharities(data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCharities();
  }, []);

  const filteredCharities = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return charities;
    }

    return charities.filter(
      (charity) =>
        charity.name.toLowerCase().includes(query) ||
        charity.description?.toLowerCase().includes(query)
    );
  }, [charities, search]);

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="font-semibold text-xl">
            Digital Heroes
          </Link>

          <Link
            to="/login"
            className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Give back
          </p>

          <h1 className="mt-3 text-5xl font-semibold tracking-tight">
            Choose a cause
            <br />
            worth playing for.
          </h1>

          <p className="mt-5 text-lg text-gray-600">
            Every subscriber can direct part of their membership
            towards a charity they care about.
          </p>
        </div>

        <div className="mt-10 relative max-w-xl">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities..."
            className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-4 outline-none focus:border-gray-900"
          />
        </div>

        {loading && (
          <p className="mt-10 text-gray-500">Loading charities...</p>
        )}

        {error && (
          <p className="mt-10 text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
              >
                <img
                  src={charity.image_url}
                  alt={charity.name}
                  className="h-52 w-full object-cover"
                />

                <div className="p-6">
                  {charity.featured && (
                    <span className="text-xs uppercase tracking-wider text-green-700">
                      Featured
                    </span>
                  )}

                  <h2 className="mt-2 text-xl font-semibold">
                    {charity.name}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {charity.description}
                  </p>

                  <Link
                    to={`/charities/${charity.id}`}
                    className="mt-5 inline-flex items-center gap-2 font-medium"
                  >
                    Explore
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          filteredCharities.length === 0 && (
            <div className="mt-10 rounded-3xl bg-white border border-gray-200 p-10 text-center">
              No charities found.
            </div>
          )}
      </main>
    </div>
  );
}

export default Charities;