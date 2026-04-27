import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Gauge,
  LineChart,
  LockKeyhole,
  RefreshCw,
  Route,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { isAuthenticated } from '../lib/auth';

const featureBlocks = [
  {
    eyebrow: 'Get a focused learning path',
    title: 'Turn your result into a clear next step',
    body: 'After the assessment, learners get a skill map and a practical course direction based on current strengths and gaps.',
    icon: Route,
    points: ['Adaptive testing', 'Skills report', 'Personalized results', 'Learning tips'],
    visual: 'path',
  },
  {
    eyebrow: 'See how you compare',
    title: 'Benchmark your skills against other learners',
    body: 'Use scoring bands, role signals, and comparison ranges to understand where you stand and what to improve first.',
    icon: BarChart3,
    points: ['Industry benchmarks', 'Shareable report', 'UX and product roles', 'AI explanations'],
    visual: 'benchmark',
  },
  {
    eyebrow: 'Track growth visually',
    title: 'Build a skill graph across design and product work',
    body: 'Map progress across research, product thinking, visual systems, usability, AI, and delivery skills.',
    icon: LineChart,
    points: ['UX and PM skill graph', 'Skill-based insights', 'Share with peers', 'Team-ready view'],
    visual: 'graph',
  },
  {
    eyebrow: 'Grow with each retake',
    title: 'Measure progress over time',
    body: 'Retake assessments as your learning improves and compare reliability, growth insights, and previous attempts.',
    icon: RefreshCw,
    points: ['Reliability score', 'Growth insights', 'Historical attempts', 'Track improvement'],
    visual: 'growth',
  },
];

const proofStats = [
  { icon: ClipboardCheck, value: '2,000+', label: 'question pool', body: 'Coverage across practical design, product, and AI skill areas.' },
  { icon: Users, value: 'Expert', label: 'built by practitioners', body: 'Questions and learning maps are written for real work scenarios.' },
  { icon: ShieldCheck, value: 'Secure', label: 'proctored flow', body: 'Assessment rules help make the score more reliable.' },
  { icon: Target, value: 'Global', label: 'benchmarking', body: 'Compare your current level with broader learner signals.' },
];

const testimonials = [
  {
    quote: 'The assessment helped me understand where my portfolio was weak and what course to focus on first.',
    name: 'Aarav Shrestha',
    role: 'Product Designer',
    tag: 'career growth',
  },
  {
    quote: 'I liked seeing my skill map instead of guessing what to study next. It made the learning path feel obvious.',
    name: 'Nisha Gurung',
    role: 'UX Learner',
    tag: 'skill clarity',
  },
  {
    quote: 'The result helped me explain my design strengths more clearly during interviews.',
    name: 'Sahil Khan',
    role: 'UI/UX Designer',
    tag: 'confidence',
  },
];

const faqs = [
  {
    question: 'How does the skill assessment measure my level?',
    answer: 'It uses a structured question flow across practical UX, product, research, visual, and AI topics to build a clearer picture of your strengths and gaps.',
  },
  {
    question: 'What makes this different from a normal quiz?',
    answer: 'The assessment is designed to connect your score to a skill graph, benchmark signal, and recommended learning path instead of only showing a pass or fail result.',
  },
  {
    question: 'Can this help my career?',
    answer: 'Yes. Skill reports can help you explain strengths, choose better portfolio projects, and focus your next learning steps.',
  },
  {
    question: 'Can I retake the assessment?',
    answer: 'Yes. Retakes are useful after you complete lessons or courses because they show whether your skill profile is improving.',
  },
  {
    question: 'What skills does it cover?',
    answer: 'It can cover user research, visual design, interaction design, product thinking, product strategy, content, AI literacy, and delivery skills.',
  },
];

const skillRows = [
  ['Visual Design', 82],
  ['User Research', 74],
  ['Product Thinking', 69],
  ['Interaction Design', 88],
  ['AI Workflow', 61],
  ['Design Systems', 77],
];

