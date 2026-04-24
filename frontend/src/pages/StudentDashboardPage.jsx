import { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Download,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import { apiFetch } from '../lib/api';
import { clearAuthSession, getStoredUser } from '../lib/auth';
import { extractApiError } from '../lib/errors';

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) {
    return 'To be announced';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'To be announced';
  }

  return new Intl.DateTimeFormat('en-US', options).format(parsed);
};

const formatTime = (value) => {
  if (!value) {
    return 'Time to be announced';
  }

  const [hours = '00', minutes = '00'] = String(value).split(':');
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
};

const OverviewStat = ({ label, value, hint }) => (
  <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-4">
    <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</p>
    <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{value}</p>
    <p className="mt-1 text-sm text-white/55">{hint}</p>
  </div>
);

const SectionCard = ({ title, eyebrow, action, children }) => (
  <section className="rounded-[1.75rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,16,20,0.95),rgba(5,5,7,0.98))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow ? <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
      </div>
      {action}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const SpotlightItem = ({ icon: Icon, title, value, description, linkTo, href, external = false }) => {
  const content = (
    <div className="group rounded-2xl border border-white/12 bg-white/[0.03] p-4 transition hover:border-emerald-400/35 hover:bg-emerald-500/[0.06]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10">
          <Icon className="h-5 w-5 text-emerald-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white/55">{title}</p>
          <p className="mt-1 text-lg font-medium text-white">{value}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/60">{description}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-emerald-300" />
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}>
        {content}
      </a>
    );
  }

  return content;
};

const EmptyState = ({ title, description, actionLabel, actionTo }) => (
  <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-6 text-center">
    <p className="text-lg font-medium text-white">{title}</p>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">{description}</p>
    {actionLabel && actionTo ? (
      <Link
        to={actionTo}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
      >
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    ) : null}
  </div>
);

