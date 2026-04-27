import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Filter,
  Flame,
  Layers3,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { normalizeCourseCard } from '../lib/courseContent';

const fallbackCategories = [
  { id: 'all', name: 'All courses', slug: '' },
  { id: 'ui-ux-design', name: 'UI/UX Design', slug: 'ui-ux-design' },
  { id: 'product-design', name: 'Product Design', slug: 'product-design' },
  { id: 'figma', name: 'Figma', slug: 'figma' },
  { id: 'web-design', name: 'Web Design', slug: 'web-design' },
  { id: 'ux-research', name: 'UX Research', slug: 'ux-research' },
];

const difficultyFilters = [
  { value: '', label: 'All levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const normalizeCategory = (category, index) => ({
  id: category.id || category.slug || index,
  name: category.name || 'Category',
  slug: category.slug || '',
  description: category.short_description || 'Focused lessons and projects',
});

const statCards = [
  {
    label: 'Courses for any role',
    value: '50+',
    icon: BookOpen,
  },
  {
    label: 'Higher completion loops',
    value: 'XP',
    icon: CheckCircle2,
  },
  {
    label: 'Fits your schedule',
    value: 'Short',
    icon: Clock3,
  },
  {
    label: 'AI-ready learning',
    value: 'Smart',
    icon: Sparkles,
  },
];

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '');

  const activeQuery = searchParams.get('q') || '';
  const activeCategory = searchParams.get('category') || '';
  const activeLevel = searchParams.get('level') || '';

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

      const params = new URLSearchParams({ page: '1', limit: '72' });
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
    const seen = new Set();
    return [{ id: 'all', name: 'All courses', slug: '', description: 'Everything' }, ...source]
      .filter((item) => {
        const key = item.slug || 'all';
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }, [categories]);

  const filteredCourses = useMemo(() => {
    if (!activeLevel) {
      return courses;
    }
    return courses.filter((course) => course.level === activeLevel);
  }, [activeLevel, courses]);

  const activeCategoryLabel = useMemo(() => {
    return categoryTabs.find((category) => category.slug === activeCategory)?.name || 'All courses';
  }, [activeCategory, categoryTabs]);

  const activeLevelLabel = difficultyFilters.find((level) => level.value === activeLevel)?.label || 'All levels';
  const featuredCourse = filteredCourses.find((course) => course.isFeatured) || filteredCourses[0] || null;
  const totalWeeks = filteredCourses.reduce((sum, course) => sum + Number(course.featuredCard.durationValue || 0), 0);
  const hasActiveFilters = Boolean(activeQuery || activeCategory || activeLevel);

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

  const resetFilters = () => {
    setSearchDraft('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="overflow-hidden pt-24 md:pt-28">
        <section className="relative px-4 pb-10 pt-5 md:px-8 md:pb-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_54%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-300" />
                <span>Build a guided skill path from live backend courses.</span>
              </div>
              <Link to="/paths" className="inline-flex items-center gap-2 font-semibold text-emerald-200 hover:text-white">
                View paths
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid gap-10 lg:grid-cols-[minmax(0,0.98fr)_420px] lg:items-center"
            >
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Trusted by modern product learners
                </div>
                <h1 className="mt-6 max-w-3xl text-[2.75rem] font-semibold leading-[1.05] tracking-tight md:text-[4.75rem]">
                  Interactive courses for modern professionals
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 md:text-lg">
                  Learn design, product, research, and frontend skills in focused lessons with progress, quizzes, XP, and portfolio-ready outcomes.
                </p>
                <form onSubmit={submitSearch} className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
                  <label className="relative flex-1">
                    <span className="sr-only">Search courses</span>
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                    <input
                      value={searchDraft}
                      onChange={(event) => setSearchDraft(event.target.value)}
                      placeholder="Search UI, Figma, research, frontend..."
                      className="h-12 w-full rounded-full border border-white/10 bg-white/[0.055] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/34 focus:border-emerald-400/60"
                    />
                  </label>
                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-bold text-black transition hover:bg-emerald-300"
                  >
                    Search
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="relative">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur">
                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-[#06140f] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Resume learning</p>
                        <p className="mt-2 text-xl font-semibold">{featuredCourse?.title || 'Choose your path'}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-black">
                        <Award className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-7 space-y-4">
                      {[
                        ['Lesson loop', 'Read, practice, quiz, progress'],
                        ['Skill signal', `${filteredCourses.length || 0} courses available`],
                        ['Path length', `${totalWeeks || 0} weeks of learning`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-black/24 p-4">
                          <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
                          <p className="mt-1 text-sm text-white/78">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{stat.value}</p>
                        <p className="mt-0.5 text-sm text-white/48">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-4 py-10 md:px-8 md:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-300">All courses</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Explore the catalog</h2>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <BookOpen size={15} className="text-emerald-300" />
                  {filteredCourses.length} courses
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <BarChart3 size={15} className="text-emerald-300" />
                  {activeCategoryLabel}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/68">
                  <Filter size={15} className="text-emerald-300" />
                  {activeLevelLabel}
                </span>
              </div>
            </div>

            <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="h-fit lg:sticky lg:top-28">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-white/38">Catalog</p>
                      <p className="mt-1 text-lg font-semibold">Filters</p>
                    </div>
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                      >
                        Reset
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Topic</p>
                    <div className="space-y-1">
                      {categoryTabs.map((category) => {
                        const active = activeCategory === category.slug || (!activeCategory && !category.slug);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => updateFilters({ category: category.slug })}
                            className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition ${
                              active
                                ? 'bg-emerald-300 text-black'
                                : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            <span>{category.name}</span>
                            {active ? <CheckCircle2 className="h-4 w-4" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-7 border-t border-white/10 pt-5">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/38">Difficulty</p>
                    <div className="space-y-1">
                      {difficultyFilters.map((level) => {
                        const active = activeLevel === level.value;
                        return (
                          <button
                            key={level.label}
                            type="button"
                            onClick={() => updateFilters({ level: level.value })}
                            className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition ${
                              active
                                ? 'bg-white text-black'
                                : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
                            }`}
                          >
                            <span>{level.label}</span>
                            {active ? <CheckCircle2 className="h-4 w-4" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="min-w-0">
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div key={index} className="h-[300px] animate-pulse rounded-[1.35rem] border border-white/10 bg-white/[0.035]" />
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-5 py-14 text-center md:px-8 md:py-20">
                    <Layers3 className="mx-auto h-10 w-10 text-white/38" />
                    <h2 className="mt-5 text-2xl font-semibold">No courses match this filter</h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/54">
                      Start from all courses or try a broader topic. Published backend courses appear here automatically.
                    </p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-emerald-300 px-5 text-sm font-bold text-black transition hover:bg-emerald-200"
                    >
                      Show all courses
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course, index) => (
                      <motion.article
                        key={course.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.18) }}
                        className="group flex min-h-[300px] flex-col rounded-[1.35rem] border border-white/10 bg-[#101010] p-4 transition hover:-translate-y-1 hover:border-emerald-300/40 hover:bg-[#121713]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} alt="" className="h-full w-full object-cover opacity-90" loading="lazy" />
                            ) : (
                              <BookOpen className="h-6 w-6 text-emerald-300" />
                            )}
                          </div>
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                            {course.isFeatured ? 'Popular' : 'New'}
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/62">
                            {course.category?.name || course.tags[0] || 'Course'}
                          </span>
                          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/62">
                            {course.levelLabel}
                          </span>
                        </div>

                        <Link to={course.href} className="mt-4 block">
                          <h3 className="text-[1.35rem] font-semibold leading-tight tracking-tight transition group-hover:text-emerald-200">
                            {course.title}
                          </h3>
                        </Link>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/52">
                          {course.description}
                        </p>

                        <div className="mt-auto pt-6">
                          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm text-white/58">
                            <span className="inline-flex items-center gap-1.5">
                              <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
                              {course.ratingAvg ? course.ratingAvg.toFixed(1) : '4.7'}
                            </span>
                            <span>{course.featuredCard.durationValue || course.durationWeeks || 0} w</span>
                            <span>{course.language}</span>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Link
                              to={course.href}
                              className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-black transition hover:bg-emerald-300"
                            >
                              View course
                            </Link>
                            <Link
                              to={`/learn/${course.identifier}`}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/78 transition hover:border-emerald-300/60 hover:text-emerald-200"
                              aria-label={`Open ${course.title} learning room`}
                            >
                              <ArrowRight size={17} />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
