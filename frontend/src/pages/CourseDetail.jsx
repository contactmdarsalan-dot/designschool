import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  Languages,
  ListChecks,
  Loader2,
  MessagesSquare,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { formatCurrency, normalizeCourseDetail } from '../lib/courseContent';
import useSectionReveal from '../hooks/useSectionReveal';

const iconMap = {
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  Languages,
  ListChecks,
  MessagesSquare,
  RefreshCw,
  Sparkles,
  Trophy,
  UserRound,
  Users,
};

const anchors = [
  { href: '#about', label: 'About' },
  { href: '#syllabus', label: 'Syllabus' },
  { href: '#certificate', label: 'Certificate' },
  { href: '#instructor', label: 'Instructor' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#faqs', label: 'FAQs' },
];

const getIcon = (name, fallback = Sparkles) => iconMap[name] || fallback;

const formatNumber = (value) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', { notation: number > 9999 ? 'compact' : 'standard' }).format(number);
};

const pluralize = (count, singular, plural = `${singular}s`) => {
  const safeCount = Number(count || 0);
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
};

const SectionHeading = ({ eyebrow, title, body }) => (
  <div className="max-w-2xl">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300/80">{eyebrow}</p>
    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
    {body ? <p className="mt-3 text-sm leading-6 text-white/58 sm:text-base">{body}</p> : null}
  </div>
);

const DetailFact = ({ fact }) => {
  const Icon = getIcon(fact.iconName, CheckCircle2);
  return (
    <div className="flex gap-3 border-b border-white/8 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{fact.value}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">{fact.label}</p>
        {fact.description ? <p className="mt-2 text-sm leading-5 text-white/52">{fact.description}</p> : null}
      </div>
    </div>
  );
};

const MetricCard = ({ item }) => {
  const Icon = getIcon(item.iconName, BookOpen);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <Icon className="h-5 w-5 text-emerald-300" />
      <p className="mt-4 text-2xl font-semibold text-white">{formatNumber(item.value)}</p>
      <p className="mt-1 text-sm font-medium text-white/78">{item.label}</p>
      {item.description ? <p className="mt-1 text-xs leading-5 text-white/45">{item.description}</p> : null}
    </div>
  );
};

