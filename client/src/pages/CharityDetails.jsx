import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getCharityById } from "../services/charityService";

function CharityDetails() {
  const { id } = useParams();

  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCharity() {
      try {
        const data = await getCharityById(id);
        setCharity(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadCharity();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center">
        <p className="text-gray-500">Loading charity...</p>
      </div>
    );
  }

  if (error || !charity) {
    return (
      <div className="min-h-screen bg-[#f7f7f2] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Charity not found
          </h1>

          <Link
            to="/charities"
            className="inline-block mt-5 underline"
          >
            Back to charities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f2]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <Link
            to="/charities"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            All charities
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="overflow-hidden rounded-3xl bg-white border border-gray-200">
          <img
            src={charity.image_url}
            alt={charity.name}
            className="w-full h-[350px] object-cover"
          />

          <div className="p-8 md:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              Charity profile
            </p>

            <h1 className="mt-3 text-4xl font-semibold">
              {charity.name}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
              {charity.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-3 font-medium"
                >
                  Visit website
                  <ExternalLink size={16} />
                </a>
              )}

              <Link
                to="/dashboard/charity"
                className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white"
              >
                Choose this charity
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">
            Upcoming events
          </h2>

          {charity.upcoming_events?.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-5 mt-5">
              {charity.upcoming_events.map((event, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    {event.date}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    {event.location}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">
              No upcoming events currently listed.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

export default CharityDetails;