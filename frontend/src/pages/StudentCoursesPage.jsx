import { motion } from 'framer-motion';
import { ArrowRight, Clock3, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  MetricTile,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { formatDate, formatPercent } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const StudentCoursesPage = () => {
  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/courses/',
    {
      overview: {},
      courses: [],
      pending_enrollments: [],
    },
    'Unable to load your courses.',
  );

  if (isLoading) {
    return <WorkspaceLoading label="Loading your courses..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel
        eyebrow="Courses"
        title="Courses"
        description="Progress, sessions, access."
        action={
          <Link
            to="/dashboard/join-course"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Join Course
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <MetricTile label="Active Courses" value={data.overview.active_courses || 0} hint="Verified enrollments" />
          <MetricTile label="Pending Requests" value={data.overview.pending_enrollments || 0} hint="Still waiting for approval" />
          <MetricTile label="Attendance Rate" value={formatPercent(data.overview.attendance_rate)} hint="Across tracked sessions" tone="accent" />
        </div>
      </WorkspacePanel>

      <WorkspacePanel eyebrow="Verified" title="Active Courses">
        {data.courses.length ? (
          <div className="space-y-4">
            {data.courses.map((course) => (
              <div key={course.id} className="rounded-[1.15rem] border border-[#e5ebf5] bg-[#fbfcfe] p-4 md:p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={course.level} tone="info" />
                      <StatusBadge value={course.language} />
                      <StatusBadge value={course.category} />
                    </div>
                    <h3 className="mt-3 text-[1.4rem] font-semibold tracking-tight text-[#22324d]">{course.title}</h3>
                    {course.short_description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7e8ba3]">{course.short_description}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#7e8ba3]">
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.schedule_label}</span>
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">Starts {formatDate(course.start_date)}</span>
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.duration_weeks} weeks</span>
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.total_hours} hours</span>
                    </div>
                    <p className="mt-4 text-sm text-[#7e8ba3]">Mentor: {course.mentor_name}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Attendance</p>
                      <p className="mt-2 text-xl font-semibold text-[#22324d]">{formatPercent(course.attendance_rate)}</p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">
                        {course.attendance_summary.present}/{course.attendance_summary.tracked} tracked sessions
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Assignments</p>
                      <p className="mt-2 text-xl font-semibold text-[#22324d]">{course.assignment_summary.total}</p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">{course.assignment_summary.pending} pending</p>
                    </div>
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4 sm:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Next live session</p>
                      <p className="mt-2 text-base font-medium text-[#22324d]">
                        {course.next_session?.title || 'No upcoming session scheduled'}
                      </p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">
                        {course.next_session ? formatDate(course.next_session.date) : 'Your next class will appear here once it is scheduled.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to={`/courses/${course.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7f2] bg-white px-4 py-2.5 text-sm font-medium text-[#3c4f6c] transition hover:bg-[#f8fafc]"
                  >
                    Open Course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {course.latest_recording?.video_url ? (
                    <Link
                      to={`/dashboard/recordings/${course.latest_recording.id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Latest Recording
                      <PlayCircle className="h-4 w-4" />
                    </Link>
                  ) : null}
                  {course.next_assignment ? (
                    <Link
                      to="/dashboard/assignments"
                      className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7f2] bg-white px-4 py-2.5 text-sm font-medium text-[#3c4f6c] transition hover:bg-[#f8fafc]"
                    >
                      Next Deadline
                      <Clock3 className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyWorkspaceState
            title="No verified courses yet"
            description="Verified courses appear here."
            action={
              <Link
                to="/dashboard/join-course"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                Join a Course
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        )}
      </WorkspacePanel>

      <WorkspacePanel eyebrow="Pending" title="Enrollment Requests">
        {data.pending_enrollments.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.pending_enrollments.map((enrollment) => (
              <div key={enrollment.id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[#22324d]">{enrollment.course_title}</p>
                    <p className="mt-1 text-sm text-[#7e8ba3]">Requested {formatDate(enrollment.requested_at)}</p>
                  </div>
                  <StatusBadge value={enrollment.status_label} tone="warning" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyWorkspaceState title="No pending enrollments" description="Payment reviews appear here." />
        )}
      </WorkspacePanel>
    </motion.div>
  );
};

export default StudentCoursesPage;