const SyllabusLevel = ({ module, index, isOpen, onToggle }) => {
  const lessons = module.lessons || [];
  const quizCount = lessons.filter((lesson) => lesson.quiz).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-5 p-5 text-left transition hover:bg-white/[0.025] sm:p-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/70">
            Level {index + 1}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{module.title}</h3>
          {module.description ? <p className="mt-2 text-sm leading-6 text-white/55">{module.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/55">
            <span className="rounded-full border border-white/10 px-3 py-1">{pluralize(lessons.length, 'lesson')}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{pluralize(quizCount, 'test')}</span>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-white/55 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 p-5 pt-3 sm:p-6 sm:pt-4">
              {lessons.length > 0 ? (
                <div className="space-y-2">
                  {lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id || `${lesson.title}-${lessonIndex}`}
                      className="grid gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300/70">
                          <span>Lesson {lessonIndex + 1}</span>
                          <span>{lesson.type || 'article'}</span>
                          {lesson.isPreview ? <span>Preview</span> : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-white sm:text-base">{lesson.title}</p>
                        {lesson.summary ? <p className="mt-1 text-sm leading-6 text-white/52">{lesson.summary}</p> : null}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-white/55 sm:justify-end">
                        <span className="rounded-full bg-white/[0.05] px-3 py-1">
                          {lesson.estimatedMinutes || 8} min
                        </span>
                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-emerald-200">
                          +{lesson.xpReward || 10} XP
                        </span>
                        {lesson.quiz ? (
                          <span className="rounded-full bg-white/[0.05] px-3 py-1">
                            {pluralize(lesson.quiz.questionCount || 0, 'question')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/8 bg-white/[0.025] p-4 text-sm text-white/55">
                  Lessons will appear here once this level is published.
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const EnrollmentCard = ({ course, enrollmentHref }) => {
  const includes = course.courseIncludes || [];
  const price = course.pricing?.salePrice ?? course.salePrice;
  const originalPrice = course.pricing?.price ?? course.price;

  return (
    <aside className="rounded-3xl border border-white/10 bg-[#0c0f0e]/90 p-4 shadow-[0_26px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="aspect-[16/10] w-full object-cover" />
        ) : (
          <div className="aspect-[16/10] bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.35),transparent_55%),#090b0a]" />
        )}
      </div>

      <div className="px-1 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
          Start learning
        </p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <span className="text-3xl font-semibold text-white">{formatCurrency(price)}</span>
          {Number(originalPrice) > Number(price) ? (
            <span className="pb-1 text-sm text-white/45 line-through">{formatCurrency(originalPrice)}</span>
          ) : null}
        </div>

        <a
          href={enrollmentHref}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
        >
          Start course
          <ArrowRight className="h-4 w-4" />
        </a>
        <Link
          to={`/learn/${course.identifier}`}
          className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.035] px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-300/50"
        >
          Open lesson workspace
        </Link>

        {includes.length > 0 ? (
          <div className="mt-6 space-y-3">
            {includes.slice(0, 4).map((item) => {
              const Icon = getIcon(item.iconName, CircleCheck);
              return (
                <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-white/68">
                    <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="font-semibold text-white">{formatNumber(item.value)}</span>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </aside>
  );
};

const CourseDetail = () => {
  const pageRef = useSectionReveal();
  const params = useParams();
  const requestedCourseId = params.id;
  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(requestedCourseId));
  const [hasError, setHasError] = useState(!requestedCourseId);
  const [openModule, setOpenModule] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const getCourseById = async () => {
      setIsLoadingCourse(true);
      setHasError(false);

      try {
        const { response, payload } = await apiFetch(`public/courses/${requestedCourseId}/`);
        const fetchedCourse = payload?.data?.course;

        if (!response.ok || !fetchedCourse) {
          throw new Error(payload?.message || 'Failed to fetch course');
        }

        if (!isCancelled) {
          const normalizedCourse = normalizeCourseDetail(fetchedCourse);
          setCourse(normalizedCourse);
          setOpenModule(normalizedCourse.curriculum.length > 0 ? 0 : -1);
          setOpenFaq(normalizedCourse.faqs.length > 0 ? 0 : -1);
        }
      } catch {
        if (!isCancelled) {
          setCourse(null);
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCourse(false);
        }
      }
    };

    if (!requestedCourseId) {
      return undefined;
    }

    getCourseById();

    return () => {
      isCancelled = true;
    };
  }, [requestedCourseId]);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY || 0;
      const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setShowStickyCta(top > 460 && top < maxScroll - 240);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const derived = useMemo(() => {
    if (!course) {
      return {};
    }

    const syllabus = course.syllabusSummary || {};
    const skillOutcomes =
      course.skillOutcomes?.length > 0
        ? course.skillOutcomes
        : (course.heroBullets || []).slice(0, 4).map((point) => ({
            title: point.split(':', 1)[0] || point,
            description: point,
            iconName: 'Sparkles',
          }));
    const topics =
      course.topics?.length > 0
        ? course.topics
        : (course.tags || []).map((name) => ({ name, slug: String(name).toLowerCase().replace(/\s+/g, '-') }));
    const audienceCards =
      course.audienceCards?.length > 0
        ? course.audienceCards
        : (course.targetAudience || []).map((title) => ({
            title,
            description: 'Build practical confidence with guided lessons, projects, and progress tracking.',
            iconName: 'Users',
          }));

    return {
      syllabus,
      skillOutcomes,
      topics,
      audienceCards,
      reviewAverage: Number(course.reviewsSummary?.average || course.ratingAvg || 0),
      reviewCount: Number(course.reviewsSummary?.count || course.ratingCount || 0),
    };
  }, [course]);

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-6 pt-24">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm text-white/70">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-300" />
            Loading course detail
          </div>
        </main>
      </div>
    );
  }

  if (!course || hasError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-24 pt-40 text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-300/75">Course not found</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">This course is not available.</h1>
          <Link
            to="/courses"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black"
          >
            Browse courses
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const enrollmentPath = `/dashboard/join-course?course=${encodeURIComponent(course.slug || course.id)}`;
  const enrollmentHref = isAuthenticated()
    ? enrollmentPath
    : `/login?next=${encodeURIComponent(enrollmentPath)}`;
  const facts = course.detailFacts || [];
  const mentor = course.mentor || {};
  const reviews = course.reviewsSummary?.items || [];
  const certificatePoints = course.certificatePoints?.length > 0
    ? course.certificatePoints
    : [
        'Complete the course lessons, quizzes, and required practice work.',
        'Show your studied skills on a shareable certificate page.',
        'Use the certificate in your portfolio, resume, or LinkedIn profile.',
      ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-400/25 selection:text-emerald-100">
      <Navbar />

      <main ref={pageRef} className="relative overflow-hidden pb-24 pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.18),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:96px_96px] opacity-35" />

        <section className="relative z-10 px-4 sm:px-6 lg:px-8" data-gsap-section data-motion="hero">
          <div className="mx-auto max-w-7xl">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/45" data-gsap-item>
              <Link to="/courses" className="transition hover:text-white">Courses</Link>
              <span>/</span>
              {course.category?.name ? (
                <Link to={`/courses?category=${course.category.slug}`} className="transition hover:text-white">
                  {course.category.name}
                </Link>
              ) : (
                <span>Catalog</span>
              )}
              <span>/</span>
              <span className="text-white/70">{course.title}</span>
            </nav>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="min-w-0"
                data-gsap-item
              >
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    {course.badgeText || 'Course'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/60">
                    {course.levelLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/60">
                    {course.type === 'self-paced' ? 'Self-paced' : 'Live cohort'}
                  </span>
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {course.title}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-7 text-white/62 sm:text-lg">
                  {course.description}
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={enrollmentHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Start course
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href="#syllabus"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/12 bg-white/[0.035] px-5 text-sm font-semibold text-white transition hover:border-emerald-300/40"
                  >
                    View syllabus
                  </a>
                </div>

                <div className="mt-9 grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-2xl font-semibold text-white">{formatNumber(course.ratingCount || derived.reviewCount)}</p>
                    <p className="mt-1 text-sm text-white/50">learners enrolled</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
                      <p className="text-2xl font-semibold text-white">{derived.reviewAverage ? derived.reviewAverage.toFixed(1) : 'New'}</p>
                    </div>
                    <p className="mt-1 text-sm text-white/50">{formatNumber(derived.reviewCount)} ratings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">
                      {pluralize(derived.syllabus?.lessonCount || 0, 'lesson')}
                    </p>
                    <p className="mt-1 text-sm text-white/50">with quizzes and XP</p>
                  </div>
                </div>
              </motion.div>

              <div data-gsap-item>
                <EnrollmentCard course={course} enrollmentHref={enrollmentHref} />
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-20 z-20 mt-12 border-y border-white/8 bg-black/72 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
            {anchors.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full px-3 py-2 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section className="relative z-10 px-4 pt-10 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]" data-gsap-item>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4">
              {facts.slice(0, 8).map((fact) => (
                <DetailFact key={`${fact.label}-${fact.value}`} fact={fact} />
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="relative z-10 px-4 pt-20 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(280px,0.28fr)]">
            <div data-gsap-item>
              <SectionHeading
                eyebrow="About this course"
                title="Build useful skills through a guided learning loop."
                body="The page is powered by your course API, so every detail, lesson, quiz, topic, review, and certificate point can be managed from the backend."
              />
              <div className="mt-6 space-y-5 text-base leading-8 text-white/62">
                {(course.description || course.shortDescription || '').split('\n').filter(Boolean).slice(0, 3).map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{paragraph}</p>
                ))}
              </div>

              {derived.skillOutcomes.length > 0 ? (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {derived.skillOutcomes.map((skill) => {
                    const Icon = getIcon(skill.iconName, Sparkles);
                    return (
                      <div key={skill.title} className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-5">
                        <Icon className="h-5 w-5 text-emerald-300" />
                        <h3 className="mt-4 text-base font-semibold text-white">{skill.title}</h3>
                        {skill.description ? <p className="mt-2 text-sm leading-6 text-white/52">{skill.description}</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <aside className="h-fit rounded-3xl border border-white/10 bg-[#0b0d0c] p-5 lg:sticky lg:top-40" data-gsap-item>
              <p className="text-sm font-semibold text-white">Course details</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {(course.courseIncludes || []).slice(0, 4).map((item) => (
                  <MetricCard key={item.label} item={item} />
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section className="relative z-10 px-4 pt-20 sm:px-6 lg:px-8" data-gsap-section data-motion="left">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.36fr_0.64fr]">
            <div data-gsap-item>
              <SectionHeading
                eyebrow="Topics"
                title="A clear map of what this course covers."
                body="Use topics to help learners understand the exact domain, tools, and concepts before they enroll."
              />
            </div>
            <div data-gsap-item>
              <div className="flex flex-wrap gap-2">
                {derived.topics.map((topic) => (
                  <span
                    key={topic.slug || topic.name}
                    className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/68"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>
              {derived.audienceCards.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {derived.audienceCards.map((item) => {
                    const Icon = getIcon(item.iconName, Users);
                    return (
                      <div key={item.title} className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-5">
                        <Icon className="h-5 w-5 text-emerald-300" />
                        <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                        {item.description ? <p className="mt-2 text-sm leading-6 text-white/52">{item.description}</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section id="syllabus" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-gsap-item>
              <SectionHeading
                eyebrow="Syllabus"
                title="Levels, lessons, tests, and progress checkpoints."
                body={`${pluralize(derived.syllabus?.lessonCount || 0, 'lesson')} across ${pluralize(derived.syllabus?.moduleCount || 0, 'level')}, with ${pluralize(derived.syllabus?.quizCount || 0, 'test')}.`}
              />
              <div className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-100">
                <span className="font-semibold">{formatNumber(derived.syllabus?.totalXp || 0)} XP</span>
                <span className="text-emerald-100/55"> available</span>
              </div>
            </div>

            <div className="mt-8 space-y-4" data-gsap-item>
              {course.curriculum.length > 0 ? (
                course.curriculum.map((module, index) => (
                  <SyllabusLevel
                    key={`${module.title}-${index}`}
                    module={module}
                    index={index}
                    isOpen={openModule === index}
                    onToggle={() => setOpenModule(openModule === index ? -1 : index)}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-sm text-white/55">
                  Curriculum modules will appear here once the mentor publishes them.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="certificate" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="right">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_48%),#090b0a] p-6 sm:p-8 lg:grid-cols-[0.58fr_0.42fr]" data-gsap-item>
            <div>
              <SectionHeading
                eyebrow="Certificate"
                title="Showcase completion with proof of studied skills."
                body="Certificates are tied to the course completion flow, so learners have a clear reason to finish every level."
              />
              <div className="mt-7 space-y-4">
                {certificatePoints.map((point) => (
                  <div key={point} className="flex gap-3 text-sm leading-6 text-white/64">
                    <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                    <p>{point}</p>
                  </div>
                ))}
              </div>
              <a
                href={enrollmentHref}
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
              >
                Start course
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="relative min-h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(16,185,129,0.22),transparent_45%)]" />
              <div className="relative flex h-full min-h-[240px] flex-col justify-between rounded-xl border border-white/10 bg-black/60 p-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Certificate of completion</p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">{course.title}</h3>
                </div>
                <div>
                  <p className="text-sm text-white/50">Issued by Design School</p>
                  <p className="mt-2 text-sm text-white/68">{mentor.name || 'Course Mentor'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="instructor" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="left">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.32fr_0.68fr]">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d0c]" data-gsap-item>
              {mentor.photo ? (
                <img src={mentor.photo} alt={mentor.name || 'Course mentor'} className="aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(16,185,129,0.24),transparent_55%)]">
                  <UserRound className="h-16 w-16 text-emerald-300/70" />
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8" data-gsap-item>
              <SectionHeading
                eyebrow="Meet your instructor"
                title={mentor.name || 'Design School Mentor'}
                body={mentor.role || 'Course mentor'}
              />
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/62">
                Learn with a mentor-led structure that connects lessons, practical tasks, feedback, progress, and certificate readiness in one guided experience.
              </p>
              {mentor.company ? <p className="mt-5 text-sm text-white/45">Currently at {mentor.company}</p> : null}
            </div>
          </div>
        </section>

        <section id="reviews" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-gsap-item>
              <SectionHeading
                eyebrow="Reviews"
                title="Loved by learners building serious skills."
                body="Reviews come from the backend review system and update as students submit feedback."
              />
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
                  <span className="text-xl font-semibold text-white">
                    {derived.reviewAverage ? derived.reviewAverage.toFixed(1) : 'New'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/45">{formatNumber(derived.reviewCount)} ratings</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2" data-gsap-item>
              {reviews.length > 0 ? (
                reviews.slice(0, 4).map((review) => (
                  <div key={review.id || review.comment} className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-5">
                    <div className="flex items-center gap-1 text-emerald-300">
                      {Array.from({ length: review.rating || 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/62">{review.comment}</p>
                    <p className="mt-5 text-sm font-semibold text-white">{review.studentName || 'Design School learner'}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-8 text-sm text-white/55 md:col-span-2">
                  Reviews will appear here after enrolled students submit course feedback.
                </div>
              )}
            </div>
          </div>
        </section>

        {course.relatedCourses.length > 0 ? (
          <section className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-5" data-gsap-item>
                <SectionHeading eyebrow="Related courses" title="Keep building the same skill track." />
                <Link to="/courses" className="hidden text-sm font-semibold text-emerald-300 hover:text-emerald-200 sm:block">
                  View all
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-gsap-item>
                {course.relatedCourses.map((item) => (
                  <Link
                    key={item.id || item.slug}
                    to={item.href}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c] transition hover:-translate-y-1 hover:border-emerald-300/35"
                  >
                    <img src={item.thumbnail} alt={item.title} className="aspect-[16/10] w-full object-cover opacity-90 transition group-hover:opacity-100" />
                    <div className="p-4">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{item.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {course.faqs.length > 0 ? (
          <section id="faqs" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
            <div className="mx-auto max-w-4xl">
              <div data-gsap-item>
                <SectionHeading
                  eyebrow="FAQs"
                  title="Answers before learners commit."
                  body="Keep this section practical: pricing, required skill level, certificate rules, and schedule expectations."
                />
              </div>
              <div className="mt-8 space-y-3" data-gsap-item>
                {course.faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={`${faq.que}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c]">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left"
                      >
                        <span className="text-sm font-semibold text-white sm:text-base">{faq.que}</span>
                        <ChevronDown className={`h-5 w-5 shrink-0 text-white/50 transition ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <p className="border-t border-white/8 px-5 py-5 text-sm leading-7 text-white/56">{faq.ans}</p>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer />

      <div
        className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-black/85 px-4 py-3 backdrop-blur-xl transition duration-300 md:hidden ${
          showStickyCta ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <a
          href={enrollmentHref}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black"
        >
          Start course
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default CourseDetail;
