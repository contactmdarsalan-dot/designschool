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
  Smartphone,
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
  Smartphone,
  Sparkles,
  Trophy,
  Star,
  UserRound,
  Users,
};

const navItems = [
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
  return new Intl.NumberFormat('en-US', {
    notation: number > 9999 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(number);
};

const pluralize = (count, singular, plural = `${singular}s`) => {
  const safeCount = Number(count || 0);
  return `${safeCount} ${safeCount === 1 ? singular : plural}`;
};

const SectionTitle = ({ eyebrow, title, body }) => (
  <div className="max-w-2xl">
    {eyebrow ? <p className="text-sm font-semibold text-emerald-300/90">{eyebrow}</p> : null}
    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">{title}</h2>
    {body ? <p className="mt-3 text-sm leading-6 text-white/56 sm:text-base">{body}</p> : null}
  </div>
);

const HeroVisual = ({ course, mentor }) => (
  <div className="relative mx-auto w-full max-w-[420px]">
    <div className="absolute -inset-8 rounded-[2rem] bg-emerald-400/10 blur-3xl" />
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1110] shadow-[0_28px_90px_rgba(0,0,0,0.55)]">
      {course.thumbnail ? (
        <img
          src={course.thumbnail}
          alt={course.title}
          className="aspect-[1.06] w-full object-cover"
          loading="eager"
        />
      ) : (
        <div className="aspect-[1.06] bg-[radial-gradient(circle_at_32%_20%,rgba(16,185,129,0.35),transparent_48%),#0a0d0c]" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-5 pb-5 pt-24">
        <div className="flex items-center gap-3">
          {mentor.photo ? (
            <img
              src={mentor.photo}
              alt={mentor.name || 'Course instructor'}
              className="h-12 w-12 rounded-full border border-white/20 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-emerald-400/10 text-emerald-200">
              <UserRound className="h-5 w-5" />
            </div>
          )}
          <div>
            <p className="text-xs text-white/45">By</p>
            <p className="text-sm font-semibold text-white">{mentor.name || 'Design School Mentor'}</p>
            <p className="text-xs text-emerald-200/75">{mentor.role || 'Course Mentor'}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({ iconName, value, label, description }) => {
  const Icon = getIcon(iconName, CheckCircle2);
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-base font-semibold text-white">{value}</p>
        <p className="text-sm text-white/45">{label}</p>
        {description ? <p className="mt-1 text-xs leading-5 text-white/42">{description}</p> : null}
      </div>
    </div>
  );
};

const DetailList = ({ facts }) => (
  <div className="space-y-4">
    {facts.map((fact) => {
      const Icon = getIcon(fact.iconName, CheckCircle2);
      return (
        <div key={`${fact.label}-${fact.value}`} className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-emerald-300">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-white/45">{fact.label}</p>
            <p className="text-sm font-semibold text-white">{fact.value}</p>
            {fact.description ? <p className="mt-1 text-sm leading-5 text-white/50">{fact.description}</p> : null}
          </div>
        </div>
      );
    })}
  </div>
);

const SkillCard = ({ skill }) => {
  const Icon = getIcon(skill.iconName, Sparkles);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0d0c] p-5">
      <Icon className="h-5 w-5 text-emerald-300" />
      <h3 className="mt-4 text-base font-semibold text-white">{skill.title}</h3>
      {skill.description ? <p className="mt-2 text-sm leading-6 text-white/52">{skill.description}</p> : null}
    </div>
  );
};

const AudienceCard = ({ item }) => {
  const Icon = getIcon(item.iconName, Users);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <Icon className="h-5 w-5 text-emerald-300" />
      <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
      {item.description ? <p className="mt-2 text-sm leading-6 text-white/52">{item.description}</p> : null}
    </div>
  );
};