const CourseSnapshot = ({ course }) => (
  <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-4 md:p-5">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex items-start gap-4 lg:min-w-[360px]">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.22),rgba(255,255,255,0.02))] text-2xl font-semibold text-emerald-200">
            {course.title?.slice(0, 1) || 'C'}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
              {course.level}
            </span>
            <span className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
              {course.language}
            </span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{course.title}</h3>
          <p className="mt-1 text-sm text-white/55">Mentor: {course.mentor_name}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/65">
            <span className="rounded-full border border-white/12 bg-white/[0.02] px-3 py-1.5">
              {course.schedule_label}
            </span>
            <span className="rounded-full border border-white/12 bg-white/[0.02] px-3 py-1.5">
              Starts {formatDate(course.start_date)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Attendance</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {course.attendance_rate !== null ? `${course.attendance_rate}%` : 'Not tracked'}
          </p>
          <p className="mt-1 text-sm text-white/55">
            {course.attendance_summary.present}/{course.attendance_summary.tracked} sessions marked present
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Assignments</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {course.assignment_summary.submitted}/{course.assignment_summary.total}
          </p>
          <p className="mt-1 text-sm text-white/55">{course.assignment_summary.pending} still coming up</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/50">Certificates</p>
          <p className="mt-2 text-xl font-semibold text-white">{course.certificate_count}</p>
          <p className="mt-1 text-sm text-white/55">
            {course.has_reviewed ? 'Review submitted for this course' : 'Review still pending'}
          </p>
        </div>
      </div>
    </div>

    <div className="mt-5 grid gap-3 xl:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-sm text-white/55">Next live session</p>
        <p className="mt-2 text-base font-medium text-white">
          {course.next_session ? course.next_session.title : 'No upcoming session scheduled'}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {course.next_session
            ? `${formatDate(course.next_session.date)} • ${formatTime(course.next_session.start_time)}`
            : 'We will show the next class here once it is scheduled.'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-sm text-white/55">Next assignment</p>
        <p className="mt-2 text-base font-medium text-white">
          {course.next_assignment ? course.next_assignment.title : 'No pending assignment right now'}
        </p>
        <p className="mt-2 text-sm text-white/60">
          {course.next_assignment
            ? `Due ${formatDate(course.next_assignment.due_at)}`
            : 'You are caught up on scheduled assignment work.'}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-sm text-white/55">Latest recording</p>
        <p className="mt-2 text-base font-medium text-white">
          {course.latest_recording ? course.latest_recording.title : 'No recording uploaded yet'}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to={`/courses/${course.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-white/85 transition hover:bg-white/10"
          >
            Open Course
            <ArrowRight className="h-4 w-4" />
          </Link>
          {course.latest_recording ? (
            <a
              href={course.latest_recording.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20"
            >
              Watch Recording
              <PlayCircle className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  </div>
);

const StudentDashboardPage = () => {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Student Dashboard | Design School';
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { response, payload } = await apiFetch('students/dashboard/', {
          auth: true,
        });

        if (response.status === 401 || response.status === 403) {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }

        if (!response.ok || !payload?.data) {
          throw new Error(extractApiError(payload, 'Unable to load your dashboard.'));
        }

        if (!isCancelled) {
          setDashboard(payload.data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Unable to load your dashboard.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const student = dashboard?.student || {};
  const overview = dashboard?.overview || {};
  const spotlight = dashboard?.spotlight || {};
  const courses = dashboard?.courses || [];
  const upcomingAssignments = dashboard?.upcoming_assignments || [];
  const recentRecordings = dashboard?.recent_recordings || [];
  const certificates = dashboard?.certificates || [];
  const pendingEnrollments = dashboard?.pending_enrollments || [];
  const displayName = student.name || storedUser?.first_name || storedUser?.email || 'Student';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative overflow-x-hidden px-4 pb-20 pt-28 md:px-8 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_36%),radial-gradient(circle_at_80%_16%,rgba(255,255,255,0.06),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:160px_160px] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(16,16,20,0.96),rgba(5,5,7,0.98))] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <span className="inline-flex items-center gap-2 rounded-sm border border-emerald-500/35 bg-emerald-700/20 px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-emerald-300 md:text-xs">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Student Dashboard
                  </span>
                  <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.06] tracking-tight md:text-[4rem]">
                    Welcome back, {displayName}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 md:text-lg">
                    Everything important for your week lives here: active courses, live sessions, pending work, recordings, and certificate progress.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08]"
                  >
                    Browse Courses
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/request-callback"
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                  >
                    Need Help?
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {!student.is_phone_verified && !isLoading ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-5 w-5 text-amber-200" />
                    <div>
                      <p className="font-medium text-amber-100">Phone verification still pending</p>
                      <p className="mt-1 text-sm text-amber-100/70">
                        Verify your phone to complete your onboarding and keep your account secure.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/verify-phone"
                    state={{ email: student.email }}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
                  >
                    Verify Now
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}

              <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <OverviewStat
                  label="Active Courses"
                  value={isLoading ? '...' : overview.active_courses ?? 0}
                  hint="Courses currently unlocked for you"
                />
                <OverviewStat
                  label="Upcoming Work"
                  value={isLoading ? '...' : overview.upcoming_assignments ?? 0}
                  hint="Assignments that still need attention"
                />
                <OverviewStat
                  label="Attendance"
                  value={isLoading ? '...' : overview.attendance_rate !== null && overview.attendance_rate !== undefined ? `${overview.attendance_rate}%` : 'N/A'}
                  hint="Tracked attendance across active courses"
                />
                <OverviewStat
                  label="Certificates"
                  value={isLoading ? '...' : overview.certificates_earned ?? 0}
                  hint="Issued certificates available in your account"
                />
              </div>
            </div>

            <SectionCard title="Profile & Next Up" eyebrow="Today">
              <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 bg-black/30">
                    <UserRound className="h-6 w-6 text-white/80" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">{displayName}</p>
                    <p className="mt-1 text-sm text-white/55">{student.email || storedUser?.email || 'Email unavailable'}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-white/68">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                    <span>Student ID</span>
                    <span className="text-white">{student.student_id || 'Pending assignment'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                    <span>Phone status</span>
                    <span className={student.is_phone_verified ? 'text-emerald-300' : 'text-amber-200'}>
                      {student.is_phone_verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 px-3 py-2.5">
                    <span>Joined</span>
                    <span className="text-white">{formatDate(student.joined_on)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <SpotlightItem
                  icon={CalendarDays}
                  title="Next live session"
                  value={spotlight.next_session ? spotlight.next_session.title : 'No live session queued'}
                  description={
                    spotlight.next_session
                      ? `${formatDate(spotlight.next_session.date)} • ${formatTime(spotlight.next_session.start_time)}`
                      : 'Upcoming scheduled classes will appear here.'
                  }
                  linkTo={spotlight.next_session ? `/courses/${spotlight.next_session.course_slug}` : '/courses'}
                />
                <SpotlightItem
                  icon={ListTodo}
                  title="Next assignment"
                  value={spotlight.next_assignment ? spotlight.next_assignment.title : 'Nothing due right now'}
                  description={
                    spotlight.next_assignment
                      ? `Due ${formatDate(spotlight.next_assignment.due_at)} in ${spotlight.next_assignment.course_title}`
                      : 'You are currently clear on scheduled assignment work.'
                  }
                  linkTo={spotlight.next_assignment ? `/courses/${spotlight.next_assignment.course_slug}` : '/dashboard'}
                />
                <SpotlightItem
                  icon={Video}
                  title="Latest recording"
                  value={spotlight.latest_recording ? spotlight.latest_recording.title : 'No recording uploaded yet'}
                  description={
                    spotlight.latest_recording
                      ? `${spotlight.latest_recording.course_title} • uploaded ${formatDate(spotlight.latest_recording.uploaded_at)}`
                      : 'Recent class recordings will show up here once mentors publish them.'
                  }
                  href={spotlight.latest_recording?.video_url}
                  external
                />
              </div>
            </SectionCard>
          </section>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
            <div className="space-y-6">
              <SectionCard
                title="Active Learning"
                eyebrow="Courses"
                action={
                  <Link to="/courses" className="text-sm text-white/65 transition hover:text-white">
                    View catalog
                  </Link>
                }
              >
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`course-skeleton-${index}`}
                        className="h-40 animate-pulse rounded-[1.5rem] border border-white/10 bg-white/[0.03]"
                      />
                    ))}
                  </div>
                ) : courses.length ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <CourseSnapshot key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No active courses yet"
                    description="Once your enrollment is verified, your live classes, assignments, and recordings will appear here automatically."
                    actionLabel="Explore Courses"
                    actionTo="/courses"
                  />
                )}
              </SectionCard>

              <SectionCard title="Recent Recordings" eyebrow="Replay Center">
                {recentRecordings.length ? (
                  <div className="space-y-3">
                    {recentRecordings.map((recording) => (
                      <a
                        key={recording.id}
                        href={recording.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-emerald-400/35 hover:bg-emerald-500/[0.06]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10">
                            <PlayCircle className="h-5 w-5 text-emerald-300" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-medium text-white">{recording.title}</p>
                            <p className="mt-1 text-sm text-white/55">
                              {recording.course_title} • {formatDate(recording.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35 transition group-hover:text-emerald-300" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recordings yet"
                    description="As soon as your mentors publish class replays, they will appear here for quick access."
                  />
                )}
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="Upcoming Deadlines" eyebrow="Action Center">
                {upcomingAssignments.length ? (
                  <div className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <Link
                        key={assignment.id}
                        to={`/courses/${assignment.course_slug}`}
                        className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/35 hover:bg-emerald-500/[0.06]"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                            <Clock3 className="h-5 w-5 text-amber-200" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-base font-medium text-white">{assignment.title}</p>
                            <p className="mt-1 text-sm text-white/55">{assignment.course_title}</p>
                            <p className="mt-2 text-sm text-amber-200">Due {formatDate(assignment.due_at)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Nothing urgent"
                    description="You do not have any upcoming assignment deadlines at the moment."
                  />
                )}
              </SectionCard>

              <SectionCard title="Certificates" eyebrow="Proof of Work">
                {certificates.length ? (
                  <div className="space-y-3">
                    {certificates.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-medium text-white">{certificate.title}</p>
                            <p className="mt-1 text-sm text-white/55">{certificate.course_title}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] ${
                            certificate.status === 'issued'
                              ? 'border border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                              : 'border border-white/12 bg-white/[0.03] text-white/60'
                          }`}>
                            {certificate.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/60">
                          <span>Issued {formatDate(certificate.issued_on)}</span>
                          <span className="h-1 w-1 rounded-full bg-white/20" />
                          <span>{certificate.unique_id}</span>
                        </div>
                        {certificate.download_link ? (
                          <a
                            href={certificate.download_link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/20"
                          >
                            <Download className="h-4 w-4" />
                            Download Certificate
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="Certificates will appear here"
                    description="Once you complete a course and a certificate is issued, you’ll be able to track and download it from this panel."
                  />
                )}
              </SectionCard>

              <SectionCard title="Enrollment Requests" eyebrow="Status">
                {pendingEnrollments.length ? (
                  <div className="space-y-3">
                    {pendingEnrollments.map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                            <GraduationCap className="h-5 w-5 text-white/75" />
                          </div>
                          <div>
                            <p className="text-base font-medium text-white">{enrollment.course_title}</p>
                            <p className="mt-1 text-sm text-white/55">Requested {formatDate(enrollment.requested_at)}</p>
                            <p className="mt-2 inline-flex items-center gap-2 text-sm text-amber-200">
                              <CheckCircle2 className="h-4 w-4" />
                              Awaiting verification
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No pending enrollments"
                    description="Any fresh enrollment request you submit will show up here until the admin verifies it."
                    actionLabel="Explore Courses"
                    actionTo="/courses"
                  />
                )}
              </SectionCard>
            </div>
          </div>

          {error && !isLoading ? (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
              {error}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboardPage;
