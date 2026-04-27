import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Layers3,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { formatCurrency, normalizeCourseCard } from '../lib/courseContent';

const fallbackCategories = [
  { id: 'all', name: 'All', slug: '' },
  { id: 'ui-ux', name: 'UI/UX', slug: 'ui-ux' },
  { id: 'product', name: 'Product', slug: 'product' },
  { id: 'web', name: 'Web Design', slug: 'web-design' },
];

const normalizeCategory = (category, index) => ({
  id: category.id || category.slug || index,
  name: category.name || 'Category',
  slug: category.slug || '',
  description: category.short_description || 'Focused lessons and projects',
});

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '');

  const activeQuery = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    setSearchDraft(activeQuery);
  }, [activeQuery]);

  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      try {
        const { response, payload } = await apiFetch('courses/categories/');
        const rows = Array.isArray(payload) ? payload : payload?.data?.categories || payload?.data || [];

        if (!response.ok) {
          throw new Error(payload?.message || 'Could not load categories');
        }

        if (!isCancelled) {
          setCategories(rows.map(normalizeCategory));
        }
      } catch {
        if (!isCancelled) {
          setCategories(fallbackCategories);
        }
      }
    };

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadCourses = async () => {
      setIsLoading(true);

      const params = new URLSearchParams({ page: '1', limit: '48' });
      if (activeQuery) {
        params.set('q', activeQuery);
      }
      if (activeCategory) {
        params.set('category', activeCategory);
      }

      try {
        const { response, payload } = await apiFetch(`public/courses/?${params.toString()}`);
        const fetchedCourses = (payload?.data?.courses || []).map(normalizeCourseCard);

        if (!response.ok) {
          throw new Error(payload?.message || 'Could not load courses');
        }

        if (!isCancelled) {
          setCourses(fetchedCourses);
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
  }, [activeQuery, activeCategory]);

  const categoryTabs = useMemo(() => {
    const source = categories.length > 0 ? categories : fallbackCategories;
    return [{ id: 'all', name: 'All', slug: '', description: 'Everything' }, ...source.filter((item) => item.slug)];
  }, [categories]);

  const featuredCourse = courses.find((course) => course.isFeatured) || courses[0] || null;
  const totalLessons = courses.reduce((sum, course) => sum + Number(course.featuredCard.durationValue || 0), 0);

  const updateFilters = (next = {}) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    setSearchParams(params);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    updateFilters({ q: searchDraft.trim() });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="overflow-hidden pt-28 md:pt-32">
        <section className="relative border-b border-white/10 px-4 pb-12 pt-6 md:px-8 md:pb-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.18),transparent_42%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                <Sparkles size={14} />
                Course Discovery
              </span>
              <h1 className="mt-7 max-w-3xl text-[2.7rem] font-semibold leading-[1.02] tracking-tight md:text-[5.2rem]">
                Skill paths built from real courses.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 md:text-lg">
                Browse backend-powered programs, filter by category, and jump into an interactive lesson workspace.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur"
            >
              <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/38" />
                  <input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search UI, Figma, research, frontend..."
                    className="h-13 w-full rounded-2xl border border-white/10 bg-black/55 pl-12 pr-4 text-sm text-white outline-none transition focus:border-emerald-400/60"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:bg-emerald-300"
                >
                  <SlidersHorizontal size={17} />
                  Search
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                {categoryTabs.map((category) => {
                  const active = activeCategory === category.slug || (!activeCategory && !category.slug);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => updateFilters({ category: category.slug })}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? 'border-emerald-300 bg-emerald-300 text-black'
                          : 'border-white/10 bg-white/[0.03] text-white/72 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.025] p-5 lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">Learning Signal</p>
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-2xl font-semibold">{courses.length}</p>
                    <p className="text-sm text-white/48">courses loaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-2xl font-semibold">{totalLessons || 0}</p>
                    <p className="text-sm text-white/48">weeks of pathways</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-emerald-300" />
                  <div>
                    <p className="text-2xl font-semibold">XP</p>
                    <p className="text-sm text-white/48">ready lesson engine</p>
                  </div>
                </div>
              </div>

              {featuredCourse ? (
                <Link
                  to={`/learn/${featuredCourse.identifier}`}
                  className="mt-7 block rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 transition hover:border-emerald-300/70"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Continue As Experience</p>
                  <p className="mt-3 text-lg font-semibold leading-tight">{featuredCourse.title}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
                    Open learning room
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ) : null}
            </aside>

            <div>
              {activeQuery || activeCategory ? (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
                  <p className="text-sm text-white/62">
                    Showing {activeQuery ? `search "${activeQuery}"` : 'all courses'}
                    {activeCategory ? ` in ${activeCategory}` : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}

              {isLoading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-[430px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.035]" />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-20 text-center">
                  <Layers3 className="mx-auto h-10 w-10 text-white/38" />
                  <h2 className="mt-5 text-2xl font-semibold">No courses match this filter.</h2>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/52">
                    Try a broader search or clear the category filter. If the backend has no published courses, they will appear here once published.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course, index) => (
                    <motion.article
                      key={course.id}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.2) }}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d0d] transition hover:-translate-y-1 hover:border-emerald-300/35"
                    >
                      <Link to={course.href} className="block">
                        <div className="relative aspect-[1.2] overflow-hidden bg-white/[0.03]">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-full w-full object-cover opacity-88 transition duration-500 group-hover:scale-[1.04]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                            {course.category?.name || course.tags[0] || course.levelLabel || 'Course'}
                          </div>
                        </div>
                      </Link>

                      <div className="p-5">
                        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-white/42">
                          <span>{course.type}</span>
                          <span>{course.language}</span>
                        </div>
                        <Link to={course.href}>
                          <h2 className="mt-3 min-h-[64px] text-2xl font-semibold leading-tight tracking-tight transition group-hover:text-emerald-200">
                            {course.title}
                          </h2>
                        </Link>
                        <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-white/52">
                          {course.description}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {course.tags.slice(0, 3).map((tag) => (
                            <span key={`${course.id}-${tag}`} className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/62">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-6 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs text-white/38">Starts at</p>
                            <p className="text-xl font-semibold text-white">{formatCurrency(course.salePrice)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/learn/${course.identifier}`}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/78 transition hover:border-emerald-300/60 hover:text-emerald-200"
                              aria-label={`Open ${course.title} learning room`}
                            >
                              <CheckCircle2 size={18} />
                            </Link>
                            <Link
                              to={course.href}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black transition hover:bg-emerald-300"
                            >
                              Details
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
