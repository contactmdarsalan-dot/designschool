import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Brain,
  CalendarClock,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Plus,
  Search,
  Users,
  Video,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { apiFetch } from '../lib/api';
import { clearAuthSession, getStoredUser } from '../lib/auth';
import { extractApiError } from '../lib/errors';
import { cx, formatDate, formatDateTime, getInitials } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const tabs = [
  { key: 'courses', label: 'Courses', icon: LayoutDashboard },
  { key: 'learners', label: 'Learners', icon: Users },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'submissions', label: 'Grades', icon: FileCheck2 },
  { key: 'attendance', label: 'Attendance', icon: CalendarClock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'recordings', label: 'Recordings', icon: Video },
];

const inputClassName =
  'w-full rounded-[14px] border border-[#dbe5f1] bg-[#fbfcfe] px-4 py-3 text-sm text-[#17233a] outline-none transition placeholder:text-[#9aa8bd] hover:border-[#c9d6e8] focus:border-emerald-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(16,185,129,0.10)]';

const dayLookup = {
  sun: 0,
  sunday: 0,
  mon: 1,
  monday: 1,
  tue: 2,
  tues: 2,
  tuesday: 2,
  wed: 3,
  wednesday: 3,
  thu: 4,
  thur: 4,
  thurs: 4,
  thursday: 4,
  fri: 5,
  friday: 5,
  sat: 6,
  saturday: 6,
};

const toDateInputValue = (date) => {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
};

const toTimeInputValue = (minutes) => {
  if (!Number.isFinite(minutes)) {
    return '';
  }
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
};

const parseCourseDays = (value) =>
  String(value || '')
    .split(/[,/&|]+|\band\b/gi)
    .map((part) => part.trim().toLowerCase().replace(/\.$/, ''))
    .map((part) => dayLookup[part])
    .filter((day) => Number.isInteger(day));

const parseTimeToken = (token, fallbackPeriod = '') => {
  const match = String(token || '').trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) {
    return null;
  }
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = (match[3] || fallbackPeriod || '').toLowerCase();
  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;
  return hour * 60 + minute;
};

const parseCourseTimeRange = (value) => {
  const text = String(value || '').replace(/[–—]/g, '-');
  const periodMatch = text.match(/\b(am|pm)\b/gi);
  const fallbackPeriod = periodMatch?.[periodMatch.length - 1] || '';
  const [startRaw, endRaw] = text.split('-').map((part) => part.trim());
  const start = parseTimeToken(startRaw, fallbackPeriod);
  const end = parseTimeToken(endRaw, fallbackPeriod);
  return {
    start_time: toTimeInputValue(start),
    end_time: toTimeInputValue(end),
  };
};

const getNextClassDate = (course) => {
  const days = parseCourseDays(course?.live_days);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = course?.start_date ? new Date(course.start_date) : today;
  if (!Number.isNaN(startDate.getTime())) {
    startDate.setHours(0, 0, 0, 0);
  }
  const baseDate = Number.isNaN(startDate.getTime()) || startDate < today ? today : startDate;

  if (!days.length) {
    return toDateInputValue(baseDate);
  }

  const candidates = days.map((day) => {
    const candidate = new Date(baseDate);
    const offset = (day - candidate.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + offset);
    return candidate;
  });
  candidates.sort((left, right) => left - right);
  return toDateInputValue(candidates[0]);
};

const getSessionDefaultsForCourse = (course) => {
  const timeRange = parseCourseTimeRange(course?.live_time);
  return {
    course: course?.id || '',
    title: '',
    date: course ? getNextClassDate(course) : '',
    start_time: timeRange.start_time,
    end_time: timeRange.end_time,
    description: '',
  };
};

const Metric = ({ icon: Icon, label, value, tone = 'default' }) => (
  <div className={cx('group relative overflow-hidden rounded-[18px] border px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)]', tone === 'accent' ? 'border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)]' : 'border-[#e4ebf5] bg-white')}>
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
    <div className="flex items-center gap-3">
    <div className={cx('flex h-11 w-11 items-center justify-center rounded-[14px]', tone === 'accent' ? 'bg-emerald-500 text-white shadow-[0_12px_24px_rgba(16,185,129,0.25)]' : 'bg-[#f1f5f9] text-[#50657f]')}>
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0bb]">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-[#17233a]">{value}</p>
    </div>
    </div>
  </div>
);

