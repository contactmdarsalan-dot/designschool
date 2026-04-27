import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  IdCard,
  LoaderCircle,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import {
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { apiFetch } from '../lib/api';
import { clearAuthSession, storeAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';
import { formatDate, getInitials } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const inputClassName =
  'w-full rounded-[1rem] border border-[#dce5f0] bg-white px-4 py-3.5 text-[#22324d] outline-none transition placeholder:text-[#a4b1c6] focus:border-emerald-300 focus:bg-[#fcfefd] focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]';

const summaryItemClassName =
  'rounded-[1rem] border border-[#e4ebf4] bg-white px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]';

const ProfileSummaryItem = ({ icon: Icon, label, value, hint, accent = false }) => (
  <div
    className={
      accent
        ? 'rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-4 shadow-[0_10px_28px_rgba(16,185,129,0.08)]'
        : summaryItemClassName
    }
  >
    <div className="flex items-start gap-3">
      <div
        className={
          accent
            ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600'
            : 'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f3f7fb] text-[#61748f]'
        }
      >
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">{label}</p>
        <p className="mt-2 truncate text-lg font-semibold tracking-tight text-[#22324d]">{value}</p>
        {hint ? <p className="mt-1 text-sm text-[#7e8ba3]">{hint}</p> : null}
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value, icon: Icon, trailing }) => (
  <div className="flex items-start gap-3 rounded-[1rem] border border-[#edf2f8] bg-[#fbfcfe] px-4 py-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#70819b] shadow-[0_6px_16px_rgba(15,23,42,0.06)]">
      <Icon className="h-4.5 w-4.5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-[#22324d]">{value}</p>
    </div>
    {trailing ? <div className="shrink-0">{trailing}</div> : null}
  </div>
);

const StudentProfilePage = () => {
  const navigate = useNavigate();
  const { data, setData, isLoading, error } = useStudentWorkspaceResource(
    'students/profile/',
    {
      first_name: '',
      last_name: '',
      email: '',
      student_id: '',
      date_of_birth: '',
      phone_number: '',
      is_phone_verified: false,
      joined_on: '',
    },
    'Unable to load your profile.',
  );

  const [draft, setDraft] = useState(null);
  const [saveState, setSaveState] = useState({
    isSaving: false,
    error: '',
    success: '',
  });

  const formState = draft || data;
  const displayName = [formState.first_name, formState.last_name].filter(Boolean).join(' ') || 'Student';
  const hasDraftChanges = Boolean(
    draft &&
      ['first_name', 'last_name', 'date_of_birth', 'phone_number'].some(
        (field) => String(draft[field] || '') !== String(data[field] || ''),
      ),
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({
      ...(current || data),
      [name]: value,
    }));
    if (saveState.error || saveState.success) {
      setSaveState((current) => ({
        ...current,
        error: '',
        success: '',
      }));
    }
  };

  const handleReset = () => {
    setDraft(null);
    setSaveState((current) => ({
      ...current,
      error: '',
      success: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaveState({
      isSaving: true,
      error: '',
      success: '',
    });

    try {
      const { response, payload } = await apiFetch('students/profile/', {
        auth: true,
        method: 'PATCH',
        body: {
          first_name: formState.first_name,
          last_name: formState.last_name,
          date_of_birth: formState.date_of_birth || null,
          phone_number: formState.phone_number,
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok || !payload?.data) {
        throw new Error(extractApiError(payload, 'Unable to update your profile.'));
      }

      setData(payload.data);
      setDraft(null);
      setSaveState({
        isSaving: false,
        error: '',
        success: payload.message || 'Profile updated successfully.',
      });

      const currentWindow = typeof window !== 'undefined' ? window : null;
      const storedUser = currentWindow?.sessionStorage.getItem('eduflow.user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          storeAuthSession({
            user: {
              ...parsed,
              first_name: payload.data.first_name,
              last_name: payload.data.last_name,
              phone_number: payload.data.phone_number,
              is_phone_verified: payload.data.is_phone_verified,
            },
          });
        } catch {
          // No-op if the stored user could not be parsed.
        }
      }
    } catch (nextError) {
      setSaveState({
        isSaving: false,
        error: nextError.message || 'Unable to update your profile.',
        success: '',
      });
    }
  };

  if (isLoading) {
    return <WorkspaceLoading label="Loading profile..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel
        eyebrow="Profile"
        title="Account & Student Details"
        description="Identity and contact."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[1.35rem] border border-[#e8eef6] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_38%),linear-gradient(180deg,#ffffff_0%,#fbfcfe_100%)] px-5 py-5 md:px-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-[1.4rem] bg-emerald-500/10 text-[1.15rem] font-semibold text-emerald-700">
                  {getInitials(displayName)}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value="Student account" tone="neutral" />
                    <StatusBadge value={data.is_phone_verified ? 'Phone verified' : 'Phone pending'} tone={data.is_phone_verified ? 'success' : 'warning'} />
                  </div>
                  <h2 className="mt-4 text-[2rem] font-semibold tracking-tight text-[#22324d]">{displayName}</h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {hasDraftChanges ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                    Unsaved changes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                    Everything up to date
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <ProfileSummaryItem icon={IdCard} label="Student ID" value={data.student_id || 'Pending'} hint="Assigned automatically" />
              <ProfileSummaryItem icon={Mail} label="Sign-in Email" value={data.email || 'Not set'} hint="Primary account address" />
              <ProfileSummaryItem
                icon={Phone}
                label="Phone Status"
                value={data.is_phone_verified ? 'Verified' : 'Pending'}
                hint={data.is_phone_verified ? 'Verification completed' : 'Verification still required'}
                accent={data.is_phone_verified}
              />
              <ProfileSummaryItem icon={CalendarDays} label="Joined" value={formatDate(data.joined_on)} hint="Workspace activation date" />
            </div>
          </div>

          <div className="space-y-3">
            <DetailRow
              icon={UserRound}
              label="Profile Name"
              value={displayName}
              trailing={<StatusBadge value="Active" tone="success" />}
            />
            <DetailRow icon={Mail} label="Sign-in Email" value={data.email || 'Not set'} />
            <DetailRow
              icon={Phone}
              label="Phone Number"
              value={data.phone_number || 'Add your number'}
              trailing={
                <StatusBadge
                  value={data.is_phone_verified ? 'Verified' : 'Verify'}
                  tone={data.is_phone_verified ? 'success' : 'warning'}
                />
              }
            />
            <DetailRow icon={CalendarDays} label="Joined On" value={formatDate(data.joined_on)} />
          </div>
        </div>
      </WorkspacePanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <WorkspacePanel eyebrow="Edit" title="Update Profile" description="Save changes instantly.">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2.5">
                <span className="text-sm font-medium text-[#60748f]">First name</span>
                <input
                  name="first_name"
                  value={formState.first_name || ''}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="First name"
                />
              </label>

              <label className="space-y-2.5">
                <span className="text-sm font-medium text-[#60748f]">Last name</span>
                <input
                  name="last_name"
                  value={formState.last_name || ''}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="Last name"
                />
              </label>

              <label className="space-y-2.5">
                <span className="text-sm font-medium text-[#60748f]">Date of birth</span>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formState.date_of_birth || ''}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </label>

              <label className="space-y-2.5">
                <span className="text-sm font-medium text-[#60748f]">Phone number</span>
                <input
                  type="tel"
                  name="phone_number"
                  value={formState.phone_number || ''}
                  onChange={handleChange}
                  className={inputClassName}
                  placeholder="+977 98XXXXXXXX"
                />
              </label>
            </div>

            {saveState.error ? <WorkspaceError message={saveState.error} /> : null}

            {saveState.success ? (
              <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{saveState.success}</span>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf2f8] pt-5">
              <div className="text-sm text-[#7e8ba3]">
                {hasDraftChanges ? 'You have unsaved changes.' : 'Changes save directly to your student workspace.'}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasDraftChanges || saveState.isSaving}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#dce5f0] bg-white px-4 py-3 text-sm font-medium text-[#53657f] transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saveState.isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saveState.isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Save Profile
                </button>
              </div>
            </div>
          </form>
        </WorkspacePanel>

        <div className="space-y-6">
          <WorkspacePanel eyebrow="Verification" title="Phone Security" description="Alerts and recovery.">
            {data.is_phone_verified ? (
              <div className="space-y-4">
                <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1f5d49]">Phone verified</p>
                      <p className="mt-1 text-sm text-[#4d7b6a]">Ready for alerts.</p>
                    </div>
                  </div>
                </div>
                <DetailRow icon={Phone} label="Verified number" value={data.phone_number || 'No number saved'} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="font-medium text-amber-800">Verification still pending</p>
                  <p className="mt-1 text-sm text-amber-700/80">Verify to enable alerts.</p>
                </div>
                <Link
                  to="/verify-phone"
                  state={{ email: data.email }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-[#22324d] transition hover:bg-amber-100"
                >
                  Verify Phone
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </WorkspacePanel>

          <WorkspacePanel eyebrow="Account" title="Workspace Snapshot" description="Read-only details.">
            <div className="space-y-3">
              <DetailRow icon={Mail} label="Sign-in Email" value={data.email || 'Not set'} />
              <DetailRow icon={IdCard} label="Student ID" value={data.student_id || 'Pending'} />
              <DetailRow icon={CalendarDays} label="Joined On" value={formatDate(data.joined_on)} />
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentProfilePage;
