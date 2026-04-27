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

  const activeCategoryLabel = useMemo(() => {
    return categoryTabs.find((category) => category.slug === activeCategory)?.name || activeCategory;
  }, [activeCategory, categoryTabs]);

  const featuredCourse = courses.find((course) => course.isFeatured) || courses[0] || null;
  const totalLessons = courses.reduce((sum, course) => sum + Number(course.featuredCard.durationValue || 0), 0);
  const hasActiveFilters = Boolean(activeQuery || activeCategory);

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

      <main className="overflow-hidden pt-24 md:pt-28">
        <section className="relative px-4 pb-8 pt-5 md:px-8 md:pb-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_48%_0%,rgba(16,185,129,0.16),transparent_48%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(360px,0.52fr)] lg:items-end"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <Sparkles size={13} />
                  Course Discovery
                </span>
                <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl">
                  Find the right course for your next skill.
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 md:text-base">
                  Search programs, filter by category, then open details or continue into the learning room.
                </p>
              </div>

              <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/66 backdrop-blur">
                {[
                  ['01', 'Choose a category'],
                  ['02', 'Compare the course cards'],
                  ['03', 'Start the lesson workspace'],
                ].map(([step, label]) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/10 text-xs font-bold text-emerald-200">
                      {step}
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="sticky top-0 z-20 border-y border-white/10 bg-[#050505]/88 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
                <label className="relative flex-1">
                  <span className="sr-only">Search courses</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                  <input
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                    placeholder="Search UI, Figma, research, frontend..."
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-400/60"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-bold text-black transition hover:bg-emerald-300"
                >
                  <SlidersHorizontal size={17} />
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {categoryTabs.map((category) => {
                  const active = activeCategory === category.slug || (!activeCategory && !category.slug);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => updateFilters({ category: category.slug })}
                      className={`min-h-10 rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? 'border-emerald-300 bg-emerald-300 text-black'
                          : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 md:px-8 md:py-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">Catalog</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Available courses</h2>
                <p className="mt-2 text-sm text-white/54">
                  {hasActiveFilters
                    ? `Showing ${activeQuery ? `"${activeQuery}"` : 'all courses'}${activeCategory ? ` in ${activeCategoryLabel}` : ''}.`
                    : 'Browse all published courses from the backend.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <BookOpen size={15} className="text-emerald-300" />
                  {courses.length} courses
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <Clock3 size={15} className="text-emerald-300" />
                  {totalLessons || 0} weeks
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <Trophy size={15} className="text-emerald-300" />
                  XP ready
                </span>
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="inline-flex min-h-10 items-center rounded-full border border-emerald-300/30 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-200/70"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>

            {featuredCourse ? (
              <div className="mb-6 flex flex-col gap-4 border-y border-white/10 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Recommended next</p>
                  <p className="mt-1 text-base font-semibold text-white">{featuredCourse.title}</p>
                </div>
                <Link
                  to={`/learn/${featuredCourse.identifier}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-black transition hover:bg-emerald-300"
                >
                  Open learning room
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : null}

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[360px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-12 text-center md:px-8 md:py-16">
                <Layers3 className="mx-auto h-9 w-9 text-white/38" />
                <h2 className="mt-5 text-xl font-semibold md:text-2xl">No courses match this filter</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/54">
                  Start from all courses or try a shorter search term. Published backend courses will appear here automatically.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSearchParams({})}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-300 px-5 text-sm font-bold text-black transition hover:bg-emerald-200"
                  >
                    Show all courses
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchDraft('');
                      updateFilters({ q: '', category: '' });
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-white/72 transition hover:border-white/25 hover:text-white"
                  >
                    Reset search
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {courses.map((course, index) => (
                  <motion.article
                    key={course.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.2) }}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] transition hover:-translate-y-1 hover:border-emerald-300/35"
                  >
                    <Link to={course.href} className="block">
                      <div className="relative aspect-[1.35] overflow-hidden bg-white/[0.03]">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.035]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/18 to-transparent" />
                        <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                          {course.category?.name || course.tags[0] || course.levelLabel || 'Course'}
                        </div>
                      </div>
                    </Link>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.12em] text-white/42">
                        <span>{course.type}</span>
                        <span>{course.language}</span>
                      </div>
                      <Link to={course.href}>
                        <h2 className="mt-3 min-h-[52px] text-xl font-semibold leading-tight tracking-tight transition group-hover:text-emerald-200">
                          {course.title}
                        </h2>
                      </Link>
                      <p className="mt-3 line-clamp-2 min-h-[44px] text-sm leading-6 text-white/52">
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
                          <p className="text-lg font-semibold text-white">{formatCurrency(course.salePrice)}</p>
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
