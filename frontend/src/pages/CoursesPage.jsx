import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/sheryians/Navbar';
import ComparisonSection from '../components/sheryians/ComparisonSection';
import FaqSection from '../components/sheryians/FaqSection';
import TransformJourney from '../components/sheryians/TransformJourney';
import Footer from '../components/sheryians/Footer';
import coursesPayload from '../data/sheryiansCoursesList.json';
import { apiUrl } from '../lib/api';

const COURSES_API = apiUrl('public/courses/?page=1&limit=24');

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) {
    return 'Rs.0';
  }

  if (Math.abs(amount % 1) > 0) {
    return `Rs.${amount.toFixed(2).replace(/\.?0+$/, '')}`;
  }

  return `Rs.${Math.round(amount)}`;
};

const calculateSalePrice = (mrp, discountPercentage) => {
  const base = Number(mrp || 0);
  const discount = Number(discountPercentage || 0);
  return Math.max(0, Math.round(base - (base * discount) / 100));
};

const sanitizeCourses = (list) => {
  return (list || [])
    .filter((item) => item?.state === 'published')
    .map((item) => ({
      id: item._id,
      title: item.title,
      thumbnail: item?.metaData?.thumbnail,
      tags: item?.metaData?.displayTags || [],
      language: item?.metaData?.language || 'Hindi',
      type: item?.type || 'self-paced',
      mrp: Number(item?.price || 0),
      discount: Number(item?.discountPercentage || 0),
    }));
};

const fallbackCourses = sanitizeCourses(coursesPayload?.data?.courses || []);

const CoursesPage = () => {
  const [courses, setCourses] = useState(fallbackCourses);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadCourses = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(COURSES_API);
        const payload = await response.json();
        const fetchedCourses = sanitizeCourses(payload?.data?.courses || []);

        if (!response.ok || fetchedCourses.length === 0) {
          throw new Error(payload?.message || 'Could not load courses');
        }

        if (!isCancelled) {
          setCourses(fetchedCourses);
        }
      } catch {
        if (!isCancelled) {
          setCourses(fallbackCourses);
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
  }, []);

  const cards = useMemo(() => {
    return courses.map((course) => ({
      ...course,
      salePrice: calculateSalePrice(course.mrp, course.discount),
    }));
  }, [courses]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="overflow-hidden pt-28 md:pt-32">
        <section className="relative px-4 pb-20 pt-8 md:px-8 md:pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0.35),transparent_48%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:240px_240px] opacity-35" />
          </div>

          <div className="relative mx-auto max-w-[1780px]">
            <div className="mx-auto max-w-5xl text-center">
              <span className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Courses
              </span>
              <h1 className="mt-8 text-[2.3rem] font-medium leading-[1.12] tracking-tight text-white md:text-[5.1rem]">
                Level Up Your Coding Skills With Expert-Led Courses
              </h1>
            </div>

            {isLoading && cards.length === 0 ? (
              <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`loading-${index}`}
                    className="h-[530px] animate-pulse rounded-[26px] border border-white/10 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((course) => (
                  <article
                    key={course.id}
                    className="group relative rounded-[26px] border border-white/15 bg-[linear-gradient(180deg,rgba(22,22,23,0.95)_0%,rgba(0,0,0,0.98)_100%)] p-5 shadow-[0_14px_55px_rgba(0,0,0,0.36)]"
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#f4c64f]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#41d875]" />
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      {course.type === 'live' ? (
                        <div className="absolute right-4 top-4 rounded-xl bg-white px-4 py-2 text-[1.65rem] font-semibold text-[#e42d2d] md:text-sm">
                          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff3434]" />
                          LIVE
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={`${course.id}-${tag}`}
                          className="rounded-full border border-white/25 px-4 py-1.5 text-sm text-white/75"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="mt-4 min-h-[5.5rem] text-[2.95rem] leading-[1.15] tracking-tight text-white md:text-[2.45rem]">
                      {course.title}
                    </h2>

                    <div className="mt-7 flex items-end justify-between gap-4">
                      <div className="leading-none">
                        <p className="text-[2.85rem] font-light text-white md:text-[2.4rem]">
                          Price{' '}
                          <span className="font-medium text-emerald-400">
                            {formatCurrency(course.salePrice)}
                          </span>{' '}
                          <span className="text-[1.55rem] text-white/45 line-through md:text-lg">
                            {formatCurrency(course.mrp)}
                          </span>
                        </p>
                      </div>
                      <span className="rounded-md bg-white px-2.5 py-1 text-sm text-black">
                        {course.discount}% OFF
                      </span>
                    </div>

                    <a
                      href={`/courses/${course.id}`}
                      className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-white/35 px-6 py-3 text-[1.7rem] font-medium text-white transition hover:bg-white hover:text-black md:text-lg"
                    >
                      Check Course
                      <ArrowRight className="h-5 w-5" />
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <ComparisonSection />
        <FaqSection />
        <TransformJourney />
      </main>

      <Footer />
    </div>
  );
};

export default CoursesPage;
