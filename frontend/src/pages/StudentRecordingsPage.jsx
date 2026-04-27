import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, ListVideo, PlayCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  WorkspaceError,
  WorkspaceLoading,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { cx, formatDate } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const groupRecordingsByCourse = (recordings) => Array.from(
  recordings.reduce((groups, recording) => {
    const key = recording.course_id || recording.course_title || recording.id;

    if (!groups.has(key)) {
      groups.set(key, {
        course_id: key,
        course_title: recording.course_title || 'Course',
        course_slug: recording.course_slug,
        latest_uploaded_at: recording.uploaded_at,
        items: [],
      });
    }

    groups.get(key).items.push(recording);
    return groups;
  }, new Map()).values(),
);

const RecordingRow = ({ recording }) => (
  <Link
    to={`/dashboard/recordings/${recording.id}`}
    className="group grid gap-3 rounded-2xl border border-[#e5ebf5] bg-white p-3 transition hover:border-emerald-200 hover:bg-emerald-50/60 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center"
  >
    <div className="relative aspect-video overflow-hidden rounded-xl border border-[#e8eef6] bg-[#eef4fb]">
      {recording.thumbnail_url ? (
        <img src={recording.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#7890ad]">
          <Video className="h-5 w-5" />
        </div>
      )}
      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#28466d] shadow-sm">
        {recording.video_provider || 'Video'}
      </span>
    </div>

    <div className="min-w-0">
      <p className="truncate text-base font-semibold tracking-tight text-[#071a3a]">{recording.title}</p>
      <p className="mt-1 text-sm text-[#7284a1]">Uploaded {formatDate(recording.uploaded_at)}</p>
    </div>

    <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white transition group-hover:bg-emerald-600">
      Watch
      <ArrowRight className="h-4 w-4" />
    </span>
  </Link>
);

const CourseRecordingGroup = ({ group, isOpen, onToggle }) => {
  const lessonLabel = group.items.length === 1 ? '1 recording' : `${group.items.length} recordings`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dfe7f2] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
      <div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <button type="button" onClick={onToggle} className="min-w-0 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa0bb]">Course</p>
          <h2 className="mt-2 truncate text-lg font-semibold tracking-tight text-[#071a3a]">{group.course_title}</h2>
          <p className="mt-1 text-sm text-[#7284a1]">
            {lessonLabel}
            {group.latest_uploaded_at ? ` / Latest ${formatDate(group.latest_uploaded_at)}` : ''}
          </p>
        </button>

        <div className="flex items-center gap-2">
          {group.course_slug ? (
            <Link
              to={`/courses/${group.course_slug}`}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#dce5f0] bg-white px-4 text-sm font-semibold text-[#53657f] transition hover:bg-[#f8fafc]"
            >
              Course
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dce5f0] bg-white text-[#53657f] transition hover:bg-[#f8fafc]"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${group.course_title} recordings`}
          >
            <ChevronDown className={cx('h-4 w-4 transition', isOpen ? 'rotate-180' : '')} />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-[#e8eef6] bg-[#f8fbff] p-3">
          <div className="space-y-2">
            {group.items.map((recording) => (
              <RecordingRow key={recording.id} recording={recording} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const StudentRecordingsPage = () => {
  const [expandedCourses, setExpandedCourses] = useState({});
  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/recordings/',
    {
      summary: {},
      recordings: [],
    },
    'Unable to load your recordings.',
  );

  if (isLoading) {
    return <WorkspaceLoading label="Loading recordings..." />;
  }

  const recordings = data.recordings || [];
  const latestRecording = recordings[0];
  const courseGroups = groupRecordingsByCourse(recordings);

  const toggleCourse = (courseId, isOpen) => {
    setExpandedCourses((current) => ({
      ...current,
      [courseId]: !isOpen,
    }));
  };

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-5">
      {error ? <WorkspaceError message={error} /> : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fa0bb]">Replay Center</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#071a3a]">Class Recordings</h1>
          <p className="mt-2 text-sm text-[#7284a1]">
            {courseGroups.length} courses / {recordings.length} recordings
          </p>
        </div>
        {latestRecording ? (
          <Link
            to={`/dashboard/recordings/${latestRecording.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </section>

      <section className="rounded-2xl border border-[#dfe7f2] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eef6] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ListVideo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8fa0bb]">Course Library</p>
              <p className="mt-1 text-sm text-[#7284a1]">Open a course to view its recordings.</p>
            </div>
          </div>
          <span className="text-sm font-medium text-[#8fa0bb]">{recordings.length} lessons</span>
        </div>

        {recordings.length ? (
          <div className="mt-4 space-y-3">
            {courseGroups.map((group, index) => {
              const isOpen = expandedCourses[group.course_id] ?? index === 0;
              return (
                <CourseRecordingGroup
                  key={group.course_id}
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => toggleCourse(group.course_id, isOpen)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyWorkspaceState
            title="No recordings available"
            description="Replays appear after upload."
            action={
              <div className="inline-flex items-center gap-2 rounded-xl border border-[#e5ebf5] bg-white px-4 py-2.5 text-sm text-[#5e6f89]">
                <Video className="h-4 w-4" />
                Check after class
              </div>
            }
          />
        )}
      </section>
    </motion.div>
  );
};

export default StudentRecordingsPage;
