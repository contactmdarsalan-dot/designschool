import {
  ArrowRight,
  BrainCircuit,
  Gamepad2,
  Bug,
  Code2,
  Puzzle,
  Timer,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { codeGames } from '../data/codeGames';

const iconByGameId = {
  'loop-runner': Gamepad2,
  'debug-dungeon': Bug,
  'array-arena': Code2,
  'algorithm-race': Timer,
  'sql-quest': Puzzle,
  'system-design-sim': BrainCircuit,
};

const statusClass = {
  Playable: 'text-emerald-200 bg-emerald-500/20 border-emerald-400/40',
  'Coming Soon': 'text-amber-200 bg-amber-500/20 border-amber-400/40',
};

const PlayCodeGamePage = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 pb-14 pt-8 md:px-8 md:pb-18">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.28),rgba(0,0,0,0.96)_62%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:180px_180px] opacity-30" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Play Code Game
              </span>
              <h1 className="mt-6 text-[2.15rem] font-semibold leading-[1.1] tracking-tight md:text-[4.65rem]">
                Learn Coding Through Interactive Games
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-white/70 md:text-xl">
                This platform is where all our coding games are being created, tested, and
                improved for students.
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100 md:mt-10 md:text-base">
              All interactive coding games for students will be created in this platform. New
              challenges and multiplayer rounds will be added continuously.
            </div>

            <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {codeGames.map((game) => {
                const Icon = iconByGameId[game.id];
                return (
                  <article
                    key={game.id}
                    className="group rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(18,18,20,0.95),rgba(5,5,7,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/12">
                        <Icon className="h-6 w-6 text-emerald-300" />
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClass[game.status]}`}
                      >
                        {game.status}
                      </span>
                    </div>

                    <h2 className="mt-5 text-[1.5rem] font-semibold leading-[1.2] tracking-tight md:text-[1.85rem]">
                      {game.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                      {game.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2.5">
                      <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/70">
                        {game.difficulty}
                      </span>
                      <span className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/70">
                        {game.duration}
                      </span>
                    </div>

                    <Link
                      to={`/play-code-game/${game.id}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                    >
                      Play Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>

            <div className="mt-12 rounded-3xl border border-white/15 bg-[#0a0a0d]/85 p-6 text-center md:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/12">
                <Trophy className="h-7 w-7 text-emerald-300" />
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                Weekly Game Challenges
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70 md:text-base">
                Students will get weekly coding game challenges, scoreboards, and progress badges
                directly from this platform.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PlayCodeGamePage;
