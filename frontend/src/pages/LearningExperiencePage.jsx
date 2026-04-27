import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, CheckCircle2, Clock3, FileText, Flame, Layers3, Medal, PlayCircle, Trophy } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import { apiFetch } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { normalizeCourseDetail } from '../lib/courseContent';
import { normalizeGamificationSummary } from '../lib/learningPlatform';

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
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState('');
  const [completedLessons, setCompletedLessons] = useState(() => new Set());
  const [remoteProgress, setRemoteProgress] = useState(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [gamification, setGamification] = useState(null);

  const requestedLessonId = searchParams.get('lesson');

  const applyProgressPayload = (payload) => {
    const progress = payload?.data || payload;
    const rows = progress?.lessons || [];
    setRemoteProgress(progress?.progress || null);
    setCompletedLessons(
      new Set(
        rows
          .filter((row) => row.status === 'completed')
          .map((row) => String(row.id)),
      ),
    );
  };

  const refreshGamification = async () => {
    if (!isAuthenticated()) {
      setGamification(null);
      return;
    }

    try {
      const { response, payload } = await apiFetch('courses/gamification/summary/', {
        auth: true,
      });
      if (response.ok) {
        setGamification(normalizeGamificationSummary(payload?.data || {}));
      }
    } catch {
      // Gamification is secondary to lesson reading.
    }
  };

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
          const requestedLesson = lessons.find((lesson) => String(lesson.id) === String(requestedLessonId));
          setCourse(normalized);
          setActiveLessonId(String(requestedLesson?.id || lessons[0]?.id || ''));

          if (isAuthenticated()) {
            const progressResult = await apiFetch(`courses/progress/${normalized.slug || normalized.identifier}/`, {
              auth: true,
            });
            if (progressResult.response.ok) {
              applyProgressPayload(progressResult.payload);
            }
            await refreshGamification();
          }
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
  }, [id, requestedLessonId]);

  const lessons = useMemo(() => flattenLessons(course), [course]);
  const activeLesson = lessons.find((lesson) => String(lesson.id) === String(activeLessonId)) || lessons[0] || null;
  const totalXp = lessons.reduce((sum, lesson) => sum + Number(lesson.xpReward || 0), 0);
  const completedPercent = remoteProgress?.progressPercent ?? (lessons.length ? Math.round((completedLessons.size / lessons.length) * 100) : 0);
  const earnedXp = remoteProgress?.xpEarned ?? Array.from(completedLessons).reduce((sum, lessonId) => {
    const lesson = lessons.find((item) => String(item.id) === lessonId);
    return sum + Number(lesson?.xpReward || 0);
  }, 0);

  useEffect(() => {
    const startLesson = async () => {
      if (!isAuthenticated() || !activeLesson?.id || Number.isNaN(Number(activeLesson.id))) {
        return;
      }

      try {
        await apiFetch(`courses/lessons/${activeLesson.id}/start/`, {
          method: 'POST',
          auth: true,
        });
      } catch {
        // Starting progress is helpful but should not block reading the lesson.
      }
    };

    startLesson();
  }, [activeLesson?.id]);

  useEffect(() => {
    setQuizAnswers({});
    setQuizResult(null);
    setProgressError('');
  }, [activeLesson?.id]);

  const updateQuizAnswer = (question, optionId) => {
    const questionId = String(question.id);
    const optionKey = String(optionId);
    setQuizAnswers((current) => {
      const existing = current[questionId] || [];
      if (question.type === 'multiple_choice') {
        return {
          ...current,
          [questionId]: existing.includes(optionKey)
            ? existing.filter((item) => item !== optionKey)
            : [...existing, optionKey],
        };
      }
      return {
        ...current,
        [questionId]: [optionKey],
      };
    });
  };

  const submitActiveQuiz = async () => {
    if (!activeLesson?.quiz?.id) {
      return;
    }

    if (!isAuthenticated()) {
      setProgressError('Sign in to submit quizzes and save XP.');
      return;
    }

    setIsSubmittingQuiz(true);
    setProgressError('');
    try {
      const { response, payload } = await apiFetch(`courses/quizzes/${activeLesson.quiz.id}/attempts/`, {
        method: 'POST',
        auth: true,
        body: { answers: quizAnswers },
      });
        if (!response.ok) {
          throw new Error(payload?.message || 'Could not submit quiz.');
        }
        setQuizResult(payload?.data?.attempt || null);
        if (payload?.data?.progress) {
          applyProgressPayload(payload.data.progress);
        }
        await refreshGamification();
      } catch {
      setProgressError('Quiz could not be submitted. Please try again.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const completeActiveLesson = async () => {
    if (!activeLesson) {
      return;
    }

    const key = String(activeLesson.id);
    if (completedLessons.has(key)) {
      return;
    }

    if (isAuthenticated() && !Number.isNaN(Number(activeLesson.id))) {
      setIsSavingProgress(true);
      setProgressError('');
      try {
        const { response, payload } = await apiFetch(`courses/lessons/${activeLesson.id}/complete/`, {
          method: 'POST',
          auth: true,
        });
        if (!response.ok) {
          throw new Error(payload?.message || 'Could not save progress.');
        }
        applyProgressPayload(payload);
        await refreshGamification();
      } catch {
        setProgressError('Progress could not be saved. Please try again.');
      } finally {
        setIsSavingProgress(false);
      }
      return;
    }

    setCompletedLessons((current) => {
      const next = new Set(current);
      next.add(key);
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
          <p className="mt-2 text-xs text-white/42">
            {completedPercent}% complete{isAuthenticated() ? '' : ' in this session'}
          </p>

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
                  <div className="mt-6 space-y-5">
                    {(activeLesson.quiz.questions || []).map((question, questionIndex) => (
                      <div key={question.id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">
                          Question {questionIndex + 1}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold">{question.prompt}</h4>
                        <div className="mt-4 grid gap-2">
                          {(question.options || []).map((option) => {
                            const selected = (quizAnswers[String(question.id)] || []).includes(String(option.id));
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => updateQuizAnswer(question, option.id)}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                                  selected
                                    ? 'border-emerald-300 bg-emerald-300/15 text-white'
                                    : 'border-white/10 bg-white/[0.03] text-white/65 hover:border-white/25'
                                }`}
                              >
                                {option.text}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {quizResult ? (
                    <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm ${
                      quizResult.passed
                        ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-50'
                        : 'border-red-300/25 bg-red-400/10 text-red-50'
                    }`}>
                      {quizResult.passed ? 'Passed' : 'Try again'} with {quizResult.score}%.
                      {quizResult.xpAwarded ? ` +${quizResult.xpAwarded} XP awarded.` : ''}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={submitActiveQuiz}
                    disabled={isSubmittingQuiz || (activeLesson.quiz.questions || []).length === 0}
                    className="mt-5 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/45"
                  >
                    {isSubmittingQuiz ? 'Submitting...' : 'Submit quiz'}
                  </button>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="border-l border-white/10 bg-black/25 px-4 py-6 lg:sticky lg:top-24 lg:h-[calc(100vh-96px)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Session</p>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5">
            <p className="text-sm text-white/48">Available XP</p>
            <motion.p
              key={earnedXp}
              initial={{ scale: 0.94, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.22 }}
              className="mt-2 text-4xl font-semibold"
            >
              {totalXp}
            </motion.p>
            <p className="mt-1 text-sm text-emerald-200">{earnedXp} XP earned</p>
            <p className="mt-3 text-sm leading-6 text-white/48">
              Lesson progress is saved to your account when you are signed in.
            </p>
          </div>
          {gamification ? (
            <div className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.07] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/80">Level</p>
                  <p className="mt-2 text-3xl font-semibold">{gamification.level}</p>
                </div>
                <Trophy className="h-8 w-8 text-emerald-300" />
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/35">
                <div className="h-full rounded-full bg-emerald-300" style={{ width: `${gamification.levelProgressPercent}%` }} />
              </div>
              <p className="mt-2 text-xs text-emerald-50/70">
                {gamification.xpIntoLevel}/{gamification.xpForNextLevel} XP toward next level
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <Flame className="h-4 w-4 text-emerald-300" />
                  <p className="mt-2 text-xl font-semibold">{gamification.streak.current}</p>
                  <p className="text-xs text-white/45">day streak</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <Medal className="h-4 w-4 text-emerald-300" />
                  <p className="mt-2 text-xl font-semibold">{gamification.badges.length}</p>
                  <p className="text-xs text-white/45">badges</p>
                </div>
              </div>
              {gamification.badges.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {gamification.badges.slice(0, 3).map((badge) => (
                    <span key={badge.id} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/72">
                      {badge.name}
                    </span>
                  ))}
                </div>
              ) : null}
              {gamification.leaderboard.length > 0 ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">Leaderboard</p>
                  <div className="mt-3 space-y-2">
                    {gamification.leaderboard.slice(0, 3).map((row) => (
                      <div key={row.userId} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-white/72">#{row.rank} {row.name}</span>
                        <span className="font-semibold text-emerald-200">{row.totalXp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
          {progressError ? (
            <p className="mt-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {progressError}
            </p>
          ) : null}
          <button
            type="button"
            onClick={completeActiveLesson}
            disabled={completedLessons.has(String(activeLesson.id)) || isSavingProgress}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-4 text-sm font-bold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/45"
          >
            <CheckCircle2 size={18} />
            {completedLessons.has(String(activeLesson.id))
              ? 'Completed'
              : isSavingProgress
                ? 'Saving...'
                : 'Mark complete'}
          </button>
        </aside>
      </main>
    </div>
  );
};

export default LearningExperiencePage;
