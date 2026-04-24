import { useEffect, useState } from 'react';
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
import coursePayload from '../data/sheryiansCourse3.json';
import { apiUrl } from '../lib/api';

const CLOUD_BASE = 'https://dfdx9u0psdezh.cloudfront.net';
const COURSE_BG =
  'https://sheryians-pre-purchase-frontend.s3.ap-south-1.amazonaws.com/tools_icon/cohort3/homeBgCohort3.webp';
const TOOLS_BG =
  'https://sheryians-pre-purchase-frontend.s3.ap-south-1.amazonaws.com/tools_icon/cohort3/projectSectionCohort3bg.webp';
const DEFAULT_COURSE_ID = '69aaf85ed2c69a507ba793ad';
const BUILD_PRODUCTS_IMAGE = `${CLOUD_BASE}/Visual-Icons/cohort3graphic.webp`;
const BUILD_PRODUCTS_GLOW = `${CLOUD_BASE}/Visual-Icons/bgofheadingjobready3.webp`;

const heroHighlights = [
  { title: 'Schedule', value: 'Mon-Sat (8:30 PM)' },
  { title: 'Certificate', value: 'Yes' },
  { title: 'Language', value: 'Hinglish' },
  { title: 'Class', value: 'Live Classes' },
];

const heroBullets = [
  '250+ hours of live training',
  'Learn AI + Full Stack + DevOps + System Design',
  'Startup Mentorship + Funding Opportunity',
  'Discord Community Access - Peer Learning',
  'Mentorship + Career Guidance',
];

const comparison = {
  left: [
    'Highly Affordable, No Quality Cuts',
    'Project-Based, Skill-First Learning',
    'Continuously Updated With Industry Trends',
    'Internal Hackathons, Challenges & Face-Offs',
    'Industry-Relevant, Job-Oriented Curriculum',
  ],
  right: [
    'High Fees With Compromised Quality',
    'Theory-Centric Learning',
    'Outdated, Static Curriculum',
    'No Competitive Learning Environment',
    'Limited Practical Exposure',
  ],
};

const builderCards = [
  { title: 'How To Build\nStartups', icon: Rocket },
  { title: 'How To\nValidate Ideas', icon: Lightbulb },
  { title: 'How To Launch\nProducts', icon: Cpu },
  { title: 'How To Pitch\nTo Investors', icon: Handshake },
];

const technologyMap = {
  Frontend: [
    { name: 'React', icon: 'react.webp' },
    { name: 'Next.Js', icon: 'next (1).webp' },
    { name: 'TypeScript', icon: 'typescript.webp' },
    { name: 'Tailwind CSS', icon: 'tailwind.webp' },
  ],
  Backend: [
    { name: 'Node.js', icon: 'NODEJS.webp' },
    { name: 'Express', icon: 'EXPRESS.webp' },
    { name: 'MongoDB', icon: 'MONGODB.webp' },
  ],
  'AI Engineering': [
    { name: 'Vector DB', icon: 'VECTORDATABASE.webp' },
    { name: 'RAG System', icon: 'RAGSYSTEM.webp' },
    { name: 'LLM APIs', icon: 'LLMAPI.webp' },
    { name: 'Prompt Engineering', icon: 'prompEngineering.webp' },
  ],
  Infrastructure: [
    { name: 'AWS', icon: 'AWS.webp' },
    { name: 'CI/CD', icon: 'CICD.webp' },
    { name: 'Docker', icon: 'docker.webp' },
    { name: 'Redis', icon: 'REDIS.webp' },
  ],
  'Engineering Skills': [
    { name: 'System Design', icon: 'systemDesign.webp' },
    { name: 'Microservices', icon: 'microservices.webp' },
  ],
};

const mentorCards = [
  'Frame 2147227297.webp',
  'Frame 2147227282.webp',
  'harshBhaiyaImage.webp',
  'Frame 2147227284.webp',
  'akshitSinglaPhoto.webp',
  'Frame 2147227296.webp',
];

const certificateBullets = [
  'Build and showcase real products with practical workflows',
  'Receive expert mentorship and structured evaluation',
  'Earn a globally recognized certificate after completion',
];

const formatRs = (value) => {
  const amount = Number(value || 0);
  return `Rs.${Math.round(amount)}`;
};

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

