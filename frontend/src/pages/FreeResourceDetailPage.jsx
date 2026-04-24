import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Code2,
  FileText,
  Gauge,
  Layers3,
  LayoutTemplate,
  Lightbulb,
  MonitorPlay,
  NotebookPen,
  PenSquare,
  ServerCog,
  Sparkles,
  Workflow,
} from 'lucide-react';
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

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      delay,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const SectionShell = ({ title, subtitle, children }) => (
  <section className="rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(16,16,20,0.92),rgba(6,6,8,0.96))] p-6 md:p-8">
    <div>
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-white/65 md:text-base">{subtitle}</p> : null}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const normalizeResource = (resource) => ({
  id: resource.id || resource.slug,
  slug: resource.slug || resource.id,
  title: resource.title || '',
  description: resource.description || resource.short_description || '',
  type: resource.type || resource.resource_type || '',
  count: resource.count || resource.count_label || '',
  iconKey: resource.iconKey || resource.icon_key || 'book',
  level: resource.level || 'All Levels',
  format: resource.format || 'Structured Resource Pack',
  estimateTime: resource.estimateTime || resource.estimate_time || '',
  updatedAt: resource.updatedAt || resource.updated_label || '',
  accentLabel: resource.accentLabel || resource.accent_label || 'Free Resource',
  subtitle: resource.subtitle || resource.description || resource.short_description || '',
  previewTitle: resource.previewTitle || resource.preview_title || 'Resource Preview',
  previewCode: resource.previewCode || resource.preview_code || '',
  outcomes: (resource.outcomes || [])
    .map((item) => (typeof item === 'string' ? item : item.text))
    .filter(Boolean),
  modules: (resource.modules || []).map((module) => ({
    title: module.title,
    detail: module.detail || module.description || '',
    duration: module.duration || '',
  })),
  workflow: (resource.workflow || resource.workflow_steps || []).map((step) => ({
    title: step.title,
    detail: step.detail || '',
  })),
  includes: (resource.includes || [])
    .map((item) => (typeof item === 'string' ? item : item.text))
    .filter(Boolean),
});

