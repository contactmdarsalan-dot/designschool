import { Bell, CheckCheck, Clock3, Mail, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { apiFetch } from '../lib/api';
import { cx, formatDateTime } from '../lib/studentWorkspace';

const initialState = {
  summary: {
    total: 0,
    unread: 0,
    email_enabled: false,
  },
  notifications: [],
};

const categoryStyles = {
  enrollment: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  assignment: 'border-sky-200 bg-sky-50 text-sky-700',
  grade: 'border-violet-200 bg-violet-50 text-violet-700',
  recording: 'border-amber-200 bg-amber-50 text-amber-700',
  attendance: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  certificate: 'border-lime-200 bg-lime-50 text-lime-700',
  system: 'border-slate-200 bg-slate-50 text-slate-600',
};

const MetricCard = ({ icon: Icon, label, value, tone = 'default' }) => (
  <div
    className={cx(
      'rounded-2xl border px-4 py-4',
      tone === 'green' ? 'border-emerald-200 bg-emerald-50' : 'border-[#e4ebf5] bg-white',
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#90a0b8]">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-[#061b3a]">{value}</p>
      </div>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f5f9] text-[#1f4a77]">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </div>
);

const StudentNotificationsPage = () => {
  const { data, setData, isLoading, error, reload } = useStudentWorkspaceResource(
    'students/notifications/',
    initialState,
    'Unable to load notifications.',
  );

  const notifications = data.notifications || [];
  const summary = data.summary || initialState.summary;

  const markAllRead = async () => {
    const { response, payload } = await apiFetch('students/notifications/', {
      auth: true,
      method: 'PATCH',
      body: { mark_all_read: true },
    });

    if (response.ok && payload?.data) {
      setData(payload.data);
    } else {
      await reload();
    }
  };

  const markOneRead = async (notificationId) => {
    setData((current) => ({
      ...current,
      summary: {
        ...current.summary,
        unread: Math.max(0, Number(current.summary?.unread || 0) - 1),
      },
      notifications: (current.notifications || []).map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification,
      ),
    }));

    await apiFetch('students/notifications/', {
      auth: true,
      method: 'PATCH',
      body: { notification_id: notificationId },
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#dfe8f5] bg-white px-6 py-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8ea0bd]">Notification Center</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#061b3a]">Notifications</h1>
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={!summary.unread}
            className="inline-flex items-center gap-2 rounded-xl border border-[#d9e4f2] bg-white px-4 py-3 text-sm font-semibold text-[#173b63] transition hover:border-emerald-200 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark read
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <MetricCard icon={Bell} label="Total" value={summary.total || 0} />
          <MetricCard icon={Clock3} label="Unread" value={summary.unread || 0} tone="green" />
          <MetricCard icon={Mail} label="Email" value={summary.email_enabled ? 'On' : 'Off'} />
        </div>
      </section>

      <section className="rounded-3xl border border-[#dfe8f5] bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-[#d9e4f2] py-12 text-center text-sm text-[#7f8da5]">Loading notifications...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">{error}</div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const content = (
                <div
                  className={cx(
                    'group flex items-center gap-4 rounded-2xl border px-4 py-4 transition hover:border-emerald-200 hover:bg-emerald-50/40',
                    notification.is_read ? 'border-[#e5ebf4] bg-white' : 'border-emerald-200 bg-emerald-50/70',
                  )}
                >
                  <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', notification.is_read ? 'bg-[#c9d4e4]' : 'bg-emerald-500')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cx(
                          'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
                          categoryStyles[notification.category] || categoryStyles.system,
                        )}
                      >
                        {notification.category}
                      </span>
                      <span className="text-xs text-[#8090aa]">{formatDateTime(notification.created_at)}</span>
                    </div>
                    <p className="mt-2 truncate text-base font-semibold text-[#061b3a]">{notification.title}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-[#6b7b95]">{notification.message}</p>
                  </div>
                  {notification.action_url ? <MoveUpRight className="h-4.5 w-4.5 text-[#66809f] transition group-hover:text-emerald-600" /> : null}
                </div>
              );

              if (notification.action_url) {
                return (
                  <Link key={notification.id} to={notification.action_url} onClick={() => markOneRead(notification.id)}>
                    {content}
                  </Link>
                );
              }

              return (
                <button key={notification.id} type="button" className="w-full text-left" onClick={() => markOneRead(notification.id)}>
                  {content}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d9e4f2] py-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#9badc6]" />
            <p className="mt-3 text-sm font-semibold text-[#243b59]">No notifications yet</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentNotificationsPage;
