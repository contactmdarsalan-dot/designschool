import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Compass, Layers3, Route, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { normalizeCourseCard } from '../lib/courseContent';

const LearningPathsPage = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const { response, payload } = await apiFetch('public/courses/?page=1&limit=60');
        if (!response.ok) {
          throw new Error(payload?.message || 'Could not load learning paths');
        }
        if (!isCancelled) {
          setCourses((payload?.data?.courses || []).map(normalizeCourseCard));
        }
      } catch {
        if (!isCancelled) {
          setCourses([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isCancelled = true;
    };
  }, []);

  const paths = useMemo(() => {
    const grouped = new Map();
    courses.forEach((course) => {
      const key = course.category?.slug || course.tags[0] || 'all';
      const name = course.category?.name || course.tags[0] || 'Core Skills';
      const row = grouped.get(key) || { key, name, courses: [] };
      row.courses.push(course);
      grouped.set(key, row);
    });
    return Array.from(grouped.values());
  }, [courses]);

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
            <div className="mt-7 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <h1 className="max-w-3xl text-[2.7rem] font-semibold leading-[1.02] tracking-tight md:text-[5rem]">
                Guided tracks for measurable skill growth.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/58 md:text-lg">
                Each path is assembled from live backend courses and can open directly into the learning room.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-8">
          <div className="mx-auto max-w-7xl">
            {isLoading ? (
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]" />
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
                      key={path.key}
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
                          <h2 className="mt-5 text-3xl font-semibold tracking-tight">{path.name}</h2>
                          <p className="mt-2 text-sm leading-6 text-white/52">
                            {path.courses.length} course{path.courses.length === 1 ? '' : 's'} arranged as a practical skill path.
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/45">
                          {index + 1}
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
                        <Link
                          to={`/learn/${firstCourse.identifier}`}
                          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
                        >
                          Start path
                          <Sparkles size={16} />
                        </Link>
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