const Panel = ({ title, action, children }) => (
  <section className="overflow-hidden rounded-[22px] border border-[#e3ebf6] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf2f8] bg-[#fbfcfe] px-5 py-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#526782]">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const InstructorSidebar = ({ activeTab, onTabChange, user, onLogout }) => (
  <motion.aside variants={pageTransition} initial="hidden" animate="show" className="hidden border-r border-[#e6ecf5] bg-white/95 shadow-[16px_0_45px_rgba(15,23,42,0.04)] backdrop-blur xl:fixed xl:inset-y-0 xl:left-0 xl:z-40 xl:block xl:w-[304px] xl:overflow-y-auto">
    <div className="flex h-full flex-col">
      <div className="border-b border-[#eef2f7] px-6 py-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[#082f49] text-emerald-300 shadow-[0_16px_30px_rgba(8,47,73,0.20)]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[1.45rem] font-semibold tracking-tight text-[#17233a]">Design School</h1>
            <p className="mt-0.5 text-xs font-medium text-[#8b9ab1]">Instructor workspace</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-8 px-4 py-5">
        <div>
          <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">Instructor</p>
          <div className="space-y-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  className={cx(
                    'group flex w-full items-center gap-3 rounded-[15px] px-3 py-3 text-left text-[0.96rem] transition',
                    isActive ? 'bg-[#082f49] text-white shadow-[0_16px_35px_rgba(8,47,73,0.20)]' : 'text-[#4c6080] hover:bg-[#f5f7fb] hover:text-[#17233a]',
                  )}
                >
                  <span className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]', isActive ? 'bg-white/12 text-emerald-200' : 'bg-[#f2f6fb] text-[#7387a5] group-hover:text-[#17233a]')}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="truncate font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 px-1">
          <p className="pb-3 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">Workspace</p>
          <div className="rounded-[18px] border border-[#e5ebf5] bg-[linear-gradient(135deg,#f8fbff,#ffffff)] px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm font-semibold text-[#17233a]">{user?.first_name || user?.email || 'Instructor'}</p>
            <p className="mt-1 truncate text-sm text-[#7e8ba3]">{user?.email || 'instructor@designschool.com'}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-[15px] border border-[#e5ebf5] bg-white px-4 py-3 text-left text-sm font-medium text-[#5e6f89] transition hover:border-[#cbd8ea] hover:bg-[#f8fafc] hover:text-[#17233a]"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  </motion.aside>
);

const InstructorPanelPage = () => {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const { data, isLoading, error, reload } = useStudentWorkspaceResource(
    'mentors/workspace/',
    {
      profile: {},
      summary: {},
      courses: [],
      learners: [],
      assignments: [],
      submissions: [],
      attendance_sessions: [],
      attendance_records: [],
      notifications: [],
      recordings: [],
    },
    'Unable to load instructor panel.',
  );
  const [activeTab, setActiveTab] = useState('courses');
  const [assignmentDraft, setAssignmentDraft] = useState({ course: '', title: '', description: '', due_date: '' });
  const [recordingDraft, setRecordingDraft] = useState({ course: '', title: '', video_url: '', duration_seconds: '', is_unlisted: true });
  const [sessionDraft, setSessionDraft] = useState({ course: '', title: '', date: '', start_time: '', end_time: '', description: '' });
  const [submitState, setSubmitState] = useState({ target: '', isSubmitting: false, error: '', success: '' });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [attendanceDrafts, setAttendanceDrafts] = useState({});
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const firstCourseId = data.courses?.[0]?.id || '';
  const selectedSessionCourse = data.courses.find((course) => course.id === (sessionDraft.course || firstCourseId)) || data.courses[0];
  const assignmentForm = { ...assignmentDraft, course: assignmentDraft.course || firstCourseId };
  const recordingForm = { ...recordingDraft, course: recordingDraft.course || firstCourseId };
  const sessionForm = { ...sessionDraft, course: sessionDraft.course || firstCourseId };
  const selectedAssignment = data.assignments.find((assignment) => String(assignment.id) === String(selectedAssignmentId)) || data.assignments[0];
  const activeAssignmentId = selectedAssignment?.id ? String(selectedAssignment.id) : '';
  const activeSubmissions = data.submissions.filter((submission) => String(submission.assignment_id) === activeAssignmentId);
  const selectedSession = data.attendance_sessions.find((session) => String(session.id) === String(selectedSessionId)) || data.attendance_sessions[0];
  const activeSessionId = selectedSession?.id ? String(selectedSession.id) : '';
  const sessionLearners = data.learners.filter((learner) => String(learner.course_id) === String(selectedSession?.course_id));
  const recordsByStudent = new Map(
    data.attendance_records
      .filter((record) => String(record.session_id) === activeSessionId)
      .map((record) => [String(record.student_id), record]),
  );
  const unreadNotifications = data.notifications.length;
  const activeTabMeta = tabs.find((tab) => tab.key === activeTab) || tabs[0];
  const ActiveTabIcon = activeTabMeta.icon;

  useEffect(() => {
    document.title = 'Instructor Panel | Design School';
  }, []);

  useEffect(() => {
    if (!data.courses.length || sessionDraft.course || sessionDraft.date || sessionDraft.start_time || sessionDraft.end_time) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setSessionDraft(getSessionDefaultsForCourse(data.courses[0]));
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [data.courses, sessionDraft.course, sessionDraft.date, sessionDraft.end_time, sessionDraft.start_time]);

  const learnersByCourse = useMemo(() => {
    const groups = new Map();
    data.learners.forEach((learner) => {
      if (!groups.has(learner.course_id)) {
        groups.set(learner.course_id, []);
      }
      groups.get(learner.course_id).push(learner);
    });
    return groups;
  }, [data.learners]);

  const handleUnauthorized = (response) => {
    if (response.status === 401 || response.status === 403) {
      clearAuthSession();
      navigate('/login', { replace: true });
      return true;
    }
    return false;
  };

  const handleSignOut = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  const openSubmissionsForAssignment = (assignmentId) => {
    setSelectedAssignmentId(String(assignmentId));
    setActiveTab('submissions');
  };

  const updateGradeDraft = (submissionId, field, value) => {
    setGradeDrafts((current) => ({
      ...current,
      [submissionId]: {
        ...current[submissionId],
        [field]: value,
      },
    }));
  };

  const gradeSubmission = async (submission) => {
    const draft = gradeDrafts[submission.id] || {};
    const marksValue = draft.marks_obtained ?? submission.marks_obtained ?? '';
    setSubmitState({ target: `grade-${submission.id}`, isSubmitting: true, error: '', success: '' });

    try {
      const { response, payload } = await apiFetch(`assignments/submissions/${submission.id}/`, {
        auth: true,
        method: 'PATCH',
        body: {
          status: draft.status || 'graded',
          marks_obtained: marksValue === '' ? null : Number(marksValue),
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to update grade.'));
      }

      setSubmitState({ target: `grade-${submission.id}`, isSubmitting: false, error: '', success: 'Grade saved.' });
      await reload();
    } catch (nextError) {
      setSubmitState({ target: `grade-${submission.id}`, isSubmitting: false, error: nextError.message || 'Unable to update grade.', success: '' });
    }
  };

  const createAttendanceSession = async (event) => {
    event.preventDefault();
    setSubmitState({ target: 'attendance-session', isSubmitting: true, error: '', success: '' });

    try {
      const { response, payload } = await apiFetch('attendance/sessions/', {
        auth: true,
        method: 'POST',
        body: {
          course: sessionForm.course,
          title: sessionForm.title,
          date: sessionForm.date,
          start_time: sessionForm.start_time || null,
          end_time: sessionForm.end_time || null,
          description: sessionForm.description,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to create attendance session.'));
      }

      setSessionDraft(getSessionDefaultsForCourse(data.courses.find((course) => course.id === sessionForm.course) || selectedSessionCourse));
      setSelectedSessionId(String(payload.id || ''));
      setSubmitState({ target: 'attendance-session', isSubmitting: false, error: '', success: 'Session created.' });
      await reload();
    } catch (nextError) {
      setSubmitState({ target: 'attendance-session', isSubmitting: false, error: nextError.message || 'Unable to create attendance session.', success: '' });
    }
  };

  const markAttendance = async (learner, status) => {
    if (!learner.user_id || !activeSessionId) {
      return;
    }

    const existingRecord = recordsByStudent.get(String(learner.user_id));
    const target = `attendance-${learner.user_id}`;
    setAttendanceDrafts((current) => ({ ...current, [learner.user_id]: status }));
    setSubmitState({ target, isSubmitting: true, error: '', success: '' });

    try {
      const { response, payload } = await apiFetch(existingRecord ? `attendance/records/${existingRecord.id}/` : 'attendance/records/', {
        auth: true,
        method: existingRecord ? 'PATCH' : 'POST',
        body: existingRecord
          ? { status }
          : {
              session: Number(activeSessionId),
              student: learner.user_id,
              status,
            },
      });

      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to mark attendance.'));
      }

      setSubmitState({ target, isSubmitting: false, error: '', success: 'Attendance saved.' });
      await reload();
    } catch (nextError) {
      setSubmitState({ target, isSubmitting: false, error: nextError.message || 'Unable to mark attendance.', success: '' });
    }
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    setSubmitState({ target: 'assignment', isSubmitting: true, error: '', success: '' });

    try {
      const { response, payload } = await apiFetch('assignments/list/', {
        auth: true,
        method: 'POST',
        body: {
          course: assignmentForm.course,
          title: assignmentForm.title,
          description: assignmentForm.description,
          due_date: assignmentForm.due_date,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to create assignment.'));
      }

      setAssignmentDraft({ course: assignmentForm.course, title: '', description: '', due_date: '' });
      setSubmitState({ target: 'assignment', isSubmitting: false, error: '', success: 'Assignment added.' });
      await reload();
    } catch (nextError) {
      setSubmitState({ target: 'assignment', isSubmitting: false, error: nextError.message || 'Unable to create assignment.', success: '' });
    }
  };

  const createRecording = async (event) => {
    event.preventDefault();
    setSubmitState({ target: 'recording', isSubmitting: true, error: '', success: '' });

    try {
      const { response, payload } = await apiFetch('recordings/', {
        auth: true,
        method: 'POST',
        body: {
          course: recordingForm.course,
          title: recordingForm.title,
          video_url: recordingForm.video_url,
          duration_seconds: recordingForm.duration_seconds || null,
          is_unlisted: recordingForm.is_unlisted,
        },
      });

      if (handleUnauthorized(response)) {
        return;
      }
      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to add recording.'));
      }

      setRecordingDraft({ course: recordingForm.course, title: '', video_url: '', duration_seconds: '', is_unlisted: true });
      setSubmitState({ target: 'recording', isSubmitting: false, error: '', success: 'Recording added.' });
      await reload();
    } catch (nextError) {
      setSubmitState({ target: 'recording', isSubmitting: false, error: nextError.message || 'Unable to add recording.', success: '' });
    }
  };

  if (isLoading) {
    return <WorkspaceLoading label="Loading instructor panel..." />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] text-[#17233a] selection:bg-emerald-100 selection:text-emerald-900">
      <main className="min-h-screen">
        <InstructorSidebar activeTab={activeTab} onTabChange={setActiveTab} user={storedUser} onLogout={handleSignOut} />

        <div className="min-w-0 xl:pl-[304px]">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative hidden max-w-[440px] flex-1 md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a0b8]" />
                  <input
                    readOnly
                    className="w-full rounded-[16px] border border-[#dfe8f3] bg-[#f8fbff] py-3 pl-11 pr-4 text-sm text-[#17233a] outline-none placeholder:text-[#9aa8bd] shadow-inner shadow-white"
                    placeholder="Search anything"
                  />
                </div>

                <div className="min-w-0 xl:hidden">
                  <p className="truncate text-lg font-semibold text-[#22324d]">Instructor Panel</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen((current) => !current)}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e4ebf5] bg-white text-[#6d7f99] shadow-[0_10px_22px_rgba(15,23,42,0.05)] transition hover:border-[#cbd8ea] hover:text-[#17233a]"
                    aria-label="Open notifications"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {unreadNotifications ? <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" /> : null}
                  </button>
                  {notificationsOpen ? (
                    <div className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-2rem))] rounded-[20px] border border-[#e5ebf5] bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                      <div className="flex items-center justify-between gap-3 px-2 pb-2">
                        <p className="text-sm font-semibold text-[#22324d]">Notifications</p>
                        <button type="button" onClick={() => setActiveTab('notifications')} className="text-xs font-semibold text-emerald-700">View all</button>
                      </div>
                      <div className="max-h-[360px] space-y-2 overflow-y-auto">
                        {data.notifications.length ? data.notifications.slice(0, 6).map((item) => (
                          <div key={item.id} className="rounded-xl border border-[#edf2f8] bg-[#fbfcfe] px-3 py-2.5">
                            <p className="text-sm font-semibold text-[#22324d]">{item.title}</p>
                            <p className="mt-1 truncate text-xs text-[#7e8ba3]">{item.message}</p>
                            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#9aa8bd]">{item.meta}</p>
                          </div>
                        )) : <p className="px-2 py-6 text-center text-sm text-[#8fa0bb]">All clear.</p>}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="hidden items-center gap-3 md:flex">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#082f49] text-sm font-semibold text-emerald-200 shadow-[0_12px_24px_rgba(8,47,73,0.18)]">
                    {getInitials(storedUser?.first_name || storedUser?.email || 'Instructor')}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-[#8a99b1]">Instructor</p>
                    <p className="max-w-[220px] truncate text-sm font-medium text-[#22324d]">{storedUser?.email || 'instructor@designschool.com'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#6d7f99]" />
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#e3e9f3] bg-white px-3 py-2.5 text-sm font-medium text-[#5e6f89] shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition hover:border-[#cbd8ea] hover:bg-[#f8fafc] hover:text-[#17233a]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </header>

          <motion.div variants={pageTransition} initial="hidden" animate="show" className="px-5 py-7 md:px-8">
            <div className="space-y-6">
        {error ? <WorkspaceError message={error} /> : null}

        <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#082f49] p-6 text-white shadow-[0_28px_80px_rgba(8,47,73,0.22)] md:p-7">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-64 rounded-full bg-sky-300/10 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10 text-emerald-200 ring-1 ring-white/15">
                  <ActiveTabIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/90">Instructor Command</p>
                  <h1 className="mt-1 text-[2.1rem] font-semibold leading-none tracking-tight md:text-[2.35rem]">{activeTabMeta.label}</h1>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200">{data.profile.expertise || data.profile.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-[18px] border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Today</p>
                <p className="mt-1 text-sm font-semibold text-white">{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date())}</p>
              </div>
              <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-[15px] border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#082f49] shadow-[0_16px_35px_rgba(0,0,0,0.18)] transition hover:bg-emerald-50">
                Site
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <Metric icon={BookOpen} label="Courses" value={data.summary.courses || 0} tone="accent" />
          <Metric icon={Users} label="Learners" value={data.summary.learners || 0} />
          <Metric icon={ClipboardList} label="Assignments" value={data.summary.assignments || 0} />
          <Metric icon={FileCheck2} label="Submissions" value={data.summary.submissions || 0} />
          <Metric icon={CalendarClock} label="Sessions" value={data.summary.sessions || 0} />
          <Metric icon={Video} label="Recordings" value={data.summary.recordings || 0} />
        </section>

        {activeTab === 'courses' ? (
          <Panel title="Course Workspace">
            {data.courses.length ? (
              <div className="space-y-3">
                {data.courses.map((course) => (
                  <div key={course.id} className="grid gap-3 rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold">{course.title}</p>
                        <StatusBadge value={course.is_published ? 'Published' : 'Draft'} tone={course.is_published ? 'success' : 'neutral'} />
                      </div>
                      <p className="mt-1 text-sm text-[#7e8ba3]">{course.category} / {course.schedule_label}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-[#60748f]">
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.learners} learners</span>
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.assignments} tasks</span>
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.recordings} videos</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyWorkspaceState title="No courses assigned" description="Admin-assigned courses appear here." />
            )}
          </Panel>
        ) : null}

        {activeTab === 'learners' ? (
          <Panel title="Learners">
            {data.courses.length ? (
              <div className="space-y-4">
                {data.courses.map((course) => {
                  const courseLearners = learnersByCourse.get(course.id) || [];
                  return (
                    <div key={course.id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold">{course.title}</p>
                        <span className="text-sm text-[#8fa0bb]">{courseLearners.length} learners</span>
                      </div>
                      <div className="mt-3 divide-y divide-[#edf2f8]">
                        {courseLearners.length ? courseLearners.map((learner) => (
                          <div key={learner.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div>
                              <p className="text-sm font-semibold">{learner.name}</p>
                              <p className="mt-1 text-xs text-[#7e8ba3]">{learner.email}</p>
                            </div>
                            <p className="text-xs text-[#8fa0bb]">Joined {formatDate(learner.joined_at)}</p>
                          </div>
                        )) : <p className="py-3 text-sm text-[#8fa0bb]">No verified learners yet.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyWorkspaceState title="No learner data" description="Verified enrollments appear here." />
            )}
          </Panel>
        ) : null}

        {activeTab === 'assignments' ? (
          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Panel title="Create Assignment">
              <form onSubmit={createAssignment} className="space-y-3">
                <select className={inputClassName} value={assignmentForm.course} onChange={(event) => setAssignmentDraft((current) => ({ ...current, course: event.target.value }))} required>
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
                <input className={inputClassName} value={assignmentForm.title} onChange={(event) => setAssignmentDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Assignment title" required />
                <textarea className={cx(inputClassName, 'min-h-24 resize-y')} value={assignmentForm.description} onChange={(event) => setAssignmentDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Brief instructions" required />
                <input type="datetime-local" className={inputClassName} value={assignmentForm.due_date} onChange={(event) => setAssignmentDraft((current) => ({ ...current, due_date: event.target.value }))} required />
                {submitState.target === 'assignment' && submitState.error ? <WorkspaceError message={submitState.error} /> : null}
                {submitState.target === 'assignment' && submitState.success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitState.success}</p> : null}
                <button type="submit" disabled={submitState.isSubmitting || !data.courses.length} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50">
                  {submitState.target === 'assignment' && submitState.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Assignment
                </button>
              </form>
            </Panel>
            <Panel title="Assignments">
              {data.assignments.length ? (
                <div className="divide-y divide-[#edf2f8]">
                  {data.assignments.map((assignment) => (
                    <div key={assignment.id} className="grid gap-3 py-3 first:pt-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{assignment.title}</p>
                        <p className="mt-1 text-xs text-[#7e8ba3]">{assignment.course_title}</p>
                        <p className="mt-1 line-clamp-2 text-xs text-[#8fa0bb]">{assignment.description || 'No instructions added.'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <div className="text-left md:text-right">
                        <p className="text-xs font-semibold">{formatDateTime(assignment.due_date)}</p>
                        <p className="mt-1 text-xs text-[#8fa0bb]">{assignment.submission_count} submissions</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openSubmissionsForAssignment(assignment.id)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#dce5f0] bg-white px-3 py-2 text-xs font-semibold text-[#53657f] transition hover:bg-[#f8fafc]"
                        >
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyWorkspaceState title="No assignments" description="Create your first assignment." />
              )}
            </Panel>
          </div>
        ) : null}

        {activeTab === 'submissions' ? (
          <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Panel title="View Assignment">
              {data.assignments.length ? (
                <div className="space-y-3">
                  <select
                    className={inputClassName}
                    value={activeAssignmentId}
                    onChange={(event) => setSelectedAssignmentId(event.target.value)}
                  >
                    {data.assignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
                    ))}
                  </select>

                  <div className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                    <p className="text-base font-semibold text-[#22324d]">{selectedAssignment?.title || 'Assignment'}</p>
                    <p className="mt-1 text-sm text-[#7e8ba3]">{selectedAssignment?.course_title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge value={`${activeSubmissions.length} submissions`} tone={activeSubmissions.length ? 'success' : 'neutral'} />
                      <StatusBadge value={`Due ${formatDateTime(selectedAssignment?.due_date)}`} tone="info" />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-[#60748f]">{selectedAssignment?.description || 'No instructions added.'}</p>
                  </div>
                </div>
              ) : (
                <EmptyWorkspaceState title="No assignments" description="Create an assignment first." />
              )}
            </Panel>

            <Panel title="Grade Submissions">
              {activeSubmissions.length ? (
                <div className="space-y-3">
                  {activeSubmissions.map((submission) => {
                    const draft = gradeDrafts[submission.id] || {};
                    const gradeTarget = `grade-${submission.id}`;
                    const isSavingGrade = submitState.target === gradeTarget && submitState.isSubmitting;
                    return (
                      <div key={submission.id} className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{submission.student_name}</p>
                            <p className="mt-1 text-xs text-[#7e8ba3]">{submission.student_email}</p>
                          </div>
                          <StatusBadge
                            value={submission.status_label || submission.status}
                            tone={submission.status === 'graded' ? 'success' : submission.status === 'submitted' ? 'warning' : 'neutral'}
                          />
                        </div>

                        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_130px_150px_auto] lg:items-center">
                          {submission.submission_link ? (
                            <a
                              href={submission.submission_link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[#dce5f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#53657f] transition hover:bg-[#f8fafc]"
                            >
                              Open submission
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="inline-flex min-h-11 items-center rounded-xl border border-[#e5ebf5] bg-white px-4 py-2.5 text-sm text-[#8fa0bb]">No link</span>
                          )}
                          <input
                            type="number"
                            min="0"
                            className={inputClassName}
                            value={draft.marks_obtained ?? submission.marks_obtained ?? ''}
                            onChange={(event) => updateGradeDraft(submission.id, 'marks_obtained', event.target.value)}
                            placeholder="Marks"
                          />
                          <select
                            className={inputClassName}
                            value={draft.status || submission.status || 'submitted'}
                            onChange={(event) => updateGradeDraft(submission.id, 'status', event.target.value)}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="graded">Graded</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => gradeSubmission(submission)}
                            disabled={isSavingGrade}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {isSavingGrade ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />}
                            Save
                          </button>
                        </div>

                        {submitState.target === gradeTarget && submitState.error ? <div className="mt-3"><WorkspaceError message={submitState.error} /></div> : null}
                        {submitState.target === gradeTarget && submitState.success ? <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitState.success}</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyWorkspaceState title="No submissions yet" description="Student submissions for the selected assignment appear here." />
              )}
            </Panel>
          </div>
        ) : null}

        {activeTab === 'attendance' ? (
          <div className="grid gap-6 xl:grid-cols-[390px_minmax(0,1fr)]">
            <Panel title="Create Session">
              <form onSubmit={createAttendanceSession} className="space-y-3.5">
                <select
                  className={inputClassName}
                  value={sessionForm.course}
                  onChange={(event) => {
                    const nextCourse = data.courses.find((course) => course.id === event.target.value);
                    setSessionDraft({
                      ...getSessionDefaultsForCourse(nextCourse),
                      title: '',
                      description: '',
                    });
                  }}
                  required
                >
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
                {selectedSessionCourse ? (
                  <div className="rounded-[15px] border border-emerald-100 bg-emerald-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Auto schedule</p>
                        <p className="mt-1 text-sm text-[#53657f]">{selectedSessionCourse.live_days || 'Date'} / {selectedSessionCourse.live_time || 'Time'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSessionDraft((current) => ({
                          ...getSessionDefaultsForCourse(selectedSessionCourse),
                          title: current.title,
                          description: current.description,
                        }))}
                        className="rounded-[12px] bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-[0_8px_18px_rgba(16,185,129,0.12)]"
                      >
                        Refill
                      </button>
                    </div>
                  </div>
                ) : null}
                <input className={inputClassName} value={sessionForm.title} onChange={(event) => setSessionDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Session title" required />
                <input type="date" className={inputClassName} value={sessionForm.date} onChange={(event) => setSessionDraft((current) => ({ ...current, date: event.target.value }))} required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="time" className={inputClassName} value={sessionForm.start_time} onChange={(event) => setSessionDraft((current) => ({ ...current, start_time: event.target.value }))} />
                  <input type="time" className={inputClassName} value={sessionForm.end_time} onChange={(event) => setSessionDraft((current) => ({ ...current, end_time: event.target.value }))} />
                </div>
                <textarea className={cx(inputClassName, 'min-h-20 resize-y')} value={sessionForm.description} onChange={(event) => setSessionDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Short note" />
                {submitState.target === 'attendance-session' && submitState.error ? <WorkspaceError message={submitState.error} /> : null}
                {submitState.target === 'attendance-session' && submitState.success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitState.success}</p> : null}
                <button type="submit" disabled={submitState.isSubmitting || !data.courses.length} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] bg-[#082f49] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(8,47,73,0.20)] transition hover:bg-[#0b3b5d] disabled:opacity-50">
                  {submitState.target === 'attendance-session' && submitState.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Session
                </button>
              </form>

              <div className="mt-5 space-y-2.5">
                {data.attendance_sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedSessionId(String(session.id))}
                    className={cx(
                      'flex w-full items-center justify-between gap-3 rounded-[16px] border px-4 py-3 text-left transition',
                      activeSessionId === String(session.id) ? 'border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] shadow-[0_12px_28px_rgba(16,185,129,0.10)]' : 'border-[#e5ebf5] bg-[#fbfcfe] hover:border-[#cbd8ea] hover:bg-white',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#17233a]">{session.title}</span>
                      <span className="mt-1 block text-xs text-[#7e8ba3]">{formatDate(session.date)}</span>
                    </span>
                    <StatusBadge value={String(session.marked_count || 0)} tone={session.marked_count ? 'success' : 'neutral'} />
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Mark Attendance">
              {selectedSession ? (
                <div className="space-y-4">
                  <div className="rounded-[20px] border border-[#dfe8f3] bg-[linear-gradient(135deg,#f8fbff,#ffffff)] p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-[#17233a]">{selectedSession.title}</p>
                        <p className="mt-1 text-sm text-[#7e8ba3]">{selectedSession.course_title} / {formatDate(selectedSession.date)}</p>
                      </div>
                      <div className="rounded-[14px] bg-white px-3 py-2 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0bb]">Marked</p>
                        <p className="mt-1 text-base font-semibold text-[#17233a]">{recordsByStudent.size}/{sessionLearners.length}</p>
                      </div>
                    </div>
                  </div>

                  {sessionLearners.length ? sessionLearners.map((learner) => {
                    const record = learner.user_id ? recordsByStudent.get(String(learner.user_id)) : null;
                    const currentStatus = attendanceDrafts[learner.user_id] || record?.status || 'absent';
                    const target = `attendance-${learner.user_id}`;
                    return (
                      <div key={learner.id} className="grid gap-4 rounded-[18px] border border-[#e5ebf5] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-sm font-semibold text-emerald-700">
                              {getInitials(learner.name)}
                            </div>
                            <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#17233a]">{learner.name}</p>
                          <p className="mt-1 truncate text-xs text-[#7e8ba3]">{learner.email}</p>
                            </div>
                          </div>
                          {!learner.user_id ? <p className="mt-2 text-xs text-amber-700">Student account not linked yet.</p> : null}
                        </div>
                        <div className="flex flex-wrap gap-2 rounded-[16px] bg-[#f6f9fd] p-1.5">
                          {['present', 'late', 'excused', 'absent'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => markAttendance(learner, status)}
                              disabled={!learner.user_id || (submitState.target === target && submitState.isSubmitting)}
                              className={cx(
                                'inline-flex min-h-10 items-center gap-1.5 rounded-[13px] border px-3 py-2 text-xs font-semibold capitalize transition disabled:opacity-50',
                                currentStatus === status ? 'border-[#082f49] bg-[#082f49] text-white shadow-[0_10px_20px_rgba(8,47,73,0.16)]' : 'border-transparent bg-white text-[#53657f] hover:text-[#17233a]',
                              )}
                            >
                              {submitState.target === target && submitState.isSubmitting && currentStatus === status ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }) : (
                    <EmptyWorkspaceState title="No learners" description="Verified learners for this course appear here." />
                  )}
                </div>
              ) : (
                <EmptyWorkspaceState title="No sessions" description="Create a session to start marking attendance." />
              )}
            </Panel>
          </div>
        ) : null}

        {activeTab === 'notifications' ? (
          <Panel title="Notifications">
            {data.notifications.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {data.notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.type === 'submission') setActiveTab('submissions');
                      if (item.type === 'attendance') setActiveTab('attendance');
                      if (item.type === 'enrollment') setActiveTab('learners');
                    }}
                    className="rounded-2xl border border-[#e5ebf5] bg-[#fbfcfe] p-4 text-left transition hover:border-emerald-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#22324d]">{item.title}</p>
                        <p className="mt-1 truncate text-sm text-[#60748f]">{item.message}</p>
                        <p className="mt-2 text-xs text-[#8fa0bb]">{item.meta}</p>
                      </div>
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyWorkspaceState title="All clear" description="New submissions, attendance sessions, and pending enrollments appear here." />
            )}
          </Panel>
        ) : null}

        {activeTab === 'recordings' ? (
          <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
            <Panel title="Add YouTube Recording">
              <form onSubmit={createRecording} className="space-y-3">
                <select className={inputClassName} value={recordingForm.course} onChange={(event) => setRecordingDraft((current) => ({ ...current, course: event.target.value }))} required>
                  {data.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                </select>
                <input className={inputClassName} value={recordingForm.title} onChange={(event) => setRecordingDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Recording title" required />
                <input type="url" className={inputClassName} value={recordingForm.video_url} onChange={(event) => setRecordingDraft((current) => ({ ...current, video_url: event.target.value }))} placeholder="YouTube unlisted URL" required />
                <input type="number" min="0" className={inputClassName} value={recordingForm.duration_seconds} onChange={(event) => setRecordingDraft((current) => ({ ...current, duration_seconds: event.target.value }))} placeholder="Duration seconds optional" />
                <label className="flex items-center gap-3 rounded-xl border border-[#dce5f0] bg-white px-4 py-3 text-sm text-[#60748f]">
                  <input type="checkbox" checked={recordingForm.is_unlisted} onChange={(event) => setRecordingDraft((current) => ({ ...current, is_unlisted: event.target.checked }))} />
                  YouTube unlisted
                </label>
                {submitState.target === 'recording' && submitState.error ? <WorkspaceError message={submitState.error} /> : null}
                {submitState.target === 'recording' && submitState.success ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{submitState.success}</p> : null}
                <button type="submit" disabled={submitState.isSubmitting || !data.courses.length} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50">
                  {submitState.target === 'recording' && submitState.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Recording
                </button>
              </form>
            </Panel>
            <Panel title="Recordings">
              {data.recordings.length ? (
                <div className="divide-y divide-[#edf2f8]">
                  {data.recordings.map((recording) => (
                    <div key={recording.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
                      <div>
                        <p className="text-sm font-semibold">{recording.title}</p>
                        <p className="mt-1 text-xs text-[#7e8ba3]">{recording.course_title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={recording.video_provider || 'Video'} tone={recording.video_provider === 'youtube' ? 'success' : 'neutral'} />
                        <p className="text-xs text-[#8fa0bb]">{formatDate(recording.uploaded_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyWorkspaceState title="No recordings" description="Add YouTube unlisted lessons here." />
              )}
            </Panel>
          </div>
        ) : null}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default InstructorPanelPage;
