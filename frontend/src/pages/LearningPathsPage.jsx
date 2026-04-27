import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Flame, Layers3, PlayCircle, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { normalizeCourseCard } from '../lib/courseContent';
import { normalizeLearningPath } from '../lib/learningPlatform';

const buildFallbackPaths = (courses) => {
  const grouped = new Map();
  courses.forEach((course) => {
    const key = course.category?.slug || course.tags[0] || 'core';
    const title = course.category?.name ? `${course.category.name} Path` : `${course.tags[0] || 'Core Skills'} Path`;
    const row = grouped.get(key) || {
      id: key,
      title,
      slug: key,
      description: 'Generated from currently published courses while curated paths are being assembled.',
      persisted: false,
      progress: { progressPercent: 0, completedCourses: 0, totalCourses: 0 },
      courses: [],
    };
    row.courses.push(course);
    row.courseCount = row.courses.length;
    row.progress.totalCourses = row.courses.length;
    grouped.set(key, row);
  });
  return Array.from(grouped.values());
};

const LearningPathsPage = () => {
  const [paths, setPaths] = useState([]);
  const [resumeLearning, setResumeLearning] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startingPathSlug, setStartingPathSlug] = useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadPaths = async () => {
      setIsLoading(true);
      try {
        const pathResult = await apiFetch('courses/learning-paths/', {
          auth: isAuthenticated(),
        });
        const backendPaths = (pathResult.payload?.data?.paths || []).map(normalizeLearningPath);

        if (!pathResult.response.ok) {
          throw new Error(pathResult.payload?.message || 'Could not load learning paths');
        }

        let nextPaths = backendPaths;
        if (backendPaths.length === 0) {
          const courseResult = await apiFetch('public/courses/?page=1&limit=60');
          const courses = (courseResult.payload?.data?.courses || []).map(normalizeCourseCard);
          nextPaths = buildFallbackPaths(courses);
        }

        let resume = null;
        if (isAuthenticated()) {
          const resumeResult = await apiFetch('courses/resume/', { auth: true });
          if (resumeResult.response.ok) {
            resume = resumeResult.payload?.data?.resumeLearning || null;
          }
        }

        if (!isCancelled) {
          setPaths(nextPaths);
          setResumeLearning(resume);
        }
      } catch {
        if (!isCancelled) {
          setPaths([]);
          setResumeLearning(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPaths();

    return () => {
      isCancelled = true;
    };
  }, []);

  const startPath = async (path) => {
    if (!isAuthenticated() || !path.slug) {
      return;
    }

    setStartingPathSlug(path.slug);
    try {
      const { response, payload } = await apiFetch(`courses/learning-paths/${path.slug}/start/`, {
        method: 'POST',
        auth: true,
      });
      if (response.ok) {
        const progress = payload?.data?.path?.progress;
        setPaths((current) => current.map((item) => (
          item.slug === path.slug ? { ...item, progress: { ...item.progress, ...progress } } : item
        )));
      }
    } finally {
      setStartingPathSlug('');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-28 md:pt-32">
        <section className="border-b border-white/10 px-4 pb-14 pt-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              <Route size={14} />
              Learning Paths
            </span>
            <div className="mt-7 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <h1 className="max-w-3xl text-[2.7rem] font-semibold leading-[1.02] tracking-tight md:text-[5rem]">
                Follow a path, keep your streak, level up.
              </h1>
              <div className="max-w-2xl">
                <p className="text-base leading-7 text-white/58 md:text-lg">
                  Curated tracks now read from the learning path API, track course completion, and connect into the same XP loop as lessons and quizzes.
                </p>
                {resumeLearning ? (
                  <Link
                    to={resumeLearning.href}
                    className="mt-5 inline-flex items-center gap-3 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200"
                  >
                    <PlayCircle size={17} />
                    Resume {resumeLearning.lesson?.title}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
                ))}
              </div>
            ) : paths.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-20 text-center">
                <Compass className="mx-auto h-10 w-10 text-white/35" />
                <h2 className="mt-5 text-2xl font-semibold">No published learning paths yet.</h2>
              </div>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                {paths.map((path, index) => {
                  const firstCourse = path.courses[0];
                  return (
                    <motion.article
                      key={path.id || path.slug}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.2) }}
                      className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-black">
                            <Layers3 size={22} />
                          </div>
                          <h2 className="mt-5 text-3xl font-semibold tracking-tight">{path.title}</h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-white/52">
                            {path.description || `${path.courseCount} course sequence with measurable progress.`}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/45">
                          {path.progress.progressPercent}%
                        </span>
                      </div>

                      <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-emerald-300" style={{ width: `${path.progress.progressPercent}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/42">
                        <span>{path.progress.completedCourses}/{path.progress.totalCourses || path.courseCount} courses complete</span>
                        <span className="inline-flex items-center gap-1">
                          <Flame size={13} className="text-emerald-300" />
                          XP-ready
                        </span>
                      </div>

                      <div className="mt-7 space-y-3">
                        {path.courses.slice(0, 4).map((course, courseIndex) => (
                          <Link
                            key={course.id}
                            to={`/learn/${course.identifier}`}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 transition hover:border-emerald-300/35"
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sm text-emerald-200">
                                {courseIndex + 1}
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-white">{course.title}</span>
                                <span className="block text-xs text-white/42">{course.featuredCard.durationValue} {course.featuredCard.durationLabel}</span>
                              </span>
                            </span>
                            <ArrowRight size={16} className="text-white/42" />
                          </Link>
                        ))}
                      </div>

                      {firstCourse ? (
                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            to={`/learn/${firstCourse.identifier}`}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
                          >
                            Start learning
                            <Sparkles size={16} />
                          </Link>
                          {isAuthenticated() && path.persisted && path.slug ? (
                            <button
                              type="button"
                              onClick={() => startPath(path)}
                              disabled={startingPathSlug === path.slug}
                              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-emerald-300/40 disabled:opacity-45"
                            >
                              {startingPathSlug === path.slug ? 'Starting...' : 'Track this path'}
                            </button>
                          ) : null}
                        </div>
                      ) : null}
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LearningPathsPage;
