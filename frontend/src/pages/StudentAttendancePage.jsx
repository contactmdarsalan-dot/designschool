import { motion } from 'framer-motion';

import {
  EmptyWorkspaceState,
  MetricTile,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { formatDate, formatPercent, formatTime } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const attendanceTone = (status) => {
  if (status === 'present') {
    return 'success';
  }
  if (status === 'late') {
    return 'warning';
  }
  if (status === 'absent') {
    return 'danger';
  }
  if (status === 'excused') {
    return 'info';
  }
  return 'neutral';
};

const StudentAttendancePage = () => {
  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/attendance/',
    {
      summary: {},
      courses: [],
      sessions: [],
    },
    'Unable to load your attendance history.',
  );

  if (isLoading) {
    return <WorkspaceLoading label="Loading attendance..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel eyebrow="Attendance" title="Attendance Tracker" description="Presence by session.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Attendance Rate" value={formatPercent(data.summary.attendance_rate)} hint="Across tracked sessions" tone="accent" />
          <MetricTile label="Present" value={data.summary.present || 0} hint="Sessions marked present" />
          <MetricTile label="Late" value={data.summary.late || 0} hint="Late entries recorded" />
          <MetricTile label="Absent" value={data.summary.absent || 0} hint="Missed sessions" />
          <MetricTile label="Tracked" value={data.summary.tracked || 0} hint={`${data.summary.total || 0} total sessions`} />
        </div>
      </WorkspacePanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <WorkspacePanel eyebrow="By Course" title="Course Breakdown">
          {data.courses.length ? (
            <div className="space-y-3">
              {data.courses.map((course) => (
                <div key={course.course_id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-medium text-[#22324d]">{course.course_title}</p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">Mentor: {course.mentor_name}</p>
                    </div>
                    <StatusBadge value={formatPercent(course.attendance_rate)} tone="info" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e5ebf5] bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Tracked Sessions</p>
                      <p className="mt-2 text-lg font-semibold text-[#22324d]">{course.tracked_sessions}</p>
                    </div>
                    <div className="rounded-xl border border-[#e5ebf5] bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Present Sessions</p>
                      <p className="mt-2 text-lg font-semibold text-[#22324d]">{course.present_sessions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="No course attendance yet" description="Records appear after class." />
          )}
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Session History" title="Attendance Log">
          {data.sessions.length ? (
            <div className="space-y-3">
              {data.sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge value={session.status_label} tone={attendanceTone(session.status)} />
                        <span className="rounded-full border border-[#e5ebf5] bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[#7e8ba3]">
                          {session.course_title}
                        </span>
                      </div>
                      <p className="mt-3 text-base font-medium text-[#22324d]">{session.title}</p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">
                        {formatDate(session.date)} - {formatTime(session.start_time)}
                      </p>
                    </div>
                    {session.description ? <p className="max-w-md text-sm leading-relaxed text-[#7e8ba3]">{session.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyWorkspaceState title="No attendance history yet" description="Session marks appear here." />
          )}
        </WorkspacePanel>
      </div>
    </motion.div>
  );
};

export default StudentAttendancePage;
