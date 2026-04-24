import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  ChevronDown,
  CircleCheck,
  CircleX,
  Cpu,
  Handshake,
  Lightbulb,
  Phone,
  Rocket,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiFetch } from '../lib/api';
import { formatCurrency, normalizeCourseDetail } from '../lib/courseContent';

const CLOUD_BASE = 'https://dfdx9u0psdezh.cloudfront.net';
const COURSE_BG =
  'https://sheryians-pre-purchase-frontend.s3.ap-south-1.amazonaws.com/tools_icon/cohort3/homeBgCohort3.webp';
const TOOLS_BG =
  'https://sheryians-pre-purchase-frontend.s3.ap-south-1.amazonaws.com/tools_icon/cohort3/projectSectionCohort3bg.webp';
const BUILD_PRODUCTS_IMAGE = `${CLOUD_BASE}/Visual-Icons/cohort3graphic.webp`;
const BUILD_PRODUCTS_GLOW = `${CLOUD_BASE}/Visual-Icons/bgofheadingjobready3.webp`;

const builderIconMap = {
  Rocket,
  Lightbulb,
  Cpu,
  Handshake,
  Award,
  Phone,
};

const certificateFallback = [
  'Build and showcase real products with practical workflows',
  'Receive expert mentorship and structured evaluation',
  'Earn a recognized certificate after completion',
];

const toYoutubeEmbedUrl = (videoUrl) => {
  const fallback = 'https://www.youtube.com/embed/k2PLDtpRkwQ';
  if (!videoUrl) {
    return fallback;
  }

  try {
    const parsed = new URL(videoUrl);
    const host = parsed.hostname.replace('www.', '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1);
    } else if (host.includes('youtube.com')) {
      videoId =
        parsed.searchParams.get('v') ||
        parsed.pathname.split('/shorts/')[1] ||
        parsed.pathname.split('/embed/')[1] ||
        '';
    }

    if (!videoId) {
      return fallback;
    }

    return `https://www.youtube.com/embed/${videoId.replace('/', '')}?rel=0&modestbranding=1`;
  } catch {
    return fallback;
  }
};

