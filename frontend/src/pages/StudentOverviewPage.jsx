import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  Download,
  ListTodo,
  PlayCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  HorizontalMeter,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import {
  cx,
  formatCompactNumber,
  formatDate,
  formatPercent,
  formatTime,
} from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const accentPalette = ['bg-emerald-400', 'bg-sky-400', 'bg-violet-400', 'bg-indigo-400', 'bg-teal-400', 'bg-pink-400'];

const CompactPanel = ({ title, action, className = '', children }) => (
  <section className={cx('rounded-2xl border border-[#e5ebf5] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]', className)}>
    <div className="flex items-center justify-between gap-3 border-b border-[#edf2f8] px-4 py-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#60748f]">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
    <div className="p-4">{children}</div>
  </section>
);

const CompactMetric = ({ icon: Icon, label, value, hint, tone = 'default', to }) => {
  const content = (
    <div
      className={cx(
        'group flex min-h-[92px] items-center gap-3 rounded-2xl border px-4 py-3 transition',
        tone === 'accent'
          ? 'border-emerald-200 bg-emerald-50/90 hover:bg-emerald-50'
          : 'border-[#e3ebf5] bg-white hover:border-[#ccd9ea] hover:bg-[#fbfcfe]',
      )}
    >
      <div
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          tone === 'accent' ? 'bg-white text-emerald-600' : 'bg-[#f1f5f9] text-[#667a96]',
        )}
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0bb]">{label}</p>
        <p className="mt-1 text-2xl font-semibold leading-none tracking-tight text-[#22324d]">{value}</p>
        {hint ? <p className="mt-1 truncate text-xs text-[#7e8ba3]">{hint}</p> : null}
      </div>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
};

const RowAction = ({ to, children }) => (
  <Link to={to} className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 transition hover:text-emerald-800">
    {children}
    <ArrowRight className="h-3.5 w-3.5" />
  </Link>
);

