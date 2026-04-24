import { useEffect, useState } from 'react';
import { ArrowRight, Calendar, Clock3 } from 'lucide-react';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { apiUrl } from '../lib/api';

const fallbackBlogPosts = [
  {
    id: 'job-ready-roadmap-2026',
    title: 'Job-Ready Roadmap 2026: From Beginner to Developer',
    excerpt:
      'A practical step-by-step roadmap to build projects, clear interviews, and become job-ready with the right stack.',
    category: 'Career',
    date: 'Apr 20, 2026',
    readTime: '7 min read',
    image:
      'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'full-stack-projects-that-hire',
    title: '5 Full-Stack Projects That Actually Impress Recruiters',
    excerpt:
      'Skip clone fatigue. Build product-grade projects with real user flows, APIs, auth, deployment, and clean UI.',
    category: 'Projects',
    date: 'Apr 17, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
  },
  {
    id: 'dsa-prep-plan',
    title: 'How to Prepare DSA Alongside Development (Without Burnout)',
    excerpt:
      'A balanced weekly plan for DSA + development so you can improve problem solving and still ship portfolio work.',
    category: 'DSA',
    date: 'Apr 12, 2026',
    readTime: '8 min read',
    image:
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'react-performance-guide',
    title: 'React Performance Checklist for Real-World Apps',
    excerpt:
      'Use this focused checklist to remove rendering bottlenecks, improve UX responsiveness, and ship smoother apps.',
    category: 'Frontend',
    date: 'Apr 10, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=2069&auto=format&fit=crop',
  },
  {
    id: 'backend-api-design',
    title: 'API Design Basics Every Backend Developer Should Know',
    excerpt:
      'Design clean, consistent, and scalable APIs with clear conventions, versioning strategy, and robust error handling.',
    category: 'Backend',
    date: 'Apr 7, 2026',
    readTime: '9 min read',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 'placement-interview-mistakes',
    title: 'Top Interview Mistakes Students Make During Placements',
    excerpt:
      'Understand common interview mistakes and how to fix communication, approach, and confidence before placements.',
    category: 'Placement',
    date: 'Apr 4, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
  },
];

const BlogListPage = () => {
  const [blogPosts, setBlogPosts] = useState(fallbackBlogPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const loadBlogs = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(apiUrl('public/blogs/?page=1&limit=12'));
        const payload = await response.json();
        const fetchedPosts = payload?.data?.posts || [];

        if (!response.ok || fetchedPosts.length === 0) {
          throw new Error(payload?.message || 'Failed to load blogs');
        }

        if (!isCancelled) {
          setBlogPosts(fetchedPosts);
        }
      } catch {
        if (!isCancelled) {
          setBlogPosts(fallbackBlogPosts);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBlogs();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 pb-16 pt-8 md:px-8 md:pb-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.26),rgba(0,0,0,0.96)_62%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:170px_170px] opacity-30" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Blog
              </span>
              <h1 className="mt-6 text-[2.3rem] font-semibold leading-[1.1] tracking-tight md:text-[4.8rem]">
                Insights, Roadmaps, and Tech Growth Stories
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-white/70 md:text-xl">
                Learn from practical guides, project breakdowns, interview prep playbooks, and
                career-focused engineering content.
              </p>
            </div>

            {isLoading && blogPosts.length === 0 ? (
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`blog-loader-${index}`}
                    className="h-[420px] animate-pulse rounded-3xl border border-white/10 bg-white/[0.03]"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                {blogPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(20,20,22,0.95),rgba(5,5,7,0.98))] shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <span className="absolute left-4 top-4 rounded-full border border-emerald-400/55 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                        {post.category}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-white/60 md:text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {post.date}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="mt-4 text-[1.6rem] font-semibold leading-[1.2] tracking-tight md:text-[2rem]">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                        {post.excerpt}
                      </p>

                      <a
                        href="#"
                        className="mt-6 inline-flex items-center gap-2 text-base font-medium text-emerald-300 transition hover:text-emerald-200 md:text-lg"
                      >
                        Read Article
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </div>
                  </article>
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

export default BlogListPage;
