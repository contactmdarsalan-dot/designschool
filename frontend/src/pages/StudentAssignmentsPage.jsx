import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileCheck2, FileWarning, Link2, ListTodo, LoaderCircle, Send, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  MetricTile,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { apiFetch } from '../lib/api';
import { clearAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';
import { cx, formatDate, formatDateTime } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const assignmentTone = (status) => {
  if (status === 'graded') {
    return 'success';
  }
  if (status === 'submitted') {
    return 'info';
  }
  if (status === 'overdue') {
    return 'danger';
  }
  return 'warning';
};

const filterOptions = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'graded', label: 'Graded' },
  { key: 'overdue', label: 'Overdue' },
];

const summarizeAssignments = (assignments) =>
  assignments.reduce(
    (summary, assignment) => ({
      ...summary,
      total: summary.total + 1,
      [assignment.status]: (summary[assignment.status] || 0) + 1,
    }),
    { total: 0, pending: 0, submitted: 0, graded: 0, overdue: 0 },
  );

const StudentAssignmentsPage = () => {
  const navigate = useNavigate();
  const { data, setData, isLoading, error } = useStudentWorkspaceResource(
    'students/assignments/',
    {
      summary: {},
      assignments: [],
    },
    'Unable to load your assignments.',
  );
  const [activeFilter, setActiveFilter] = useState('all');
  const [submissionTarget, setSubmissionTarget] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitState, setSubmitState] = useState({ isSubmitting: false, error: '' });

  const filteredAssignments = useMemo(() => {
    if (activeFilter === 'all') {
      return data.assignments;
    }
    return data.assignments.filter((assignment) => assignment.status === activeFilter);
  }, [activeFilter, data.assignments]);

  const openSubmission = (assignment) => {
    setSubmissionTarget(assignment);
    setSubmissionLink(assignment.submission_link || '');
    setSubmitState({ isSubmitting: false, error: '' });
  };

  const closeSubmission = () => {
    if (submitState.isSubmitting) {
      return;
    }
    setSubmissionTarget(null);
    setSubmissionLink('');
    setSubmitState({ isSubmitting: false, error: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!submissionTarget) {
      return;
    }

    setSubmitState({ isSubmitting: true, error: '' });

    try {
      const { response, payload } = await apiFetch('assignments/submissions/', {
        auth: true,
        method: 'POST',
        body: {
          assignment: submissionTarget.id,
          submission_link: submissionLink.trim(),
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to submit assignment.'));
      }

      const updatedAssignments = data.assignments.map((assignment) =>
        assignment.id === submissionTarget.id
          ? {
              ...assignment,
              status: 'submitted',
              status_label: 'Submitted',
              submission_link: payload.submission_link || submissionLink.trim(),
              submitted_at: payload.submitted_at || new Date().toISOString(),
              marks_obtained: payload.marks_obtained ?? assignment.marks_obtained,
            }
          : assignment,
      );

      setData({
        summary: summarizeAssignments(updatedAssignments),
        assignments: updatedAssignments,
      });
      closeSubmission();
    } catch (nextError) {
      setSubmitState({
        isSubmitting: false,
        error: nextError.message || 'Unable to submit assignment.',
      });
    }
  };

  if (isLoading) {
    return <WorkspaceLoading label="Loading assignments..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel eyebrow="Assignments" title="Assignment Queue" description="Due work, submissions, grading.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <MetricTile label="Total" value={data.summary.total || 0} hint="Active courses" />
          <MetricTile label="Pending" value={data.summary.pending || 0} hint="Needs upload" tone="accent" />
          <MetricTile label="Submitted" value={data.summary.submitted || 0} hint="In review" />
          <MetricTile label="Graded" value={data.summary.graded || 0} hint="Scored" />
          <MetricTile label="Overdue" value={data.summary.overdue || 0} hint="Past due" />
        </div>
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Work"
        title="Assignments"
        action={
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setActiveFilter(option.key)}
                className={cx(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  activeFilter === option.key
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-[#e1e9f3] bg-white text-[#60748f] hover:bg-[#f8fafc]',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        {filteredAssignments.length ? (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="rounded-[1.15rem] border border-[#e5ebf5] bg-[#fbfcfe] p-4 md:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={assignment.status_label} tone={assignmentTone(assignment.status)} />
                      <span className="rounded-full border border-[#e5ebf5] bg-white px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-[#7e8ba3]">
                        {assignment.course_title}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#22324d]">{assignment.title}</h3>
                    {assignment.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#7e8ba3]">{assignment.description}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Due</p>
                      <p className="mt-2 text-base font-semibold text-[#22324d]">{formatDate(assignment.due_at)}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Marks</p>
                      <p className="mt-2 text-base font-semibold text-[#22324d]">
                        {assignment.marks_obtained ?? 'Pending'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#e5ebf5] bg-white px-4 py-4 sm:col-span-2">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Submission</p>
                      <p className="mt-2 text-sm text-[#7e8ba3]">
                        {assignment.submitted_at
                          ? `Submitted ${formatDateTime(assignment.submitted_at)}`
                          : 'No submission recorded yet'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {assignment.status !== 'graded' ? (
                    <button
                      type="button"
                      onClick={() => openSubmission(assignment)}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Send className="h-4 w-4" />
                      {assignment.submission_link ? 'Replace Link' : 'Submit Link'}
                    </button>
                  ) : null}
                  <Link
                    to={`/courses/${assignment.course_slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dfe7f2] bg-white px-4 py-2.5 text-sm font-medium text-[#3c4f6c] transition hover:bg-[#f8fafc]"
                  >
                    Open Course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {assignment.submission_link ? (
                    <a
                      href={assignment.submission_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      View Submission
                      <FileCheck2 className="h-4 w-4" />
                    </a>
                  ) : null}
                  {assignment.status === 'overdue' ? (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                      <FileWarning className="h-4 w-4" />
                      Overdue
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : data.assignments.length ? (
          <EmptyWorkspaceState title="Nothing in this view" description="Switch filters to see more assignments." />
        ) : (
          <EmptyWorkspaceState
            title="No assignments yet"
            description="Published coursework will appear here."
            action={
              <Link
                to="/dashboard/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
              >
                Go to Courses
                <ListTodo className="h-4 w-4" />
              </Link>
            }
          />
        )}
      </WorkspacePanel>

      {submissionTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-[3px]" onClick={closeSubmission}>
          <motion.form
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-lg rounded-[1.2rem] border border-[#dfe7f2] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#edf2f8] px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fa0bb]">Submit</p>
                <h2 className="mt-1 truncate text-xl font-semibold text-[#22324d]">{submissionTarget.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeSubmission}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-[#60748f] transition hover:bg-[#f8fafc]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-[#60748f]">Submission link</span>
                <div className="relative">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6bc]" />
                  <input
                    type="url"
                    required
                    value={submissionLink}
                    onChange={(event) => setSubmissionLink(event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-[1rem] border border-[#dce5f0] bg-white py-3.5 pl-11 pr-4 text-[#22324d] outline-none transition placeholder:text-[#a4b1c6] focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                  />
                </div>
              </label>

              {submitState.error ? <WorkspaceError message={submitState.error} /> : null}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#edf2f8] px-5 py-4">
              <button
                type="button"
                onClick={closeSubmission}
                className="rounded-xl border border-[#dce5f0] bg-white px-4 py-3 text-sm font-medium text-[#53657f] transition hover:bg-[#f8fafc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitState.isSubmitting || !submissionLink.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#b5c8bf]"
              >
                {submitState.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Submit
              </button>
            </div>
          </motion.form>
        </div>
      ) : null}
    </motion.div>
  );
};

export default StudentAssignmentsPage;