const StudentOverviewPage = () => {
  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/overview/',
    {
      student: {},
      overview: {},
      spotlight: {},
      courses: [],
      upcoming_assignments: [],
      recent_recordings: [],
      certificates: [],
      pending_enrollments: [],
    },
    'Unable to load your workspace overview.',
  );

  if (isLoading) {
    return <WorkspaceLoading label="Loading student dashboard..." />;
  }

  const courses = data.courses || [];
  const nextSession = data.spotlight.next_session;
  const nextAssignment = data.spotlight.next_assignment;
  const primaryAction = nextAssignment
    ? {
        label: 'Open assignments',
        to: '/dashboard/assignments',
        title: nextAssignment.title,
        meta: `Due ${formatDate(nextAssignment.due_at)}`,
      }
    : nextSession
      ? {
          label: 'View courses',
          to: '/dashboard/courses',
          title: nextSession.title,
          meta: `${formatDate(nextSession.date)} / ${formatTime(nextSession.start_time)}`,
        }
      : {
          label: 'Join course',
          to: '/dashboard/join-course',
          title: 'No upcoming action',
          meta: 'Choose a course to begin',
        };

  const categoryMap = new Map();
  courses.forEach((course) => {
    const current = categoryMap.get(course.category) || { name: course.category, value: 0 };
    current.value += 1;
    categoryMap.set(course.category, current);
  });
  const learningMix = Array.from(categoryMap.values()).sort((left, right) => right.value - left.value);
  const learningMixTotal = learningMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-5">
      {error ? <WorkspaceError message={error} /> : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#22324d]">Dashboard</h1>
          <p className="mt-1 text-sm text-[#7e8ba3]">{data.student.name || 'Student'}</p>
        </div>
        <Link
          to={primaryAction.to}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          {primaryAction.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CompactMetric
          icon={BookOpen}
          label="Courses"
          value={formatCompactNumber(data.overview.active_courses || 0)}
          hint="Verified"
          to="/dashboard/courses"
          tone="accent"
        />
        <CompactMetric
          icon={ListTodo}
          label="Due Work"
          value={formatCompactNumber(data.overview.upcoming_assignments || 0)}
          hint="Needs action"
          to="/dashboard/assignments"
        />
        <CompactMetric
          icon={CalendarClock}
          label="Attendance"
          value={formatPercent(data.overview.attendance_rate)}
          hint="Tracked"
          to="/dashboard/attendance"
        />
        <CompactMetric
          icon={Award}
          label="Certificates"
          value={formatCompactNumber(data.overview.certificates_earned || 0)}
          hint="Issued"
          to="/dashboard/certificates"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <CompactPanel title="Next Action">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Priority</p>
                <p className="mt-2 truncate text-lg font-semibold text-[#22324d]">{primaryAction.title}</p>
                <p className="mt-1 text-sm text-[#65758f]">{primaryAction.meta}</p>
              </div>
              <Link
                to={primaryAction.to}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 transition hover:bg-emerald-100"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-3">
              <p className="text-xs text-[#7e8ba3]">Next session</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#22324d]">{nextSession?.title || 'Not scheduled'}</p>
              <p className="mt-1 text-xs text-[#8fa0bb]">
                {nextSession ? `${formatDate(nextSession.date)} / ${formatTime(nextSession.start_time)}` : 'Check courses later'}
              </p>
            </div>
            <div className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-3">
              <p className="text-xs text-[#7e8ba3]">Next deadline</p>
              <p className="mt-1 truncate text-sm font-semibold text-[#22324d]">{nextAssignment?.title || 'Clear'}</p>
              <p className="mt-1 text-xs text-[#8fa0bb]">{nextAssignment ? formatDate(nextAssignment.due_at) : 'No urgent work'}</p>
            </div>
          </div>
        </CompactPanel>

        <CompactPanel title="Active Courses" action={<RowAction to="/dashboard/courses">All</RowAction>}>
          {courses.length ? (
            <div className="divide-y divide-[#edf2f8]">
              {courses.map((course, index) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}`}
                  className={cx('grid gap-3 py-3 transition hover:bg-[#fbfcfe] sm:grid-cols-[auto_minmax(0,1fr)_auto]', index === 0 ? 'pt-0' : '')}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-xs font-semibold text-emerald-700">
                    {course.title.split(' ').slice(0, 2).map((part) => part[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#22324d]">{course.title}</p>
                    <p className="mt-1 truncate text-xs text-[#7e8ba3]">{course.schedule_label}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <StatusBadge value={formatPercent(course.attendance_rate)} tone="info" />
                    <span className="text-xs text-[#8fa0bb]">{course.assignment_summary.pending} due</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="No active courses" description="Verified courses appear here." />
          )}
        </CompactPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <CompactPanel title="Deadlines" action={<RowAction to="/dashboard/assignments">All</RowAction>}>
          {data.upcoming_assignments.length ? (
            <div className="divide-y divide-[#edf2f8]">
              {data.upcoming_assignments.slice(0, 4).map((assignment, index) => (
                <Link key={assignment.id} to="/dashboard/assignments" className={cx('block py-3', index === 0 ? 'pt-0' : '')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#22324d]">{assignment.title}</p>
                      <p className="mt-1 truncate text-xs text-[#7e8ba3]">{assignment.course_title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold text-[#22324d]">{formatDate(assignment.due_at)}</p>
                      <p className="mt-1 text-xs text-[#8fa0bb]">{assignment.status_label}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="Nothing urgent" description="Deadlines appear here." />
          )}
        </CompactPanel>

        <CompactPanel title="Recordings" action={<RowAction to="/dashboard/recordings">All</RowAction>}>
          {data.recent_recordings.length ? (
            <div className="divide-y divide-[#edf2f8]">
              {data.recent_recordings.slice(0, 4).map((recording, index) => (
                <Link key={recording.id} to={`/dashboard/recordings/${recording.id}`} className={cx('block py-3', index === 0 ? 'pt-0' : '')}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#effcf4] text-emerald-600">
                      <PlayCircle className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#22324d]">{recording.title}</p>
                      <p className="mt-1 truncate text-xs text-[#7e8ba3]">{recording.course_title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="No recordings" description="Replays appear here." />
          )}
        </CompactPanel>

        <CompactPanel title="Learning Mix">
          {learningMix.length ? (
            <div className="space-y-3">
              {learningMix.map((item, index) => (
                <HorizontalMeter
                  key={item.name}
                  label={item.name || 'General'}
                  value={item.value}
                  total={learningMixTotal}
                  colorClass={accentPalette[index % accentPalette.length]}
                />
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="No categories" description="Join courses to build your mix." />
          )}
        </CompactPanel>
      </section>

      <CompactPanel title="Certificates" action={<RowAction to="/dashboard/certificates">All</RowAction>}>
        {data.certificates.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.certificates.slice(0, 4).map((certificate) => (
              <div key={certificate.id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#22324d]">{certificate.title}</p>
                    <p className="mt-1 truncate text-xs text-[#7e8ba3]">{certificate.course_title}</p>
                  </div>
                  <StatusBadge value={certificate.status_label} tone={certificate.status === 'issued' ? 'success' : 'neutral'} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#8fa0bb]">Issued {formatDate(certificate.issued_on)}</p>
                  {certificate.download_link ? (
                    <a
                      href={certificate.download_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyWorkspaceState title="No certificates" description="Issued certificates appear here." />
        )}
      </CompactPanel>
    </motion.div>
  );
};

export default StudentOverviewPage;
