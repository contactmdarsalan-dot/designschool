import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, CheckCircle2, Clock3, FileText, Layers3, PlayCircle, Trophy } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import { apiFetch } from '../lib/api';
import { normalizeCourseDetail } from '../lib/courseContent';

const flattenLessons = (course) => {
  return (course?.curriculum || []).flatMap((module, moduleIndex) => {
    const lessons = Array.isArray(module.lessons) && module.lessons.length > 0
      ? module.lessons
      : (module.content || []).map((item, index) => ({
          id: `${moduleIndex}-${index}`,
          title: item,
          summary: module.description,
          type: 'article',
          estimatedMinutes: 8,
          xpReward: 10,
          blocks: [{ type: 'text', title: item, body: module.description || item }],
        }));

    return lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      moduleTitle: module.title,
      moduleIndex,
      lessonIndex,
    }));
  });
};

const blockIcon = {
  video: PlayCircle,
  task: CheckCircle2,
  code: FileText,
  callout: Award,
  image: FileText,
  text: FileText,
};

const LearningExperiencePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [completedLessons, setCompletedLessons] = useState(() => new Set());

  useEffect(() => {
    let isCancelled = false;

    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const { response, payload } = await apiFetch(`public/courses/${id}/`);
        if (!response.ok || !payload?.data?.course) {
          throw new Error(payload?.message || 'Course not found');
        }
        if (!isCancelled) {
          const normalized = normalizeCourseDetail(payload.data.course);
          const lessons = flattenLessons(normalized);
          setCourse(normalized);
          setActiveLessonId(String(lessons[0]?.id || ''));
        }
      } catch {
        if (!isCancelled) {
          setCourse(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCourse();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const lessons = useMemo(() => flattenLessons(course), [course]);
  const activeLesson = lessons.find((lesson) => String(lesson.id) === String(activeLessonId)) || lessons[0] || null;
  const totalXp = lessons.reduce((sum, lesson) => sum + Number(lesson.xpReward || 0), 0);
  const completedPercent = lessons.length ? Math.round((completedLessons.size / lessons.length) * 100) : 0;

  const toggleComplete = () => {
    if (!activeLesson) {
      return;
    }
    setCompletedLessons((current) => {
      const next = new Set(current);
      const key = String(activeLesson.id);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-24">
          <p className="text-white/62">Loading learning room...</p>
        </main>
      </div>
    );
  }

  if (!course || !activeLesson) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <Navbar />
        <main className="mx-auto max-w-4xl px-6 pt-36 text-center">
          <h1 className="text-3xl font-semibold">Learning experience not found.</h1>
          <Link to="/courses" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-bold text-black">
            Back to courses
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="grid min-h-screen pt-24 lg:grid-cols-[320px_1fr_300px]">
        <aside className="border-r border-white/10 bg-black/35 px-4 py-6 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)] lg:overflow-y-auto">
          <Link to={`/courses/${course.identifier}`} className="mb-6 inline-flex items-center gap-2 text-sm text-white/52 hover:text-white">
            <ArrowLeft size={16} />
            Course details
          </Link>
          <h1 className="text-2xl font-semibold leading-tight">{course.title}</h1>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-emerald-300" style={{ width: `${completedPercent}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/42">{completedPercent}% complete in this session</p>

          <div className="mt-7 space-y-6">
            {(course.curriculum || []).map((module, moduleIndex) => {
              const moduleLessons = lessons.filter((lesson) => lesson.moduleIndex === moduleIndex);
              return (
                <div key={`${module.title}-${moduleIndex}`}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    {module.title}
                  </p>
                  <div className="space-y-2">
                    {moduleLessons.map((lesson) => {
                      const active = String(lesson.id) === String(activeLesson.id);
                      const completed = completedLessons.has(String(lesson.id));
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => setActiveLessonId(String(lesson.id))}
                          className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                            active
                              ? 'border-emerald-300/60 bg-emerald-300/10'
                              : 'border-white/8 bg-white/[0.025] hover:border-white/18'
                          }`}
                        >
                          <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${completed ? 'text-emerald-300' : 'text-white/28'}`} />
                          <span>
                            <span className="block text-sm font-semibold">{lesson.title}</span>
                            <span className="mt-1 block text-xs text-white/40">
                              {lesson.estimatedMinutes || 8} min / {lesson.xpReward || 10} XP
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-emerald-300">
                <span>{activeLesson.moduleTitle}</span>
                <span className="text-white/24">/</span>
                <span>{activeLesson.type || 'lesson'}</span>
              </div>
              <h2 className="mt-5 text-[2.4rem] font-semibold leading-[1.04] tracking-tight md:text-[4.2rem]">
                {activeLesson.title}
              </h2>
              {activeLesson.summary ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/58">{activeLesson.summary}</p>
              ) : null}

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/8 bg-black/35 p-4">
                  <Clock3 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-2xl font-semibold">{activeLesson.estimatedMinutes || 8}</p>
                  <p className="text-xs text-white/42">minutes</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/35 p-4">
                  <Trophy className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-2xl font-semibold">{activeLesson.xpReward || 10}</p>
                  <p className="text-xs text-white/42">XP reward</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/35 p-4">
                  <Layers3 className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-2xl font-semibold">{activeLesson.quiz ? 'Quiz' : 'Task'}</p>
                  <p className="text-xs text-white/42">checkpoint</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {(activeLesson.blocks || []).length > 0 ? (
                activeLesson.blocks.map((block, index) => {
                  const Icon = blockIcon[block.type] || FileText;
                  return (
                    <article key={`${block.title}-${index}`} className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.06] text-emerald-300">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">{block.type || 'lesson'}</p>
                          <h3 className="mt-2 text-2xl font-semibold">{block.title || activeLesson.title}</h3>
                          {block.body ? <p className="mt-3 whitespace-pre-line leading-7 text-white/58">{block.body}</p> : null}
                          {block.mediaUrl ? (
                            <a href={block.mediaUrl} className="mt-4 inline-flex text-sm font-semibold text-emerald-300">
                              Open resource
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 leading-7 text-white/58">
                  Lesson content blocks will appear here once the mentor publishes them in the admin panel.
                </article>
              )}

              {activeLesson.quiz ? (
                <article className="rounded-3xl border border-emerald-300/20 bg-emerald-300/8 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Quiz Checkpoint</p>
                  <h3 className="mt-2 text-2xl font-semibold">{activeLesson.quiz.title}</h3>
                  <p className="mt-3 text-white/58">
                    Passing score: {activeLesson.quiz.passingScore}% / {activeLesson.quiz.questionCount} question{activeLesson.quiz.questionCount === 1 ? '' : 's'} / {activeLesson.quiz.xpReward} XP.
                  </p>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="border-l border-white/10 bg-black/25 px-4 py-6 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Session</p>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-sm text-white/48">Available XP</p>
            <p className="mt-2 text-4xl font-semibold">{totalXp}</p>
            <p className="mt-3 text-sm leading-6 text-white/48">
              This page reads lesson and quiz structure from the backend. Persisted progress can be connected to the progress API next.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleComplete}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 text-sm font-bold text-black transition hover:bg-emerald-200"
          >
            <CheckCircle2 size={18} />
            {completedLessons.has(String(activeLesson.id)) ? 'Mark incomplete' : 'Mark complete'}
          </button>
        </aside>
      </main>
    </div>
  );
};

export default LearningExperiencePage;
