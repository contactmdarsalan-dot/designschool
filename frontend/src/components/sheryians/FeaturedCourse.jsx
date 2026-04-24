import { motion } from 'framer-motion';
import { ArrowRight, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

const courseThemes = {
  light: {
    shell:
      'bg-[#f6efe8] text-black border border-black/10 shadow-[0_28px_90px_rgba(0,0,0,0.18)]',
    stackEdge: 'bg-[#efe4d8]',
    eyebrow: 'text-[#0b8f63]',
    body: 'text-black/65',
    chipPrimary: 'bg-black text-white',
    chipSecondary: 'bg-white border border-black/10 text-black',
    statBox: 'bg-white border border-black/10 text-[#0b8f63]',
    statValue: 'text-black',
    statLabel: 'text-black/60',
    divider: 'border-black/15',
    priceLabel: 'text-black',
    priceValue: 'text-[#0b8f63]',
    strike: 'text-black/45',
    button: 'bg-black text-white hover:bg-[#0b8f63] hover:text-black',
  },
  dark: {
    shell:
      'bg-black text-white border border-[#1d1d1d] shadow-[0_34px_110px_rgba(0,0,0,0.58)]',
    stackEdge: 'bg-[#10b981]',
    eyebrow: 'text-white/72',
    body: 'text-white/78',
    chipPrimary: 'bg-[#171717] border border-white/20 text-white',
    chipSecondary: 'bg-[#06281d] border border-[#10b981]/45 text-[#6ee7b7]',
    statBox: 'bg-[#052319] border border-[#10b981]/35 text-[#34d399]',
    statValue: 'text-white',
    statLabel: 'text-white/82',
    divider: 'border-white/14',
    priceLabel: 'text-white',
    priceValue: 'text-[#10b981]',
    strike: 'text-white/70',
    button: 'bg-white text-black hover:bg-[#10b981] hover:text-black',
  },
};

const courses = [
  {
    id: 'web-dev',
    theme: 'light',
    layout: 'media-left',
    eyebrow: 'Flagship Cohort',
    title: '3.0 Job Ready AI Powered Cohort: Complete Web Development + DSA + Gen AI + Aptitude',
    description:
      'Build real scalable products used by thousands of users, sharpen problem solving, and learn the stack companies actually hire for.',
    durationValue: '7',
    durationLabel: 'Months',
    certificationValue: 'Yes',
    certificationLabel: 'Certified',
    supportValue: '24/7',
    supportLabel: 'Mentor Support',
    price: 'Rs.8,999',
    originalPrice: 'Rs.17,998',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop',
    imageAlt: 'Learner focused web development cohort',
    tags: ['AI Powered', 'Job Ready'],
    href: '/courses/69aaf85ed2c69a507ba793ad',
  },
  {
    id: 'accelerator',
    theme: 'dark',
    layout: 'media-right',
    eyebrow: 'Cohort 2.0',
    title: '2.0 Job Ready AI Powered Cohort: Complete Web Development + DSA + Gen AI + Aptitude',
    description:
      'Practice with real products, project reviews, and guided interview prep built for faster placement outcomes.',
    durationValue: '200+',
    durationLabel: 'Hours',
    certificationValue: 'Yes',
    certificationLabel: 'Certified',
    supportValue: '24/7',
    supportLabel: 'Mentor Support',
    price: 'Rs.5,999',
    originalPrice: 'Rs.11,998',
    image:
      'https://images.unsplash.com/photo-1593642634443-44adaa06623a?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'Laptop based cohort learning card',
    tags: ['Job Ready', 'Fast Track'],
    href: '#',
  },
  {
    id: 'system-design',
    theme: 'light',
    layout: 'media-left',
    eyebrow: 'Advanced Track',
    title: 'System Design & Backend Engineering Pro',
    description:
      'Master APIs, distributed systems, databases, caching, and the backend architecture patterns used in production interview loops.',
    durationValue: '4',
    durationLabel: 'Months',
    certificationValue: 'Yes',
    certificationLabel: 'Certified',
    supportValue: 'Live',
    supportLabel: 'Review Sessions',
    price: 'Rs.7,499',
    originalPrice: 'Rs.15,499',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'System design and backend engineering program',
    tags: ['System Design', 'Backend'],
    href: '#',
  },
  {
    id: 'data-analytics',
    theme: 'dark',
    layout: 'media-right',
    eyebrow: 'Data & AI',
    title: 'Data Science & Analytics with Gen AI',
    description:
      'Build a practical analytics workflow across SQL, Python, dashboards, and LLM-assisted analysis using real case studies.',
    durationValue: '5+',
    durationLabel: 'Months',
    certificationValue: 'Yes',
    certificationLabel: 'Certified',
    supportValue: '24/7',
    supportLabel: 'Mentor Support',
    price: 'Rs.6,999',
    originalPrice: 'Rs.14,891',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
    imageAlt: 'Data analytics and AI cohort visual',
    tags: ['Data Science', 'Gen AI'],
    href: '#',
  },
];

const courseMetrics = (course) => [
  {
    id: `${course.id}-duration`,
    icon: Clock,
    value: course.durationValue,
    label: course.durationLabel,
  },
  {
    id: `${course.id}-certification`,
    icon: ShieldCheck,
    value: course.certificationValue,
    label: course.certificationLabel,
  },
  {
    id: `${course.id}-support`,
    icon: MessageSquare,
    value: course.supportValue,
    label: course.supportLabel,
  },
];

const SlidingButtonLabel = ({ text }) => {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {text}
      </span>
      <span className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
        {text}
      </span>
    </span>
  );
};

