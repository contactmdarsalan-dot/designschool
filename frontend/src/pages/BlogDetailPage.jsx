import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock3, Eye } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Footer from '../components/sheryians/Footer';
import Navbar from '../components/sheryians/Navbar';
import { apiFetch } from '../lib/api';

const fallbackPost = {
  title: 'Article not found',
  excerpt: 'This article is not available right now.',
  content: '<p>Please go back to the blog list and choose another article.</p>',
  category: 'Blog',
  date: '',
  readTime: '',
  image: '',
  author_name: 'Design School',
  views: 0,
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Blog Article | Design School';
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadBlogPost = async () => {
      setIsLoading(true);

      try {
        const { response, payload } = await apiFetch(`public/blogs/${slug}/`);
        const fetchedPost = payload?.data?.post;
        const fetchedRelatedPosts = payload?.data?.related_posts || [];

        if (!response.ok || !fetchedPost) {
          throw new Error('Unable to load blog post.');
        }

        if (!isCancelled) {
          setPost(fetchedPost);
          setRelatedPosts(fetchedRelatedPosts);
          document.title = `${fetchedPost.title} | Design School`;
        }
      } catch {
        if (!isCancelled) {
          setPost(fallbackPost);
          setRelatedPosts([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBlogPost();

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-6 pt-28 text-center">
          <p className="text-2xl text-white/70">Loading article...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 py-8 md:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0.26),rgba(0,0,0,0.97)_64%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:190px_190px] opacity-25" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white md:text-base"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>

            <div className="mt-6 rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(14,14,16,0.96),rgba(5,5,7,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-emerald-400/45 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
                  {post?.category || 'Blog'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <Calendar className="h-4 w-4" />
                  {post?.date || 'Unscheduled'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <Clock3 className="h-4 w-4" />
                  {post?.readTime || 'Quick read'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <Eye className="h-4 w-4" />
                  {post?.views || 0} views
                </span>
              </div>

              <h1 className="mt-5 max-w-4xl text-[2.2rem] font-semibold leading-[1.08] tracking-tight md:text-[4.3rem]">
                {post?.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base text-white/68 md:text-xl">{post?.excerpt}</p>

              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-sm font-semibold text-white">
                  {(post?.author_name || 'D').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white/50">Written by</p>
                  <p className="text-base text-white">{post?.author_name || 'Design School'}</p>
                </div>
              </div>
            </div>

            {post?.image ? (
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/12">
                <img src={post.image} alt={post.title} className="aspect-[16/8] w-full object-cover" loading="lazy" />
              </div>
            ) : null}

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
              <article className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,16,20,0.94),rgba(6,6,8,0.98))] p-6 md:p-8">
                <div
                  className="max-w-none text-base leading-relaxed text-white/78 [&_a]:text-emerald-300 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-white [&_h2]:mt-7 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-white [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_li]:text-white/75 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-4 [&_strong]:text-white [&_ul]:list-disc [&_ul]:pl-6"
                  dangerouslySetInnerHTML={{ __html: post?.content || fallbackPost.content }}
                />
              </article>

              <aside className="space-y-6 lg:sticky lg:top-28">
                <div className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,16,20,0.95),rgba(5,5,7,0.98))] p-5 md:p-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">Continue Reading</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">Related Articles</h2>
                  <div className="mt-5 space-y-3">
                    {relatedPosts.length ? (
                      relatedPosts.map((related) => (
                        <Link
                          key={related.slug || related.id}
                          to={`/blog/${related.slug || related.id}`}
                          className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/35 hover:bg-emerald-500/[0.06]"
                        >
                          <p className="text-sm text-emerald-200">{related.category}</p>
                          <h3 className="mt-2 text-lg font-medium leading-snug text-white">{related.title}</h3>
                          <p className="mt-2 text-sm text-white/60">{related.excerpt}</p>
                          <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/65 transition group-hover:text-emerald-200">
                            Read article
                            <ArrowRight className="h-4 w-4" />
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-4 text-sm text-white/60">
                        More articles will show up here once related content is available.
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;