const SyllabusLevel = ({ module, index, isOpen, onToggle }) => {
  const lessons = module.lessons || [];
  const quizCount = lessons.filter((lesson) => lesson.quiz).length;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0b0d0c]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-5 p-5 text-left sm:p-6"
      >
        <div>
          <p className="text-sm font-semibold text-emerald-300/80">Level {index + 1}.</p>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{module.title}</h3>
          {module.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">{module.description}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/52">
            <span>{pluralize(lessons.length, 'lesson')}</span>
            <span>/</span>
            <span>{pluralize(quizCount, 'test')}</span>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-5 w-5 shrink-0 text-white/45 transition ${isOpen ? 'rotate-180' : ''}`} />
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
            <div className="space-y-3 border-t border-white/8 px-5 py-5 sm:px-6">
              {lessons.length > 0 ? (
                lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id || `${lesson.title}-${lessonIndex}`} className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.055] text-xs text-emerald-200">
                        {lessonIndex + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{lesson.title}</p>
                        {lesson.summary ? <p className="mt-1 text-sm leading-6 text-white/48">{lesson.summary}</p> : null}
                      </div>
                    </div>
                    <div className="hidden shrink-0 flex-col items-end gap-1 text-xs text-white/45 sm:flex">
                      <span>{lesson.estimatedMinutes || 8} min</span>
                      <span className="text-emerald-300">+{lesson.xpReward || 10} XP</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/50">Lessons will appear here once this level is published.</p>
              )}
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4">
                <ClipboardCheck className="h-5 w-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-white">Level Test</p>
                  <p className="text-xs text-white/45">Progress through the course after completing this checkpoint.</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const CourseDetail = () => {
  const pageRef = useSectionReveal();
  const { id: requestedCourseId } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(requestedCourseId));
  const [hasError, setHasError] = useState(!requestedCourseId);
  const [expandedAll, setExpandedAll] = useState(true);
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
      setShowStickyCta(top > 520 && top < maxScroll - 240);
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
          <Link to="/courses" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-black">
            Browse courses
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const mentor = course.mentor || {};
  const facts = course.detailFacts || [];
  const reviews = course.reviewsSummary?.items || [];
  const enrollmentPath = `/dashboard/join-course?course=${encodeURIComponent(course.slug || course.id)}`;
  const enrollmentHref = isAuthenticated()
    ? enrollmentPath
    : `/login?next=${encodeURIComponent(enrollmentPath)}`;
  const certificatePoints = course.certificatePoints?.length > 0
    ? course.certificatePoints
    : [
        'Standalone certificate page',
        'Showcases studied skills',
        'Never expires',
        'Built for portfolio sharing',
      ];
  const aboutParagraphs = (course.description || course.shortDescription || '')
    .split('\n')
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-400/25 selection:text-emerald-100">
      <Navbar />

      <main ref={pageRef} className="relative overflow-hidden pb-24 pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[740px] bg-[radial-gradient(circle_at_58%_4%,rgba(16,185,129,0.18),transparent_54%)]" />

        <section className="relative z-10 px-4 sm:px-6 lg:px-8" data-gsap-section data-motion="hero">
          <div className="mx-auto max-w-6xl">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/48" data-gsap-item>
              <Link to="/courses" className="transition hover:text-white">{'<- Courses'}</Link>
              <span>/</span>
              <span className="text-white/72">{course.title}</span>
            </nav>

            <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,0.58fr)_minmax(320px,0.42fr)] lg:items-center">
              <div data-gsap-item>
                <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-[4.25rem]">
                  {course.title}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-white/62 sm:text-lg">
                  {course.shortDescription || course.description}
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href={enrollmentHref}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    Start course
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <div>
                    <p className="text-2xl font-semibold text-white">
                      {formatNumber(course.ratingCount || derived.reviewCount || course.featuredCard?.supportValue)}
                    </p>
                    <p className="text-sm text-white/45">learners enrolled</p>
                  </div>
                </div>
              </div>

              <div data-gsap-item data-gsap-media>
                <HeroVisual course={course} mentor={mentor} />
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-gsap-item>
              <StatCard
                iconName="Star"
                value={derived.reviewAverage ? derived.reviewAverage.toFixed(1) : 'New'}
                label={`${formatNumber(derived.reviewCount)} ratings`}
                description="Learner feedback"
              />
              <StatCard
                iconName="BarChart3"
                value={course.levelLabel}
                label="Skill level"
                description="Built for this stage"
              />
              <StatCard
                iconName="Sparkles"
                value={course.type === 'self-paced' ? '100% online' : 'Live + online'}
                label={course.type === 'self-paced' ? 'Learn at your own pace' : 'Guided learning'}
                description={course.schedule?.time || 'Flexible workspace'}
              />
              <StatCard
                iconName="Award"
                value={course.syllabusSummary?.certificateAvailable ? 'Course certificate' : 'Completion proof'}
                label="Shareable validation"
                description="Issued by Design School"
              />
            </div>
          </div>
        </section>

        <section className="sticky top-20 z-20 mt-10 border-y border-white/8 bg-black/82 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="shrink-0 text-sm font-semibold text-white/52 transition hover:text-white">
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section id="about" className="relative z-10 px-4 pt-16 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.64fr)_minmax(300px,0.36fr)]">
            <article data-gsap-item>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">About this course</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-white/62">
                {aboutParagraphs.length > 0 ? (
                  aboutParagraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)
                ) : (
                  <p>{course.shortDescription || 'Course overview will appear here once the mentor updates it.'}</p>
                )}
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white">Prerequisites</h3>
                <div className="mt-4 space-y-3">
                  {(course.requirements.length > 0 ? course.requirements : ['No prerequisites required']).map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-white/62">
                      <CircleCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white">Skills you&apos;ll learn:</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {derived.skillOutcomes.map((skill) => <SkillCard key={skill.title} skill={skill} />)}
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white">Topics</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {derived.topics.map((topic) => (
                    <span key={topic.slug || topic.name} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/68">
                      {topic.name}
                    </span>
                  ))}
                </div>
              </div>

              {derived.audienceCards.length > 0 ? (
                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-white">Who this course is for</h3>
                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    {derived.audienceCards.map((item) => <AudienceCard key={item.title} item={item} />)}
                  </div>
                </div>
              ) : null}
            </article>

            <aside className="h-fit rounded-3xl border border-white/10 bg-[#0b0d0c] p-6 lg:sticky lg:top-40" data-gsap-item>
              <h3 className="text-xl font-semibold text-white">Details</h3>
              <div className="mt-6">
                <DetailList facts={facts.slice(0, 8)} />
              </div>
            </aside>
          </div>
        </section>

        <section id="syllabus" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-gsap-item>
              <SectionTitle eyebrow="Syllabus" title="Course levels and tests" />
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/58">
                <span>{pluralize(derived.syllabus?.lessonCount || 0, 'lesson')}</span>
                <span>{pluralize(derived.syllabus?.quizCount || 0, 'test')}</span>
                <span>Certificate of completion</span>
                <button
                  type="button"
                  onClick={() => setExpandedAll((value) => !value)}
                  className="rounded-full border border-white/12 px-4 py-2 text-white transition hover:border-emerald-300/50"
                >
                  {expandedAll ? 'Collapse all' : 'Expand all'}
                </button>
              </div>
            </div>

            <div className="mt-8 space-y-4" data-gsap-item>
              {course.curriculum.length > 0 ? (
                course.curriculum.map((module, index) => (
                  <SyllabusLevel
                    key={`${module.title}-${index}`}
                    module={module}
                    index={index}
                    isOpen={expandedAll || openModule === index}
                    onToggle={() => {
                      setExpandedAll(false);
                      setOpenModule(openModule === index ? -1 : index);
                    }}
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
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.16),transparent_48%),#090b0a] p-6 sm:p-8 lg:grid-cols-[0.48fr_0.52fr]" data-gsap-item>
              <div>
                <p className="text-sm font-semibold text-emerald-300/85">Earn a certificate of course completion</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-[2rem]">
                  Showcase your skills with a Design School certificate
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
                  Add completion proof to your portfolio, share your studied skills, and keep a durable record of your learning progress.
                </p>
                <a
                  href={enrollmentHref}
                  className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  Start course
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
              <div className="relative min-h-[300px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_20%,rgba(16,185,129,0.24),transparent_48%)]" />
                <div className="relative flex min-h-[260px] flex-col justify-between rounded-2xl border border-white/10 bg-black/62 p-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Certificate</p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">{course.title}</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {certificatePoints.slice(0, 4).map((point) => (
                      <div key={point} className="flex gap-2 text-sm text-white/62">
                        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="instructor" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="left">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-[2rem]" data-gsap-item>
              Meet your course instructor
            </h2>
            <div className="mt-8 grid gap-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8 lg:grid-cols-[240px_1fr]" data-gsap-item>
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d0c]">
                {mentor.photo ? (
                  <img src={mentor.photo} alt={mentor.name || 'Course instructor'} className="aspect-square w-full object-cover lg:aspect-[4/5]" />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-[radial-gradient(circle_at_50%_25%,rgba(16,185,129,0.24),transparent_55%)] lg:aspect-[4/5]">
                    <UserRound className="h-16 w-16 text-emerald-300/70" />
                  </div>
                )}
              </div>
              <div className="max-w-3xl">
                <h3 className="text-xl font-semibold text-white">{mentor.name || 'Design School Mentor'}</h3>
                <p className="mt-1 text-sm text-emerald-300/80">{mentor.role || 'Course Mentor'}</p>
                <p className="mt-6 text-base leading-8 text-white/62">
                  Your instructor guides the course through structured lessons, progress checkpoints, practical tasks, quiz feedback, and certificate readiness.
                </p>
                {mentor.company ? <p className="mt-5 text-sm text-white/45">Currently at {mentor.company}</p> : null}
              </div>
            </div>
          </div>
        </section>

        <section id="reviews" className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between" data-gsap-item>
              <SectionTitle eyebrow="Reviews" title="Loved by learners from Design School" />
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
                <Star className="h-4 w-4 fill-emerald-300 text-emerald-300" />
                <span className="text-xl font-semibold text-white">{derived.reviewAverage ? derived.reviewAverage.toFixed(1) : 'New'}</span>
                <span className="text-sm text-white/42">({formatNumber(derived.reviewCount)})</span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2" data-gsap-item>
              {reviews.length > 0 ? (
                reviews.slice(0, 6).map((review) => (
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

        <section className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
          <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.16),transparent_44%),#090b0a] p-6 text-center sm:p-10" data-gsap-item>
            <h2 className="mx-auto max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Join learners and start building real skills
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/58 sm:text-base">
              Learn through lessons, tests, XP, and certificate progress in one focused workspace.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={enrollmentHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-semibold text-black transition hover:bg-emerald-300">
                Start course
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/courses" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-semibold text-white transition hover:border-emerald-300/50">
                View all courses
              </Link>
            </div>
          </div>
        </section>

        {course.relatedCourses.length > 0 ? (
          <section className="relative z-10 px-4 pt-24 sm:px-6 lg:px-8" data-gsap-section data-motion="up">
            <div className="mx-auto max-w-6xl">
              <div className="flex items-end justify-between gap-5" data-gsap-item>
                <SectionTitle eyebrow="Related courses" title="Keep building the same skill track." />
                <Link to="/courses" className="hidden text-sm font-semibold text-emerald-300 hover:text-emerald-200 sm:block">
                  View all
                </Link>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-gsap-item>
                {course.relatedCourses.map((item) => (
                  <Link key={item.id || item.slug} to={item.href} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c] transition hover:-translate-y-1 hover:border-emerald-300/35">
                    <img src={item.thumbnail} alt={item.title} className="aspect-[16/10] w-full object-cover opacity-90 transition group-hover:opacity-100" loading="lazy" />
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
              <SectionTitle eyebrow="Frequently asked questions (FAQs)" title="Still have questions?" />
              <div className="mt-8 space-y-3" data-gsap-item>
                {course.faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={`${faq.que}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c]">
                      <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
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

      <div className={`fixed inset-x-0 bottom-0 z-[90] border-t border-white/10 bg-black/85 px-4 py-3 backdrop-blur-xl transition duration-300 md:hidden ${showStickyCta ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <a href={enrollmentHref} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-black">
          Start course
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
};

export default CourseDetail;