const CourseMetric = ({ icon: Icon, value, label, theme }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.statBox}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <div className={`text-2xl font-black tracking-tight ${theme.statValue}`}>{value}</div>
        <div className={`mt-1 text-sm font-medium ${theme.statLabel}`}>{label}</div>
      </div>
    </div>
  );
};

const StackedCourseCard = ({ course, index, total }) => {
  const theme = courseThemes[course.theme];
  const isLeadCourse = index === 0;
  const isLastCourse = index === total - 1;
  const isMediaLeft = course.layout === 'media-left';
  const stickyTop = 90 + index * 20;

  return (
    <article
      id={course.id}
      className={`relative ${isLeadCourse
        ? 'mt-0 md:min-h-[122vh] lg:min-h-[126vh]'
        : 'mt-10 md:-mt-[32vh] lg:-mt-[36vh] md:min-h-[118vh] lg:min-h-[122vh]'
        } ${isLastCourse ? 'md:min-h-[104vh] lg:min-h-[108vh]' : ''}`}
      style={{ zIndex: 20 + index }}
    >
      <motion.div
        initial={{ opacity: 0, y: 42, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.24 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`relative overflow-hidden rounded-[34px] p-6 will-change-transform md:sticky md:rounded-[48px] md:p-8 lg:px-10 lg:py-9 ${theme.shell}`}
        style={{ top: `${stickyTop}px` }}
      >
        {!isLeadCourse ? (
          <div className={`pointer-events-none absolute inset-x-0 top-0 h-6 ${theme.stackEdge}`} />
        ) : null}

        <div
          className={`grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-12 ${!isLeadCourse ? 'pt-3' : ''
            }`}
        >
          <div className={`${isMediaLeft ? 'lg:order-1' : 'lg:order-2'} relative`}>
            <div className="relative overflow-hidden rounded-[28px] bg-black/10">
              <img
                src={course.image}
                alt={course.imageAlt}
                className="aspect-[16/10] h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {course.tags.map((tag, tagIndex) => (
                  <span
                    key={`${course.id}-${tag}`}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] ${tagIndex === 0 ? theme.chipPrimary : theme.chipSecondary
                      }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className={`${isMediaLeft ? 'lg:order-2' : 'lg:order-1'}`}>
            <p className={`text-[11px] font-black uppercase tracking-[0.26em] ${theme.eyebrow}`}>
              {course.eyebrow}
            </p>

            <h3 className="mt-4 max-w-3xl text-[24px] font-black leading-[1.1] tracking-tight">
              {course.title}
            </h3>

            <p className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${theme.body}`}>
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-5 md:gap-7">
              {courseMetrics(course).map((metric) => (
                <CourseMetric key={metric.id} {...metric} theme={theme} />
              ))}
            </div>

            <div className={`mt-8 border-t pt-6 ${theme.divider}`}>
              <div className="flex flex-wrap items-end gap-x-2 gap-y-3">
                <span className={`text-3xl font-light leading-none md:text-4xl ${theme.priceLabel}`}>
                  Price
                </span>
                <span
                  className={`text-4xl font-black leading-none tracking-tight md:text-5xl ${theme.priceValue}`}
                >
                  {course.price}
                </span>
                <span className={`pb-1 text-base line-through md:text-lg ${theme.strike}`}>
                  {course.originalPrice}
                </span>
                <span className={`pb-1 text-base md:text-lg ${theme.strike}`}>(+ GST)</span>
              </div>

              <motion.a
                href={course.href}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Open details for ${course.title}`}
                className={`group mt-5 inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 text-base font-black transition-colors md:text-lg ${theme.button}`}
              >
                <SlidingButtonLabel text="Check Course" />
                <ArrowRight className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </motion.div>
    </article>
  );
};

const FeaturedCourse = () => {
  return (
    <section
      id="courses"
      className="relative mx-4 overflow-visible rounded-[2.6rem] bg-white px-4 py-28 shadow-[0_32px_110px_rgba(0,0,0,0.16)] md:mx-6 md:px-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(11,143,99,0.12),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(11,143,99,0.04))]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto mb-14 max-w-4xl text-center md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            className="relative inline-flex rounded-sm border border-[#0b8f63]/25 bg-[#0b8f63]/8 px-5 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-[#0b8f63]"
          >
            Courses
            <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-[#0b8f63]" />
            <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-[#0b8f63]" />
            <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-[#0b8f63]" />
            <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-[#0b8f63]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-black md:text-6xl"
          >
            Not Sure Which Course Fits You? Don&apos;t Worry, We Are Here To Help.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ delay: 0.08 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-black/55"
          >
            Explore industry-ready tracks built for internships, placements, and real product
            work.
          </motion.p>

          <motion.a
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.12 }}
            href="#courses-list"
            className="group mt-8 inline-flex items-center gap-3 rounded-2xl bg-black px-7 py-3.5 text-base font-black text-white transition-colors hover:bg-[#0b8f63] hover:text-black md:text-lg"
          >
            <SlidingButtonLabel text="Explore Courses" />
            <ArrowRight className="h-5 w-5" />
          </motion.a>
        </div>

        <div id="courses-list" className="relative pb-4">
          {courses.map((course, index) => (
            <StackedCourseCard
              key={course.id}
              course={course}
              index={index}
              total={courses.length}
            />
          ))}
        </div>


      </div>
    </section>
  );
};

export default FeaturedCourse;
