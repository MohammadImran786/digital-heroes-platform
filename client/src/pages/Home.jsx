import {
  ArrowRight,
  Heart,
  Trophy,
  BarChart3,
} from "lucide-react";

import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-[#f7f7f2] text-gray-900">
      {/* NAVBAR */}

      <header className="border-b border-gray-200 bg-[#f7f7f2]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-semibold text-xl">
            Digital Heroes
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/charities"
              className="hidden sm:block px-4 py-2 text-sm font-medium"
            >
              Charities
            </Link>

            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium"
            >
              Sign in
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Join now
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}

      <main>
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600">
              Golf with a bigger purpose
            </span>

            <h1 className="mt-7 text-6xl md:text-8xl font-semibold tracking-[-0.05em] leading-[0.95]">
              Play better.
              <br />
              Give back.
              <br />
              Win together.
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-8 text-gray-600">
              Track your latest golf scores, support a cause you
              care about and take part in monthly reward draws.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3.5 font-medium text-white"
              >
                Start playing
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/charities"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-medium"
              >
                Explore charities
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}

        <section className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                How it works
              </p>

              <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
                Simple to join.
                <br />
                Meaningful to play.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="rounded-3xl bg-[#f7f7f2] p-7">
                <BarChart3 size={28} />

                <p className="mt-8 text-sm text-gray-500">
                  01
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  Track your game
                </h3>

                <p className="mt-3 text-gray-600 leading-7">
                  Keep your five latest Stableford scores updated
                  in one simple place.
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f7f2] p-7">
                <Heart size={28} />

                <p className="mt-8 text-sm text-gray-500">
                  02
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  Support a cause
                </h3>

                <p className="mt-3 text-gray-600 leading-7">
                  Direct at least 10% of your membership towards a
                  charity you choose.
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f7f2] p-7">
                <Trophy size={28} />

                <p className="mt-8 text-sm text-gray-500">
                  03
                </p>

                <h3 className="mt-2 text-2xl font-semibold">
                  Enter monthly draws
                </h3>

                <p className="mt-3 text-gray-600 leading-7">
                  Your latest scores form your draw entry for
                  monthly rewards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CHARITY */}

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="rounded-[2rem] bg-gray-900 text-white p-8 md:p-14">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400">
                Your impact
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight">
                Your membership can mean more than a monthly
                payment.
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-300">
                Choose a charity, decide your contribution percentage
                and make your game part of something bigger.
              </p>

              <Link
                to="/charities"
                className="inline-flex items-center gap-2 mt-8 rounded-xl bg-white text-gray-900 px-6 py-3.5 font-medium"
              >
                Discover causes
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* DRAW */}

        <section className="bg-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
                Monthly rewards
              </p>

              <h2 className="mt-3 text-4xl md:text-5xl font-semibold">
                A monthly draw
                <br />
                built around your game.
              </h2>

              <p className="mt-5 text-gray-600 leading-8">
                Active members participate using their latest five
                Stableford scores. The platform supports random and
                score-frequency-based draw modes.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f7f7f2] p-8">
              <div className="flex gap-3">
                {[12, 18, 27, 34, 42].map(
                  (number) => (
                    <div
                      key={number}
                      className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold"
                    >
                      {number}
                    </div>
                  )
                )}
              </div>

              <p className="mt-7 text-sm text-gray-500">
                Example winning numbers
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-gray-500">
                    5-match
                  </p>

                  <p className="mt-2 font-semibold">
                    40%
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-gray-500">
                    4-match
                  </p>

                  <p className="mt-2 font-semibold">
                    35%
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5">
                  <p className="text-sm text-gray-500">
                    3-match
                  </p>

                  <p className="mt-2 font-semibold">
                    25%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="max-w-7xl mx-auto px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            Ready?
          </p>

          <h2 className="mt-3 text-5xl md:text-7xl font-semibold tracking-tight">
            Your next round
            <br />
            can give back.
          </h2>

          <Link
            to="/signup"
            className="inline-flex items-center gap-2 mt-8 rounded-xl bg-gray-900 px-7 py-4 text-white font-medium"
          >
            Join Digital Heroes
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-col sm:flex-row justify-between gap-3 text-sm text-gray-500">
          <span>© 2026 Digital Heroes</span>

          <span>Play better. Give back.</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;