const CourseModuleItem = ({ module, index, isOpen, onToggle }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700/85">
            Module {index + 1}
          </p>
          <h3 className="mt-1 text-xl font-semibold leading-tight text-[#111827] md:text-2xl">
            {module.title}
          </h3>
          {module.description ? (
            <p className="mt-2 text-sm text-[#4A5565] md:text-base">{module.description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={`mt-1 h-7 w-7 shrink-0 text-emerald-700 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-5 pb-6 text-sm text-[#1f2937] md:px-6 md:text-base">
              {(module.content || []).map((item) => (
                <div key={`${module.title}-${item}`} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const MentorCarousel = ({ mentors }) => {
  const [active, setActive] = useState(0);
  const total = mentors.length;

  if (total === 0) {
    return null;
  }

  const activeIndex = ((active % total) + total) % total;

  const diffFromActive = (index) => {
    let diff = index - activeIndex;
    if (diff > total / 2) {
      diff -= total;
    }
    if (diff < -total / 2) {
      diff += total;
    }
    return diff;
  };

  const visibleCards = mentors
    .map((mentor, index) => {
      const diff = diffFromActive(index);
      const absDiff = Math.abs(diff);

      if (absDiff > 2) {
        return null;
      }

      const translateX = diff === 0 ? 0 : diff * 200;
      const translateZ = diff === 0 ? 280 : absDiff === 1 ? 120 : -80;
      const rotateY = diff * -18;
      const scale = diff === 0 ? 1.04 : absDiff === 1 ? 0.9 : 0.78;
      const opacity = diff === 0 ? 1 : absDiff === 1 ? 0.88 : 0.72;
      const zIndex = diff === 0 ? 300 : absDiff === 1 ? 200 : 100;

      return {
        mentor,
        index,
        style: {
          transform: `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
          opacity,
          zIndex,
        },
      };
    })
    .filter(Boolean);

  const move = (step) => {
    setActive((prev) => (prev + step + total) % total);
  };

  return (
    <div className="relative mt-8 w-full overflow-hidden px-2 [perspective:1400px] md:px-4">
      <div className="relative h-[46vh] min-h-[320px] w-full [transform-style:preserve-3d] md:h-[70vh] lg:h-[76vh]">
        {visibleCards.map((card) => (
          <button
            key={`${card.mentor.name}-${card.index}`}
            type="button"
            onClick={() => setActive(card.index)}
            className="absolute left-1/2 top-1/2 h-[84%] w-[62vw] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_16px_48px_rgba(0,0,0,0.48)] transition-[transform,opacity] duration-700 md:w-[30vw] md:min-w-[220px] lg:w-[20vw]"
            style={card.style}
          >
            {card.mentor.photoUrl ? (
              <img
                src={card.mentor.photoUrl}
                alt={card.mentor.name || 'Mentor'}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.25),transparent_58%)] px-6 text-center">
                <p className="text-2xl font-semibold text-white">{card.mentor.name || 'Course Mentor'}</p>
                <p className="mt-2 text-sm uppercase tracking-[0.24em] text-emerald-300">
                  {card.mentor.role || 'Instructor'}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-5">
        <button
          type="button"
          aria-label="Previous mentor"
          onClick={() => move(-1)}
          className="h-12 w-12 rounded-full border-2 border-white/55 bg-black/40 text-2xl text-white transition hover:bg-black/70"
        >
          {'<'}
        </button>
        <button
          type="button"
          aria-label="Next mentor"
          onClick={() => move(1)}
          className="h-12 w-12 rounded-full border-2 border-white/55 bg-black/40 text-2xl text-white transition hover:bg-black/70"
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};

const CourseDetail = () => {
  const params = useParams();
  const requestedCourseId = params.id;
  const [course, setCourse] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(requestedCourseId));
  const [hasError, setHasError] = useState(!requestedCourseId);
  const [openModule, setOpenModule] = useState(-1);
  const [openFaq, setOpenFaq] = useState(-1);
  const [activeTech, setActiveTech] = useState('');
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
          setActiveTech(normalizedCourse.technologySections[0]?.name || '');
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
      const maxScroll =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setShowStickyCta(top > 420 && top < maxScroll - 200);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const currentTechnologySection = useMemo(() => {
    return (
      course?.technologySections.find((section) => section.name === activeTech) ||
      course?.technologySections[0] ||
      null
    );
  }, [activeTech, course]);

  if (isLoadingCourse) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 pb-24 pt-36 text-center">
          <p className="text-3xl font-semibold">Loading course...</p>
        </main>
      </div>
    );
  }

  if (!course || hasError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 pb-24 pt-36 text-center">
          <p className="text-3xl font-semibold">Course not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const comparison = course.comparison || { left: [], right: [] };
  const builderItems = course.builderItems || [];
  const certificatePoints =
    course.certificatePoints.length > 0 ? course.certificatePoints : certificateFallback;
  const mentorSpotlights = course.mentorSpotlights || [];
  const tags = course.tags || [];
  const checkoutHref = `/checkout?courseId=${course.id}&batchId=${course?.schedule?.batchId || course.id}`;
  const heroVideoEmbed = toYoutubeEmbedUrl(course.displayVideo);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <img
          src={COURSE_BG}
          alt="Background"
          className="pointer-events-none absolute left-0 top-0 z-0 w-full object-contain opacity-30 blur-2xl"
        />

        <section className="relative z-10 px-4 md:px-8">
          <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[1.95fr_1fr]">
            <div className="self-start overflow-hidden rounded-2xl border border-[#4E4A48]/85 bg-black">
              <div className="relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-black/80 via-black/45 to-transparent" />

                <div className="pointer-events-none absolute left-4 right-4 top-4 z-30 flex items-start gap-3 md:left-6 md:right-6 md:top-5">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="mt-0.5 h-10 w-10 rounded-full border border-white/15 bg-black/75 object-cover"
                    />
                  ) : (
                    <div className="mt-0.5 h-10 w-10 rounded-full border border-white/15 bg-black/75" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold leading-tight text-white md:text-4xl">
                      {course.title}
                    </p>
                    <p className="text-sm text-white/85 md:text-lg">
                      {course.mentor?.name || 'Design School'}
                    </p>
                  </div>
                </div>

                <iframe
                  className="block aspect-video w-full"
                  src={heroVideoEmbed}
                  title={course.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="lazy"
                />
              </div>

              <div className="px-5 pb-7 pt-7 md:px-8 md:pb-10 md:pt-9">
                <h1 className="max-w-4xl text-[2rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-[2.65rem] md:text-[3.55rem]">
                  {course.title}
                </h1>
                <div className="mt-3 flex items-end gap-3 md:mt-4 md:gap-5">
                  <img
                    src={`${CLOUD_BASE}/courses/cohort3heroArrowImage.webp`}
                    alt=""
                    className="h-7 w-18 object-contain md:h-10 md:w-28"
                  />
                  <span className="inline-flex rounded-full border border-emerald-400/55 bg-emerald-500/15 px-4 py-1 text-xs uppercase tracking-[0.12em] text-emerald-200 md:px-5 md:py-1.5 md:text-base">
                    {course.badgeText}
                  </span>
                </div>
                <p className="mt-5 max-w-5xl text-[1.03rem] font-light leading-snug text-white/70 md:mt-6 md:text-[1.22rem]">
                  {course.description}
                </p>
              </div>
            </div>

            <aside className="h-fit self-start rounded-2xl border border-[#4E4A48] bg-[radial-gradient(120%_120%_at_0%_0%,rgba(29,130,72,0.33),rgba(0,0,0,0.96)_73%)] p-5 md:p-7 lg:sticky lg:top-28">
              <div className="flex flex-wrap gap-2.5">
                {course.heroHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="w-fit rounded-lg bg-gradient-to-b from-[#353536] to-[#252528] p-[1px]"
                  >
                    <div className="flex items-center gap-1 rounded-lg bg-[#252528] px-3 py-1.5 text-sm text-emerald-400">
                      <span className="text-white">* {item.title}:</span>
                      <span className="font-bold text-white">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-3 text-[0.98rem] text-white/80 md:text-[1.14rem]">
                {(course.heroBullets.length > 0 ? course.heroBullets : ['Detailed course outcomes will appear here once the mentor updates them.']).map((item) => (
                  <div key={item} className="flex gap-3">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 md:mt-1 md:h-5 md:w-5" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <p className="text-3xl font-semibold text-white md:text-4xl">
                  <span className="text-white">{formatCurrency(course.pricing.salePrice)}</span>{' '}
                  <span className="ml-2 text-lg font-normal text-white/70 line-through md:text-xl">
                    {formatCurrency(course.pricing.price)}
                  </span>
                </p>
                {course.pricing.discountPercentage > 0 ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300/85 md:text-sm">
                    {course.pricing.discountPercentage}% discount active
                  </p>
                ) : null}
              </div>

              <a
                href={checkoutHref}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] px-6 py-4 text-lg font-semibold text-white transition hover:brightness-110"
              >
                Join Cohort Now
                <ArrowRight className="h-5 w-5" />
              </a>

              {course.syllabusUrl ? (
                <a
                  href={course.syllabusUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#8D8D8D] bg-[linear-gradient(90deg,#000_0%,#252528_100%)] px-6 py-4 text-lg font-medium text-white"
                >
                  View Full Syllabus
                  <ArrowRight className="h-5 w-5" />
                </a>
              ) : null}
            </aside>
          </div>
        </section>

        <section className="relative z-10 mt-16 overflow-hidden border-y border-white/6 px-4 py-16 md:mt-20 md:px-8 md:py-24">
          <img
            src={BUILD_PRODUCTS_GLOW}
            alt=""
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-35 blur-2xl"
          />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.2),transparent_55%)]" />

          <div className="relative mx-auto max-w-7xl text-center">
            <h2 className="bg-[linear-gradient(180deg,#7df6a3_0%,#22c55e_45%,#0f8b3b_100%)] bg-clip-text text-[2.3rem] font-black leading-[0.98] tracking-tight text-transparent drop-shadow-[0_10px_45px_rgba(34,197,94,0.35)] md:text-[6.8rem]">
              Build Real Products
            </h2>
            <p className="mx-auto mt-4 max-w-4xl text-[1.7rem] font-light leading-tight text-white/92 md:mt-5 md:text-[4.4rem]">
              That Actually Matters To The World
            </p>

            <div className="relative mx-auto mt-10 max-w-5xl md:mt-14">
              <img
                src={BUILD_PRODUCTS_IMAGE}
                alt="Build real products visual"
                className="mx-auto w-full object-contain drop-shadow-[0_0_70px_rgba(74,222,128,0.25)]"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        {comparison.left.length > 0 || comparison.right.length > 0 ? (
          <section className="relative z-10 mt-24 px-4 md:px-8">
            <div className="mx-auto max-w-6xl text-center">
              <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Comparison
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                What Sets This Course Apart
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-8 rounded-3xl border border-[#302C2A] p-5 md:p-8 lg:grid-cols-2">
              <div className="rounded-3xl border border-emerald-400/20 bg-[radial-gradient(64%_90%_at_50%_8%,rgba(80,164,109,0.1)_0%,rgba(8,8,8,0.26)_58%,rgba(7,7,7,0.36)_100%)] p-6">
                <img
                  src={`${CLOUD_BASE}/logos/full-logo.webp`}
                  alt="Design School"
                  className="h-12 object-contain"
                />
                <div className="mt-6 space-y-4">
                  {comparison.left.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-lg text-white/85">
                      <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/15 bg-[#151515]/70 p-6">
                <h3 className="text-3xl font-light">Others</h3>
                <div className="mt-6 space-y-4">
                  {comparison.right.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-lg text-white/75">
                      <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-[#E8602F]" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {course.technologySections.length > 0 ? (
          <section className="relative z-10 mt-28 overflow-hidden px-4 py-20 md:px-8 md:py-28">
            <img
              src={TOOLS_BG}
              alt=""
              className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-150 object-cover opacity-45 blur-lg"
            />

            <div className="relative mx-auto max-w-6xl text-center">
              <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Technologies
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                Industry Tools You&apos;ll Master
              </h2>

              <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-5">
                {course.technologySections.map((tab) => (
                  <button
                    key={tab.name}
                    type="button"
                    onClick={() => setActiveTech(tab.name)}
                    style={{
                      boxShadow:
                        '0px 33px 68px 0px #FFFFFF1A inset, 0px 3.6px 6.3px 0px #0000000D, 0px 3.6px 3.6px 0px #0000001A, 0px 3.6px 3.6px 0px #0000000D',
                    }}
                    className={`rounded-xl border px-6 py-3 text-base transition md:rounded-2xl md:px-8 md:py-4 md:text-2xl ${
                      currentTechnologySection?.name === tab.name
                        ? 'border-emerald-300 bg-[linear-gradient(180deg,#158B3E_0%,#50A46D_100%)]'
                        : 'border-[#4E4A48] bg-transparent'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-white/20 bg-black/25 px-6 py-10 md:px-8 md:py-12">
                <h3 className="mb-10 text-3xl font-semibold tracking-wide md:text-4xl">TOOLS AND TECHNOLOGIES</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {(currentTechnologySection?.items || []).map((item) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-[#333] bg-[#1A1A1A] p-4 transition hover:border-emerald-400/60"
                    >
                      {item.iconUrl ? (
                        <img
                          className="mx-auto h-24 w-24 object-contain"
                          src={item.iconUrl}
                          alt={item.name}
                        />
                      ) : (
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/5 text-3xl text-emerald-300">
                          {item.name.slice(0, 1)}
                        </div>
                      )}
                      <p className="mt-3 text-sm font-medium md:text-lg">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={checkoutHref}
                className="mt-14 inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_20px_0px_rgba(113,215,148,0.3)]"
              >
                Join Cohort Now
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </section>
        ) : null}

        <section
          id="modules_and_curriculum"
          className="relative z-10 mx-4 mt-24 rounded-3xl bg-[#EEEEEE] px-4 py-16 text-black md:mx-8 md:px-8"
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <div className="inline-flex rounded-sm border border-emerald-600/30 bg-emerald-600/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-700">
                Curriculum
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                Structured Curriculum Designed For Real Growth
              </h2>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:gap-10">
              <aside className="h-fit rounded-2xl border border-black/10 bg-white p-6 lg:sticky lg:top-28">
                <h3 className="text-2xl font-semibold text-[#111827]">Inside This Program</h3>
                <p className="mt-3 text-[#374151]">
                  Duration: <span className="font-semibold">{course.durationWeeks} weeks</span>
                </p>
                <p className="mt-1 text-[#374151]">
                  Difficulty: <span className="font-semibold">{course.levelLabel}</span>
                </p>

                <div className="mt-6">
                  <p className="text-sm uppercase tracking-[0.16em] text-emerald-700">Prerequisites</p>
                  <div className="mt-3 space-y-3 text-sm text-[#1f2937] md:text-base">
                    {course.requirements.length > 0 ? (
                      course.requirements.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <p>{item}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#4A5565]">No prerequisites have been added yet.</p>
                    )}
                  </div>
                </div>

                {course.targetAudience.length > 0 ? (
                  <div className="mt-6">
                    <p className="text-sm uppercase tracking-[0.16em] text-emerald-700">Best For</p>
                    <div className="mt-3 space-y-3 text-sm text-[#1f2937] md:text-base">
                      {course.targetAudience.map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {tags.length > 0 ? (
                  <div className="mt-8 rounded-xl border border-emerald-700/20 bg-emerald-100/40 p-4 text-sm text-emerald-900">
                    {tags.join(' | ')}
                  </div>
                ) : null}
              </aside>

              <div className="space-y-4">
                {course.curriculum.length > 0 ? (
                  course.curriculum.map((module, index) => (
                    <CourseModuleItem
                      key={`${module.title}-${index}`}
                      module={module}
                      index={index}
                      isOpen={openModule === index}
                      onToggle={() => setOpenModule(openModule === index ? -1 : index)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-black/10 bg-white px-6 py-8 text-[#4A5565]">
                    Curriculum modules will appear here once the mentor publishes them.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {builderItems.length > 0 ? (
          <section className="relative z-10 mt-24 px-4 md:px-8">
            <div className="mx-auto max-w-6xl text-center">
              <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Not Just Jobs
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                We Also Support Builders.
              </h2>

              <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
                {builderItems.map((item) => {
                  const Icon = builderIconMap[item.iconName] || Rocket;
                  return (
                    <div
                      key={item.title}
                      style={{
                        boxShadow:
                          '0px 33.35px 67.61px 0px rgba(80, 154, 129, 0.15) inset, 0px 3.61px 6.31px 0px rgba(0, 0, 0, 0.05), 0px 3.61px 3.61px 0px rgba(0, 0, 0, 0.1), 0px 3.61px 3.61px 0px rgba(0, 0, 0, 0.05)',
                        backdropFilter: 'blur(20.6px)',
                        background:
                          'radial-gradient(64% 90% at 50% 8%, rgba(80, 164, 109, 0.1) 0%, rgba(8, 8, 8, 0.26) 58%, rgba(7, 7, 7, 0.36) 100%)',
                      }}
                      className="flex min-h-[180px] flex-col items-center justify-center rounded-3xl border border-[#4E4A48] p-4 text-center"
                    >
                      <Icon className="mb-7 h-11 w-11 text-[#50A46D] drop-shadow-[0px_0px_10px_#50A46D] sm:h-14 sm:w-14" strokeWidth={1.5} />
                      <h3 className="whitespace-pre-line text-xl leading-tight text-white/75 sm:text-[1.6rem]">
                        {item.title}
                      </h3>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : null}

        <section className="relative z-10 mt-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
              Certification
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
              Get Certified with Recognized Validation
            </h2>
          </div>

          <div className="mx-auto mt-8 flex max-w-6xl flex-col-reverse gap-10 rounded-2xl border border-[#302C2A] p-8 lg:flex-row lg:p-14">
            <div className="lg:w-[45%]">
              <h3 className="text-5xl font-semibold leading-[1.15] md:text-6xl">
                Earn Certificate of <span className="text-emerald-400">Completion</span>
              </h3>

              <div className="mt-8 space-y-6">
                {certificatePoints.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-3 h-2 w-2 rounded-full bg-emerald-500/75" />
                    <p className="text-lg text-white/65">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex justify-end lg:w-[55%]">
              <img
                src={`${CLOUD_BASE}/courses/jobready3certificate.webp`}
                alt="Certificate"
                className="h-full w-[95%] rounded-lg object-contain opacity-95"
              />
            </div>
          </div>
        </section>

        {mentorSpotlights.length > 0 ? (
          <section className="relative z-10 mt-24 px-4 md:px-8">
            <div className="mx-auto max-w-6xl text-center">
              <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Our Team
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                Meet the experts behind your success!
              </h2>
            </div>
            <MentorCarousel mentors={mentorSpotlights} />
          </section>
        ) : null}

        {course.faqs.length > 0 ? (
          <section className="relative z-10 mt-24 px-4 pb-20 md:px-8">
            <div className="mx-auto max-w-5xl text-center">
              <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Faqs
              </div>
              <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
                Frequently Asked Questions From our Students
              </h2>
            </div>

            <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-4">
              {course.faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={`${faq.que}-${index}`}
                    className="overflow-hidden rounded-2xl border border-[#2A2D30] bg-[#000205]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                    >
                      <span
                        className={`text-xl transition-colors md:text-2xl ${
                          isOpen ? 'text-[#E9E9E9]/90' : 'text-[#E9E9E9]/50'
                        }`}
                      >
                        {faq.que}
                      </span>
                      <ChevronDown
                        className={`h-8 w-8 text-white transition-all duration-300 ${
                          isOpen ? 'rotate-180 opacity-100' : 'opacity-70'
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-5 text-lg text-[#FFFFFF99]/80 md:px-6 md:pb-6">
                            {faq.ans}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />

      <div
        className={`fixed bottom-0 left-1/2 z-[9999] w-full -translate-x-1/2 bg-[#1b1b1b] p-4 transition-all duration-300 md:bottom-5 md:w-max md:rounded-lg md:p-5 ${
          showStickyCta ? 'pointer-events-auto visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
      >
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <a
            href="/#courses"
            className="hidden items-center justify-center rounded-lg border border-white/40 px-6 py-3 text-lg text-white md:flex"
          >
            Courses
          </a>
          <a
            href="/request-callback"
            className="rounded-lg border border-white/40 px-6 py-3 text-lg text-white"
          >
            Request Callback
          </a>
          <a
            href={checkoutHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] px-6 py-3 text-lg font-semibold text-white"
          >
            Buy Now
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