const MentorCarousel = () => {
  const [active, setActive] = useState(2);
  const total = mentorCards.length;

  const diffFromActive = (index) => {
    let diff = index - active;
    if (diff > total / 2) {
      diff -= total;
    }
    if (diff < -total / 2) {
      diff += total;
    }
    return diff;
  };

  const visibleCards = mentorCards
    .map((image, index) => {
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
        image,
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
            key={card.image}
            type="button"
            onClick={() => setActive(card.index)}
            className="absolute left-1/2 top-1/2 h-[84%] w-[62vw] overflow-hidden rounded-2xl border border-white/15 bg-black shadow-[0_16px_48px_rgba(0,0,0,0.48)] transition-[transform,opacity] duration-700 md:w-[30vw] md:min-w-[220px] lg:w-[20vw]"
            style={card.style}
          >
            <img
              src={`${CLOUD_BASE}/courses/${card.image}`}
              alt="Mentor"
              className="h-full w-full object-cover"
              loading="lazy"
            />
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
  const requestedCourseId = params.id || DEFAULT_COURSE_ID;
  const fallbackCourse = requestedCourseId === DEFAULT_COURSE_ID ? coursePayload?.data?.course || null : null;
  const [course, setCourse] = useState(fallbackCourse);
  const [isLoadingCourse, setIsLoadingCourse] = useState(requestedCourseId !== DEFAULT_COURSE_ID);

  const [openModule, setOpenModule] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [activeTech, setActiveTech] = useState('Frontend');
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const getCourseById = async () => {
      setIsLoadingCourse(true);

      try {
        const response = await fetch(
          apiUrl(`public/courses/${requestedCourseId}/`),
        );
        const payload = await response.json();
        const fetchedCourse = payload?.data?.course;

        if (!response.ok || !fetchedCourse) {
          throw new Error(payload?.message || 'Failed to fetch course');
        }

        if (!isCancelled) {
          setCourse(fetchedCourse);
          setOpenModule(0);
          setOpenFaq(0);
        }
      } catch {
        if (!isCancelled) {
          setCourse(fallbackCourse);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingCourse(false);
        }
      }
    };

    getCourseById();

    return () => {
      isCancelled = true;
    };
  }, [fallbackCourse, requestedCourseId]);

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

  if (isLoadingCourse && !course) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 pb-24 pt-36 text-center">
          <p className="text-3xl font-semibold">Loading course...</p>
        </main>
      </div>
    );
  }

  if (!course) {
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

  const discount = Number(course.discountPercentage || 0);
  const mrp = Number(course.price || 0);
  const salePrice = Math.round(mrp - (mrp * discount) / 100);
  const checkoutHref = `/checkout?courseId=${course._id}&batchId=${course?.batches?._id || ''}`;
  const syllabusUrl = 'https://sheryians.notion.site/cohort-3';
  const technologies = technologyMap[activeTech] || [];
  const heroTitle = course?.title || '3.0 Job Ready AI Powered Cohort';
  const heroDescription = course?.metaData?.description || '';
  const heroVideoEmbed = toYoutubeEmbedUrl(course?.metaData?.displayVideo);

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
                  <img
                    src={`${CLOUD_BASE}/logos/favicon.png`}
                    alt=""
                    className="mt-0.5 h-10 w-10 rounded-full border border-white/15 bg-black/75 p-1"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold leading-tight text-white md:text-4xl">
                      {heroTitle}
                    </p>
                    <p className="text-sm text-white/85 md:text-lg">Sheryians Coding School</p>
                  </div>
                </div>

                <iframe
                  className="block aspect-video w-full"
                  src={heroVideoEmbed}
                  title={heroTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="lazy"
                />
              </div>

              <div className="px-5 pb-7 pt-7 md:px-8 md:pb-10 md:pt-9">
                <h1 className="max-w-4xl text-[2rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-[2.65rem] md:text-[3.55rem]">
                  {heroTitle}
                </h1>
                <div className="mt-3 flex items-end gap-3 md:mt-4 md:gap-5">
                  <img
                    src={`${CLOUD_BASE}/courses/cohort3heroArrowImage.webp`}
                    alt=""
                    className="h-7 w-18 object-contain md:h-10 md:w-28"
                  />
                  <span className="inline-flex rounded-full border border-emerald-400/55 bg-emerald-500/15 px-4 py-1 text-xs uppercase tracking-[0.12em] text-emerald-200 md:px-5 md:py-1.5 md:text-base">
                    Job Ready!
                  </span>
                </div>
                <p className="mt-5 max-w-5xl text-[1.03rem] font-light leading-snug text-white/70 md:mt-6 md:text-[1.22rem]">
                  {heroDescription}
                </p>
              </div>
            </div>

            <aside className="h-fit self-start rounded-2xl border border-[#4E4A48] bg-[radial-gradient(120%_120%_at_0%_0%,rgba(29,130,72,0.33),rgba(0,0,0,0.96)_73%)] p-5 md:p-7 lg:sticky lg:top-28">
              <div className="flex flex-wrap gap-2.5">
                {heroHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="w-fit rounded-lg bg-gradient-to-b from-[#353536] to-[#252528] p-[1px]"
                  >
                    <div className="flex items-center gap-1 rounded-lg bg-[#252528] px-3 py-1.5 text-sm text-emerald-400">
                      <span className="text-white">✦ {item.title}:</span>
                      <span className="font-bold text-white">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-[1rem] leading-snug text-white/95 md:text-[1.38rem]">
                  <Phone className="h-4 w-4 text-white md:h-5 md:w-5" />
                  <p>
                    Build <span className="font-semibold">Real Products</span> (Not Just Projects)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[1rem] leading-snug text-white/95 md:text-[1.38rem]">
                  <Award className="h-4 w-4 text-[#ffcc00] md:h-5 md:w-5" />
                  <p>
                    <span className="font-semibold">Certification</span> Included
                  </p>
                </div>
              </div>

              <div className="my-6 flex items-center gap-3 md:my-7">
                <span className="h-px flex-1 bg-white/25" />
                <p className="text-sm font-medium text-white/88 md:text-base">The Next Big Thing+</p>
                <span className="h-px flex-1 bg-white/25" />
              </div>

              <div className="space-y-3 text-[0.98rem] text-white/80 md:text-[1.14rem]">
                {heroBullets.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400 md:mt-1 md:h-5 md:w-5" />
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <p className="text-3xl font-semibold text-white md:text-4xl">
                  <span className="text-white">{formatRs(salePrice)}</span>{' '}
                  <span className="ml-2 text-lg font-normal text-white/70 line-through md:text-xl">
                    {formatRs(mrp)}
                  </span>
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-emerald-300/85 md:text-sm">
                  {discount}% discount active
                </p>
              </div>

              <a
                href={checkoutHref}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] px-6 py-4 text-lg font-semibold text-white transition hover:brightness-110"
              >
                Join Cohort Now
                <ArrowRight className="h-5 w-5" />
              </a>

              <a
                href={syllabusUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#8D8D8D] bg-[linear-gradient(90deg,#000_0%,#252528_100%)] px-6 py-4 text-lg font-medium text-white"
              >
                View Full Syllabus
                <ArrowRight className="h-5 w-5" />
              </a>
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
            <h2 className="text-[2.3rem] font-black leading-[0.98] tracking-tight text-transparent bg-[linear-gradient(180deg,#7df6a3_0%,#22c55e_45%,#0f8b3b_100%)] bg-clip-text drop-shadow-[0_10px_45px_rgba(34,197,94,0.35)] md:text-[6.8rem]">
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

        <section className="relative z-10 mt-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
              Comparison
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
              What Sets Sheryians Apart From Other Coders
            </h2>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-8 rounded-3xl border border-[#302C2A] p-5 md:p-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-400/20 bg-[radial-gradient(64%_90%_at_50%_8%,rgba(80,164,109,0.1)_0%,rgba(8,8,8,0.26)_58%,rgba(7,7,7,0.36)_100%)] p-6">
              <img
                src={`${CLOUD_BASE}/logos/full-logo.webp`}
                alt="Sheryians"
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
              {Object.keys(technologyMap).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTech(tab)}
                  style={{
                    boxShadow:
                      '0px 33px 68px 0px #FFFFFF1A inset, 0px 3.6px 6.3px 0px #0000000D, 0px 3.6px 3.6px 0px #0000001A, 0px 3.6px 3.6px 0px #0000000D',
                  }}
                  className={`rounded-xl border px-6 py-3 text-base transition md:rounded-2xl md:px-8 md:py-4 md:text-2xl ${
                    activeTech === tab
                      ? 'border-emerald-300 bg-[linear-gradient(180deg,#158B3E_0%,#50A46D_100%)]'
                      : 'border-[#4E4A48] bg-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/20 bg-black/25 px-6 py-10 md:px-8 md:py-12">
              <h3 className="mb-10 text-3xl font-semibold tracking-wide md:text-4xl">TOOLS AND TECHNOLOGIES</h3>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {technologies.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-[#333] bg-[#1A1A1A] p-4 transition hover:border-emerald-400/60"
                  >
                    <img
                      className="mx-auto h-24 w-24 object-contain"
                      src={`${TOOLS_BG.replace('projectSectionCohort3bg.webp', '')}${item.icon}`}
                      alt={item.name}
                    />
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
                  Duration: <span className="font-semibold">{course.duration_weeks} weeks</span>
                </p>
                <p className="mt-1 text-[#374151]">
                  Difficulty: <span className="font-semibold">Beginner to Advance</span>
                </p>

                <div className="mt-6">
                  <p className="text-sm uppercase tracking-[0.16em] text-emerald-700">Prerequisites</p>
                  <div className="mt-3 space-y-3 text-sm text-[#1f2937] md:text-base">
                    {(course.metaData.requirements || []).map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 rounded-xl border border-emerald-700/20 bg-emerald-100/40 p-4 text-sm text-emerald-900">
                  {(course.metaData.displayTags || []).join(' | ')}
                </div>
              </aside>

              <div className="space-y-4">
                {(course.metaData.content || []).map((module, index) => (
                  <CourseModuleItem
                    key={`${module.title}-${index}`}
                    module={module}
                    index={index}
                    isOpen={openModule === index}
                    onToggle={() => setOpenModule(openModule === index ? -1 : index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mt-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
              Not Just Jobs
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
              We Also Support Builders.
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {builderCards.map((item) => {
                const Icon = item.icon;
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
                {certificateBullets.map((item) => (
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

        <section className="relative z-10 mt-24 px-4 md:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex rounded-sm border border-emerald-400/35 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
              Our Team
            </div>
            <h2 className="mx-auto mt-6 max-w-4xl text-[2rem] font-medium leading-[1.2] md:text-[3.2rem]">
              Meet the experts behind your success!
            </h2>
          </div>
          <MentorCarousel />
        </section>

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
            {(course.metaData.faqs || []).map((faq, index) => {
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
