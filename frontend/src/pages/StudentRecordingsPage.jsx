import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarClock, PlayCircle, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { cx, formatDate } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const StatPill = ({ icon: Icon, label, value, tone = 'default' }) => (
  <div
    className={cx(
      'flex min-h-[76px] items-center gap-3 rounded-2xl border px-4 py-3',
      tone === 'accent' ? 'border-emerald-200 bg-emerald-50' : 'border-[#e3ebf5] bg-white',
    )}
  >
    <div className={cx('flex h-10 w-10 items-center justify-center rounded-xl', tone === 'accent' ? 'bg-white text-emerald-600' : 'bg-[#f1f5f9] text-[#667a96]')}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0bb]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#22324d]">{value}</p>
    </div>
  </div>
);

const StudentRecordingsPage = () => {
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
  const courseGroups = recordings.reduce((groups, recording) => {
    const key = recording.course_id;
    if (!groups.has(key)) {
      groups.set(key, {
        course_id: recording.course_id,
        course_title: recording.course_title,
        course_slug: recording.course_slug,
        items: [],
      });
    }
    groups.get(key).items.push(recording);
    return groups;
  }, new Map());

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-5">
      {error ? <WorkspaceError message={error} /> : null}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fa0bb]">Replay Center</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#22324d]">Class Recordings</h1>
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

      <section className="grid gap-3 md:grid-cols-3">
        <StatPill icon={Video} label="Recordings" value={data.summary.total || 0} tone="accent" />
        <StatPill icon={BookOpen} label="Courses" value={data.summary.course_count || 0} />
        <StatPill icon={CalendarClock} label="Latest" value={latestRecording ? formatDate(latestRecording.uploaded_at) : 'N/A'} />
      </section>

      {latestRecording ? (
        <section className="grid overflow-hidden rounded-2xl border border-[#dfe7f2] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:grid-cols-[minmax(0,1fr)_360px]">
          <Link to={`/dashboard/recordings/${latestRecording.id}`} className="group relative block aspect-video overflow-hidden bg-[#07111f]">
            {latestRecording.thumbnail_url ? (
              <img src={latestRecording.thumbnail_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/70">
                <Video className="h-10 w-10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-[0_12px_34px_rgba(0,0,0,0.25)]">
              <PlayCircle className="h-7 w-7" />
            </div>
          </Link>

          <div className="flex flex-col justify-between p-5">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={latestRecording.video_provider || 'Video'} tone={latestRecording.video_provider === 'youtube' ? 'success' : 'neutral'} />
                {latestRecording.is_unlisted ? <StatusBadge value="Unlisted" tone="info" /> : null}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#22324d]">{latestRecording.title}</h2>
              <p className="mt-2 text-sm text-[#7e8ba3]">{latestRecording.course_title}</p>
              <p className="mt-4 text-sm text-[#8fa0bb]">Uploaded {formatDate(latestRecording.uploaded_at)}</p>
            </div>
            <Link
              to={`/dashboard/recordings/${latestRecording.id}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Open Player
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[#e5ebf5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between gap-3 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#60748f]">Course Library</h2>
          <span className="text-xs text-[#8fa0bb]">{recordings.length} lessons</span>
        </div>

        {recordings.length ? (
          <div className="space-y-5">
            {Array.from(courseGroups.values()).map((group) => (
              <div key={group.course_id} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f8] pt-4 first:border-t-0 first:pt-0">
                  <div>
                    <p className="text-base font-semibold text-[#22324d]">{group.course_title}</p>
                    <p className="mt-1 text-xs text-[#8fa0bb]">{group.items.length} recordings</p>
                  </div>
                  <Link to={`/courses/${group.course_slug}`} className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800">
                    Course
                  </Link>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((recording) => (
                    <Link
                      key={recording.id}
                      to={`/dashboard/recordings/${recording.id}`}
                      className="group overflow-hidden rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] transition hover:border-emerald-200 hover:bg-emerald-50/50"
                    >
                      <div className="relative aspect-video bg-[#dce5f0]">
                        {recording.thumbnail_url ? (
                          <img src={recording.thumbnail_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#7890ad]">
                            <Video className="h-6 w-6" />
                          </div>
                        )}
                        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#53657f]">
                          {recording.video_provider || 'Video'}
                        </div>
                        <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-[0_10px_24px_rgba(15,23,42,0.2)]">
                          <PlayCircle className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="truncate text-base font-semibold text-[#22324d]">{recording.title}</p>
                        <p className="mt-1 text-sm text-[#7e8ba3]">Uploaded {formatDate(recording.uploaded_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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
