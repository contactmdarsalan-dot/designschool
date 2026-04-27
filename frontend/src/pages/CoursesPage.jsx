import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Flame,
  Layers3,
  Search,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { normalizeCourseCard } from '../lib/courseContent';

const fallbackCategories = [
  { id: 'all', name: 'All courses', slug: '' },
  { id: 'ui-ux-design', name: 'UX Design', slug: 'ui-ux-design' },
  { id: 'product-design', name: 'Product Management', slug: 'product-design' },
  { id: 'figma', name: 'Figma', slug: 'figma' },
  { id: 'web-design', name: 'Web Design', slug: 'web-design' },
  { id: 'ux-research', name: 'UX Research', slug: 'ux-research' },
];

const roleTabs = [
  { label: 'UX Design', query: 'ux' },
  { label: 'Product Management', query: 'product' },
  { label: 'AI', query: 'ai' },
];

const difficultyFilters = [
  { value: '', label: 'All' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const catalogBenefits = [
  { icon: BookOpen, title: '50+ courses for any role and level', body: 'Start from foundations or go deeper into product, research, interface, and systems topics.' },
  { icon: Trophy, title: 'Gamified, never boring', body: 'Short lessons, quizzes, XP, and progress loops keep learners moving every day.' },
  { icon: Clock3, title: 'Fits your schedule', body: 'Self-paced lessons and guided courses work around busy student and professional routines.' },
  { icon: Sparkles, title: 'AI-powered learning flow', body: 'Use recommendations, skill signals, and structured paths to know what to study next.' },
];

const expertCards = [
  { name: 'Design mentors', role: 'Product, UI, and research reviewers', course: 'Portfolio-ready projects' },
  { name: 'Industry practitioners', role: 'Working designers and builders', course: 'Real workflow lessons' },
  { name: 'Career guides', role: 'Interview and portfolio support', course: 'Career-ready presentation' },
  { name: 'Learning coaches', role: 'Progress and accountability', course: 'Completion systems' },
];

const certificateFeatures = [
  'Shareable certificates',
  'Showcase verified skills',
  'Never expire',
  'Portfolio-ready proof',
];

const courseFaqs = [
  {
    question: 'How are the courses structured?',
    answer: 'Courses are built around focused modules, lessons, quizzes, XP, and completion progress so learners can move through a practical learning loop.',
  },
  {
    question: 'Are these courses beginner friendly?',
    answer: 'Yes. The catalog supports beginner, intermediate, and advanced learning so students can start at the right level and keep progressing.',
  },
  {
    question: 'Do certificates come from the backend?',
    answer: 'Yes. Course pages can show certificate availability and certificate detail points from the backend course data.',
  },
  {
    question: 'Can I learn through paths?',
    answer: 'Yes. Learning paths connect multiple courses into one guided sequence with progress tracking and resume learning.',
  },
];

const normalizeCategory = (category, index) => ({
  id: category.id || category.slug || index,
  name: category.name || 'Category',
  slug: category.slug || '',
  description: category.short_description || 'Focused lessons and projects',
});

const formatNumber = (value) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    notation: number > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(number);
};

const CourseCard = ({ course, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.2) }}
    className="group flex min-h-[360px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#101211] transition hover:-translate-y-1 hover:border-emerald-300/45 hover:bg-[#111713]"
  >
    <Link to={course.href} className="relative block overflow-hidden">
      <img
        src={course.thumbnail}
        alt={course.title}
        className="aspect-[1.7] w-full object-cover opacity-90 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
        loading="lazy"
      />
      <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        {course.isFeatured ? 'Popular' : 'New'}
      </div>
    </Link>

    <div className="flex flex-1 flex-col p-5">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/62">
          {course.category?.name || course.tags[0] || 'Course'}
        </span>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/62">
          {course.levelLabel}
        </span>
      </div>

      <Link to={course.href} className="mt-4 block">
        <h3 className="text-xl font-semibold leading-tight tracking-tight text-white transition group-hover:text-emerald-200">
          {course.title}
        </h3>
      </Link>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/52">{course.description}</p>

      <div className="mt-auto pt-6">
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/55">
          <span className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
            {course.ratingAvg ? course.ratingAvg.toFixed(1) : '4.7'}
          </span>
          <span>{course.featuredCard.durationValue || course.durationWeeks || 0} w</span>
          <span>{course.language}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <Link to={course.href} className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-white px-4 text-sm font-bold text-black transition hover:bg-emerald-300">
            View course
          </Link>
          <Link to={`/learn/${course.identifier}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/78 transition hover:border-emerald-300/60 hover:text-emerald-200" aria-label={`Open ${course.title} learning room`}>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  </motion.article>
);

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDraft, setSearchDraft] = useState(searchParams.get('q') || '');
  const [openFaq, setOpenFaq] = useState(0);

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
        <section className="relative px-4 pb-12 pt-5 md:px-8 md:pb-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_58%_0%,rgba(16,185,129,0.17),transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-emerald-300" />
                <span>Build your learning streak with backend-powered courses.</span>
              </div>
              <Link to="/assess-skills" className="inline-flex items-center gap-2 font-semibold text-emerald-200 hover:text-white">
                Find your skill level
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid gap-10 lg:grid-cols-[minmax(0,0.94fr)_430px] lg:items-center"
            >
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72">
                  <Users className="h-3.5 w-3.5 text-emerald-300" />
                  Trusted by modern product learners
                </div>
                <h1 className="mt-6 max-w-3xl text-[2.75rem] font-semibold leading-[1.05] tracking-tight md:text-[4.7rem]">
                  Interactive courses for modern professionals
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 md:text-lg">
                  Learn design, product, research, and frontend skills in focused lessons with progress, quizzes, XP, and portfolio-ready outcomes.
                </p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {roleTabs.map((tab) => (
                    <button
                      key={tab.label}
                      type="button"
                      onClick={() => updateFilters({ q: tab.query })}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        activeQuery.toLowerCase() === tab.query
                          ? 'border-emerald-300 bg-emerald-300 text-black'
                          : 'border-white/10 bg-white/[0.035] text-white/66 hover:border-emerald-300/45 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

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
                  <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-bold text-black transition hover:bg-emerald-300">
                    Search
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="relative">
                <div className="absolute -inset-8 rounded-[2rem] bg-emerald-400/10 blur-3xl" />
                <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur">
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
              {catalogBenefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-white/45">{item.body}</p>
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
                      <button type="button" onClick={resetFilters} className="text-sm font-semibold text-emerald-300 hover:text-emerald-200">
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
                              active ? 'bg-emerald-300 text-black' : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
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
                              active ? 'bg-white text-black' : 'text-white/68 hover:bg-white/[0.06] hover:text-white'
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
                      <div key={index} className="h-[360px] animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.035]" />
                    ))}
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] px-5 py-14 text-center md:px-8 md:py-20">
                    <Layers3 className="mx-auto h-10 w-10 text-white/38" />
                    <h2 className="mt-5 text-2xl font-semibold">No courses match this filter</h2>
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/54">
                      Start from all courses or try a broader topic. Published backend courses appear here automatically.
                    </p>
                    <button type="button" onClick={resetFilters} className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-emerald-300 px-5 text-sm font-bold text-black transition hover:bg-emerald-200">
                      Show all courses
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCourses.map((course, index) => (
                      <CourseCard key={course.id} course={course} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold text-emerald-300">Learn from practitioners</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                  Learn from experts building real digital products
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                  Courses are structured for real project workflows, portfolio outcomes, and practical review.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {expertCards.map((expert) => (
                  <div key={expert.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                      <Users size={22} />
                    </div>
                    <p className="mt-5 text-lg font-semibold text-white">{expert.name}</p>
                    <p className="mt-1 text-sm text-white/48">{expert.role}</p>
                    <p className="mt-4 text-sm text-emerald-200/85">Courses by Design School: {expert.course}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_12%_12%,rgba(16,185,129,0.18),transparent_45%),#090b0a] p-6 md:p-10 lg:grid-cols-[0.48fr_0.52fr]">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Show your skills with certificates</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Earn credentials you can share with confidence
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                Complete lessons, quizzes, and required work to earn proof of completion for your portfolio and profile.
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {certificateFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/72">
                    <Award className="h-4 w-4 text-emerald-300" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative min-h-[320px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(16,185,129,0.24),transparent_48%)]" />
              <div className="relative flex min-h-[280px] flex-col justify-between rounded-2xl border border-white/10 bg-black/62 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Certificate</p>
                  <h3 className="mt-5 max-w-sm text-3xl font-semibold text-white">Design School Learning Certificate</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {certificateFeatures.map((feature) => (
                    <div key={feature} className="flex gap-2 text-sm text-white/62">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
            {catalogBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-[#0d0f0e] p-6">
                  <Icon className="h-6 w-6 text-emerald-300" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/52">{item.body}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-center md:p-12">
            <div className="mx-auto flex max-w-xl justify-center -space-x-3">
              {['DS', 'UX', 'PM', 'AI', 'FE'].map((label) => (
                <span key={label} className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-emerald-300 text-sm font-bold text-black">
                  {label}
                </span>
              ))}
            </div>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Join learners leveling up with Design School
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/58">
              Move from course browsing to a measurable learning experience with lessons, paths, progress, quizzes, XP, and certificates.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/courses" className="inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-bold text-black transition hover:bg-emerald-300">
                Explore courses
              </Link>
              <Link to="/assess-skills" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-semibold text-white transition hover:border-emerald-300/50">
                Assess your skills
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-300">Frequently asked questions (FAQs)</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Still have questions?</h2>
            </div>
            <div className="mt-8 space-y-3">
              {courseFaqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c]">
                    <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                      <span className="text-sm font-semibold text-white sm:text-base">{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-white/50 transition ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen ? <p className="border-t border-white/8 px-5 py-5 text-sm leading-7 text-white/56">{faq.answer}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