const FreeResourceDetailPage = () => {
  const { resourceId } = useParams();
  const fallbackResources = useMemo(() => freeResources.map(normalizeResource), []);
  const fallbackResource = useMemo(
    () => fallbackResources.find((item) => item.slug === resourceId || item.id === resourceId) || null,
    [fallbackResources, resourceId],
  );
  const [remoteResource, setRemoteResource] = useState(null);
  const [resources, setResources] = useState(fallbackResources);
  const resource = remoteResource || fallbackResource;

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const [detailResponse, listResponse] = await Promise.all([
          fetch(apiUrl(`public/resources/${resourceId}/`)),
          fetch(apiUrl('public/resources/')),
        ]);

        const detailPayload = await detailResponse.json();
        const listPayload = await listResponse.json();

        const detailResource = normalizeResource(detailPayload?.data?.resource || {});
        const listResources = (listPayload?.data?.resources || []).map(normalizeResource);

        if (!detailResponse.ok || !detailResource.slug) {
          throw new Error(detailPayload?.message || 'Unable to load resource detail');
        }

        if (!isCancelled) {
          setRemoteResource(detailResource);
          if (listResponse.ok && listResources.length) {
            setResources(listResources);
          }
        }
      } catch {
        if (!isCancelled) {
          setRemoteResource(null);
          setResources(fallbackResources);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [resourceId, fallbackResource, fallbackResources]);

  if (!resource) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="mx-auto flex min-h-[72vh] max-w-4xl flex-col items-center justify-center px-6 pt-28 text-center">
          <h1 className="text-3xl font-semibold md:text-5xl">Resource not found</h1>
          <p className="mt-3 max-w-xl text-white/70">
            This free resource page does not exist yet. Please choose another resource from the list.
          </p>
          <Link
            to="/free-resources"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/45 bg-emerald-500/12 px-5 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Free Resources
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const Icon = iconByKey[resource.iconKey] || BookOpen;
  const currentIndex = resources.findIndex((item) => item.slug === resource.slug);
  const relatedResources = [
    ...resources.slice(currentIndex + 1),
    ...resources.slice(0, currentIndex),
  ].slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden pb-24 pt-28 md:pt-32">
        <section className="relative px-4 py-8 md:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(16,185,129,0.28),rgba(0,0,0,0.97)_64%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:190px_190px] opacity-25" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <Link
                to="/free-resources"
                className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white md:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to all resources
              </Link>
            </motion.div>

            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.08}
              className="mt-5 rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(14,14,16,0.96),rgba(5,5,7,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-10"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="max-w-4xl">
                  <span className="inline-flex rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-300 md:text-xs">
                    {resource.accentLabel}
                  </span>
                  <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-tight md:text-[3.7rem]">
                    {resource.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-base text-white/70 md:text-xl">{resource.subtitle}</p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/35 bg-emerald-500/12 px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/35 bg-emerald-500/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Resource Type</p>
                    <p className="text-sm font-medium text-emerald-200">{resource.type}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-3 md:px-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Level</p>
                  <p className="mt-1 text-sm text-white/90 md:text-base">{resource.level}</p>
                </div>
                <div className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-3 md:px-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Format</p>
                  <p className="mt-1 text-sm text-white/90 md:text-base">{resource.format}</p>
                </div>
                <div className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-3 md:px-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Count</p>
                  <p className="mt-1 text-sm text-white/90 md:text-base">{resource.count}</p>
                </div>
                <div className="rounded-xl border border-white/12 bg-white/[0.03] px-3 py-3 md:px-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/55">Time Plan</p>
                  <p className="mt-1 text-sm text-white/90 md:text-base">{resource.estimateTime}</p>
                </div>
              </div>
            </motion.section>

            <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.15}
                className="space-y-7"
              >
                <SectionShell
                  title="What You Will Achieve"
                  subtitle="Clear outcomes so you can track skill growth while using this resource."
                >
                  <div className="grid gap-3">
                    {resource.outcomes.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300 md:h-5 md:w-5" />
                        <p className="text-sm leading-relaxed text-white/85 md:text-base">{item}</p>
                      </div>
                    ))}
                  </div>
                </SectionShell>

                <SectionShell
                  title="Resource Modules"
                  subtitle="The resource is organized into practical modules with clear sequencing."
                >
                  <div className="space-y-3">
                    {resource.modules.map((module, index) => (
                      <div
                        key={module.title}
                        className="rounded-2xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-4 py-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-base font-medium text-white md:text-lg">
                            {index + 1}. {module.title}
                          </h3>
                          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/12 px-3 py-1 text-xs text-emerald-200">
                            {module.duration}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/70 md:text-base">{module.detail}</p>
                      </div>
                    ))}
                  </div>
                </SectionShell>

                <SectionShell
                  title="Simple Learning Flow"
                  subtitle="A repeatable routine to get the most value from this resource."
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    {resource.workflow.map((step, index) => (
                      <div
                        key={step.title}
                        className="rounded-2xl border border-white/12 bg-black/45 px-4 py-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/15 text-xs text-emerald-200">
                            {index + 1}
                          </span>
                          <h3 className="text-sm font-medium text-white md:text-base">{step.title}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </SectionShell>

                <SectionShell
                  title={resource.previewTitle}
                  subtitle="A quick sample to show how the content is structured inside this resource."
                >
                  <pre className="overflow-x-auto rounded-2xl border border-white/12 bg-black/70 p-4 text-xs leading-relaxed text-emerald-200 md:text-sm">
                    {resource.previewCode}
                  </pre>
                </SectionShell>
              </motion.div>

              <motion.aside
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0.22}
                className="lg:sticky lg:top-28"
              >
                <div className="rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(18,18,22,0.96),rgba(6,6,8,0.98))] p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)] md:p-7">
                  <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Quick Resource Info</h2>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-white/65">
                        <Gauge className="h-4 w-4 text-emerald-300" />
                        Skill Level
                      </span>
                      <span className="text-white">{resource.level}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-white/65">
                        <Layers3 className="h-4 w-4 text-emerald-300" />
                        Format
                      </span>
                      <span className="text-white">{resource.format}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-white/65">
                        <Sparkles className="h-4 w-4 text-emerald-300" />
                        Resource Size
                      </span>
                      <span className="text-white">{resource.count}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/12 bg-white/[0.03] px-3 py-2.5 text-sm">
                      <span className="inline-flex items-center gap-2 text-white/65">
                        <CalendarClock className="h-4 w-4 text-emerald-300" />
                        Last Update
                      </span>
                      <span className="text-white">{resource.updatedAt}</span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-white/12 pt-5">
                    <h3 className="text-base font-medium text-white">Includes</h3>
                    <div className="mt-3 space-y-2.5">
                      {resource.includes.map((item) => (
                        <p key={item} className="flex items-start gap-2 text-sm text-white/72">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <Link
                      to="/request-callback"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 md:text-base"
                    >
                      Request Callback
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/free-resources"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.02] px-4 py-3 text-sm text-white/90 transition hover:bg-white/[0.07] md:text-base"
                    >
                      View All Resources
                    </Link>
                  </div>
                </div>
              </motion.aside>
            </div>

            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={0.29}
              className="mt-10 rounded-3xl border border-white/14 bg-[linear-gradient(180deg,rgba(16,16,20,0.94),rgba(6,6,8,0.98))] p-6 md:p-8"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-emerald-300">Next Up</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                    Related Free Resources
                  </h2>
                </div>
                <Link
                  to="/free-resources"
                  className="inline-flex items-center gap-2 text-sm text-white/75 transition hover:text-white md:text-base"
                >
                  See full library
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {relatedResources.map((item) => {
                  const RelatedIcon = iconByKey[item.iconKey] || BookOpen;
                  return (
                    <Link
                      key={item.id}
                      to={`/free-resources/${item.slug}`}
                      className="group rounded-2xl border border-white/12 bg-white/[0.03] p-4 transition hover:border-emerald-400/45 hover:bg-emerald-500/[0.08]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10">
                          <RelatedIcon className="h-4 w-4 text-emerald-300" />
                        </div>
                        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60">
                          {item.type}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-medium leading-tight text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/65">{item.description}</p>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-200">
                        Open detail
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </p>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FreeResourceDetailPage;
