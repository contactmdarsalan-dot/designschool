import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Code2,
  FileText,
  LayoutTemplate,
  Lightbulb,
  MonitorPlay,
  NotebookPen,
  PenSquare,
  ServerCog,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import Footer from '../components/sheryians/Footer';
import { freeResources } from '../data/freeResources';
import { apiUrl } from '../lib/api';

const iconByKey = {
  workflow: Workflow,
  code2: Code2,
  notebook: NotebookPen,
  layout: LayoutTemplate,
  server: ServerCog,
  database: ClipboardList,
  filetext: FileText,
  pen: PenSquare,
  book: BookOpen,
  video: MonitorPlay,
  lightbulb: Lightbulb,
  revision: NotebookPen,
};

const normalizeResource = (resource) => ({
  id: resource.id || resource.slug,
  slug: resource.slug || resource.id,
  title: resource.title,
  description: resource.description || resource.short_description || '',
  type: resource.type || resource.resource_type || '',
  count: resource.count || resource.count_label || '',
  iconKey: resource.iconKey || resource.icon_key || 'book',
});

const FreeResourcesPage = () => {
  const fallbackResources = useMemo(() => freeResources.map(normalizeResource), []);
  const [resources, setResources] = useState(fallbackResources);

  useEffect(() => {
    let isCancelled = false;

    const loadResources = async () => {
      try {
        const response = await fetch(apiUrl('public/resources/'));
        const payload = await response.json();
        const fetchedResources = (payload?.data?.resources || []).map(normalizeResource);

        if (!response.ok || fetchedResources.length === 0) {
          throw new Error(payload?.message || 'Unable to load resources');
        }

        if (!isCancelled) {
          setResources(fetchedResources);
        }
      } catch {
        if (!isCancelled) {
          setResources(fallbackResources);
        }
      }
    };

    loadResources();

    return () => {
      isCancelled = true;
    };
  }, [fallbackResources]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 pb-14 pt-8 md:px-8 md:pb-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(16,185,129,0.28),rgba(0,0,0,0.96)_62%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:180px_180px] opacity-30" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <span className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-5 py-2 text-xs uppercase tracking-[0.24em] text-emerald-300">
                Free Resources
              </span>
              <h1 className="mt-6 text-[2.2rem] font-semibold leading-[1.1] tracking-tight md:text-[4.8rem]">
                All Free Learning Resources In One Place
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base text-white/70 md:text-xl">
                Access complete free resources for coding, projects, interview prep, and career
                growth. Everything here is designed for easy learning flow.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => {
                const Icon = iconByKey[resource.iconKey] || BookOpen;
                return (
                  <article
                    key={resource.id}
                    className="group rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(18,18,20,0.95),rgba(5,5,7,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/12">
                        <Icon className="h-6 w-6 text-emerald-300" />
                      </div>
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/12 px-3 py-1 text-xs text-emerald-200">
                        {resource.type}
                      </span>
                    </div>

                    <h2 className="mt-5 text-[1.45rem] font-semibold leading-[1.22] tracking-tight md:text-[1.8rem]">
                      {resource.title}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">
                      {resource.description}
                    </p>

                    <p className="mt-4 text-sm text-white/55 md:text-base">{resource.count}</p>

                    <Link
                      to={`/free-resources/${resource.slug}`}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                    >
                      Open Resource
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
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

export default FreeResourcesPage;