const SkillGraphVisual = () => (
  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0e0d] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(16,185,129,0.22),transparent_46%)]" />
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-300/80">Skill Graph</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Design School Pulse</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-black">
          <Brain className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-[0.62fr_0.38fr]">
        <div className="space-y-4">
          {skillRows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-white/70">{label}</span>
                <span className="font-semibold text-white">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full bg-emerald-300" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
          <p className="text-sm text-emerald-100/80">Recommended path</p>
          <p className="mt-2 text-lg font-semibold text-white">UX Foundations</p>
          <p className="mt-3 text-sm leading-6 text-white/55">Start with visual hierarchy, research basics, and interaction patterns.</p>
          <Link to="/courses" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-white">
            View courses
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const FeatureVisual = ({ type }) => {
  if (type === 'benchmark') {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
        <div className="flex items-end gap-3">
          {[42, 64, 76, 88, 69].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-emerald-300/75" style={{ height: `${height * 1.5}px` }} />
              <span className="text-xs text-white/38">{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'graph') {
    return (
      <div className="relative h-64 rounded-3xl border border-white/10 bg-black/28 p-5">
        <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/35" />
        <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        {['Research', 'UI', 'AI', 'Product', 'Systems', 'Flow'].map((label, index) => {
          const positions = [
            'left-[42%] top-4',
            'right-5 top-16',
            'right-10 bottom-9',
            'left-[36%] bottom-3',
            'left-6 bottom-16',
            'left-8 top-16',
          ];
          return (
            <span key={label} className={`absolute ${positions[index]} rounded-full bg-emerald-300 px-3 py-1 text-xs font-semibold text-black`}>
              {label}
            </span>
          );
        })}
      </div>
    );
  }

  if (type === 'growth') {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
        <div className="grid grid-cols-4 gap-3">
          {[54, 62, 71, 84].map((score, index) => (
            <div key={score} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
              <p className="text-xs text-white/38">Attempt {index + 1}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{score}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/28 p-5">
      <div className="space-y-3">
        {['Take assessment', 'Receive skill graph', 'Follow recommended path'].map((label, index) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300 text-sm font-bold text-black">{index + 1}</span>
            <span className="text-sm font-semibold text-white">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AssessSkillsPage = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const assessmentHref = isAuthenticated() ? '/dashboard' : '/register?next=/dashboard';

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="overflow-hidden pt-24 md:pt-28">
        <section className="relative px-4 pb-16 pt-8 md:px-8 md:pb-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_58%_0%,rgba(16,185,129,0.18),transparent_56%)]" />
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72">
                  <Gauge className="h-3.5 w-3.5 text-emerald-300" />
                  Design School Pulse
                </div>
                <h1 className="mt-6 max-w-3xl text-[2.85rem] font-semibold leading-[1.04] tracking-tight md:text-[5rem]">
                  Find your skill level fast
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/62 md:text-lg">
                  Measure your UX, product, and AI skills, get a clear skill graph, and follow a personalized learning plan.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={assessmentHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-bold text-black transition hover:bg-emerald-300">
                    Start assessment
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/courses" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-semibold text-white transition hover:border-emerald-300/50">
                    Browse courses
                  </Link>
                </div>
              </div>
              <SkillGraphVisual />
            </motion.div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {proofStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <Icon className="h-5 w-5 text-emerald-300" />
                    <p className="mt-5 text-2xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm font-semibold text-white/72">{stat.label}</p>
                    <p className="mt-2 text-sm leading-6 text-white/48">{stat.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-7xl space-y-8">
            {featureBlocks.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45 }}
                  className={`grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:p-8 lg:grid-cols-2 lg:items-center ${
                    index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
                  }`}
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                      <Icon size={23} />
                    </div>
                    <p className="mt-6 text-sm font-semibold text-emerald-300">{feature.eyebrow}</p>
                    <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">{feature.title}</h2>
                    <p className="mt-5 max-w-xl text-base leading-7 text-white/58">{feature.body}</p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2">
                      {feature.points.map((point) => (
                        <div key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 text-sm text-white/68">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                  <FeatureVisual type={feature.visual} />
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Share your Skill Graph</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
                Turn assessment results into career proof
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/58">
                Add the graph to your profile, use it in portfolio reviews, or share it with mentors to focus your next improvement cycle.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {['Visible in profile', 'Shareable report', 'Challenge peers', 'Mentor-ready'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/68">
                    <Share2 size={14} className="text-emerald-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(16,185,129,0.18),transparent_42%),#090b0a] p-6">
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((item) => (
                  <div key={item.name} className="rounded-3xl border border-white/10 bg-black/32 p-5">
                    <div className="flex gap-1 text-emerald-300">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/62">{item.quote}</p>
                    <p className="mt-5 text-sm font-semibold text-white">{item.name}</p>
                    <p className="text-xs text-white/42">{item.role}</p>
                    <span className="mt-4 inline-flex rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-center md:p-12">
            <div className="mx-auto flex max-w-xl justify-center -space-x-3">
              {['UX', 'PM', 'AI', 'UI', 'DS'].map((label) => (
                <span key={label} className="flex h-12 w-12 items-center justify-center rounded-full border border-black bg-emerald-300 text-sm font-bold text-black">
                  {label}
                </span>
              ))}
            </div>
            <h2 className="mx-auto mt-7 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Test your UX or product skills today
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/58">
              In a short assessment flow, get a clearer skill graph and a custom course direction to grow with confidence.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={assessmentHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 text-sm font-bold text-black transition hover:bg-emerald-300">
                Start assessment
                <ArrowRight size={16} />
              </Link>
              <Link to="/paths" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 px-6 text-sm font-semibold text-white transition hover:border-emerald-300/50">
                View learning paths
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
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={faq.question} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d0c]">
                    <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                      <span className="text-sm font-semibold text-white sm:text-base">{faq.question}</span>
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
                          <p className="border-t border-white/8 px-5 py-5 text-sm leading-7 text-white/56">{faq.answer}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-8">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-8 text-center">
            <LockKeyhole className="mx-auto h-8 w-8 text-emerald-300" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white">Take control over your career growth</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/58">
              Measure your skills now, then turn the result into a guided Design School learning path.
            </p>
            <Link to={assessmentHref} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-emerald-400 px-6 text-sm font-bold text-black transition hover:bg-emerald-300">
              Start test
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AssessSkillsPage;
