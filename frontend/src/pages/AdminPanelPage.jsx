import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Bell,
  BookCopy,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FileBadge2,
  FileCheck2,
  FileText,
  Film,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  MessageSquareMore,
  NotebookPen,
  PencilLine,
  Plus,
  LogOut,
  Search,
  Settings2,
  ShieldCheck,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { apiFetch } from '../lib/api';
import { ADMIN_NAV_GROUPS, ADMIN_RESOURCES, OPTION_SOURCES } from '../lib/adminResources';
import { clearAuthSession, getStoredUser, isAdminUser, isAuthenticated } from '../lib/auth';
import { extractApiError } from '../lib/errors';

const RESOURCE_ICONS = {
  overview: LayoutDashboard,
  users: ShieldCheck,
  students: GraduationCap,
  mentors: Users,
  categories: BookOpen,
  courses: BookCopy,
  enrollments: CheckCircle2,
  paymentMethods: ShieldCheck,
  assignments: ClipboardList,
  assignmentSubmissions: FileCheck2,
  attendanceSessions: CalendarClock,
  attendanceRecords: BadgeCheck,
  certificateTemplates: FileBadge2,
  issuedCertificates: FileBadge2,
  recordings: Film,
  blogCategories: NotebookPen,
  blogPosts: FileText,
  blogComments: MessageSquareMore,
  freeResources: Globe2,
  siteSettings: Settings2,
  callbackRequests: MessageSquareMore,
};

const RESOURCE_META = {
  overview: {
    eyebrow: 'Operations Console',
    description: 'Track platform activity, academic throughput, content velocity, and support demand from one focused control surface.',
  },
  users: {
    eyebrow: 'Identity',
    description: 'Manage platform access, roles, verification status, and operational account hygiene.',
  },
  students: {
    eyebrow: 'Learners',
    description: 'Review student records, onboarding details, and profile data connected to the learning workspace.',
  },
  mentors: {
    eyebrow: 'Faculty',
    description: 'Maintain mentor profiles, delivery ownership, and platform-wide teaching visibility.',
  },
  categories: {
    eyebrow: 'Catalog',
    description: 'Organize course taxonomy so discovery, filtering, and publishing stay consistent.',
  },
  courses: {
    eyebrow: 'Curriculum',
    description: 'Shape course structure, pricing, presentation, and publishing from a single editorial workspace.',
  },
  enrollments: {
    eyebrow: 'Commerce',
    description: 'Monitor enrollment approvals, verification states, and active course access across the platform.',
  },
  paymentMethods: {
    eyebrow: 'Checkout',
    description: 'Manage active payment QR codes shown to students during enrollment.',
  },
  assignments: {
    eyebrow: 'Assessment',
    description: 'Configure assignment schedules, deadlines, and course-linked task delivery.',
  },
  assignmentSubmissions: {
    eyebrow: 'Review Queue',
    description: 'Inspect submissions, grading states, and learner progress signals with less friction.',
  },
  attendanceSessions: {
    eyebrow: 'Sessions',
    description: 'Control live attendance windows and maintain accurate classroom participation data.',
  },
  attendanceRecords: {
    eyebrow: 'Presence',
    description: 'Audit attendance records with clear traceability back to each learner and session.',
  },
  certificateTemplates: {
    eyebrow: 'Certification',
    description: 'Define certificate systems, branding, and completion assets before issue.',
  },
  issuedCertificates: {
    eyebrow: 'Certification',
    description: 'Track issued credentials, learner completion, and downloadable proof of accomplishment.',
  },
  recordings: {
    eyebrow: 'Media',
    description: 'Maintain the recording library that supports catch-up learning and cohort continuity.',
  },
  blogCategories: {
    eyebrow: 'Editorial',
    description: 'Organize article publishing structure for a cleaner public content system.',
  },
  blogPosts: {
    eyebrow: 'Editorial',
    description: 'Publish, revise, and maintain platform storytelling with production-grade clarity.',
  },
  blogComments: {
    eyebrow: 'Community',
    description: 'Moderate community discussion and keep editorial surfaces healthy and readable.',
  },
  freeResources: {
    eyebrow: 'Acquisition',
    description: 'Manage lead-generating educational resources without breaking the public learning funnel.',
  },
  siteSettings: {
    eyebrow: 'System',
    description: 'Control global site values, support details, and platform-wide operational defaults.',
  },
  callbackRequests: {
    eyebrow: 'Support',
    description: 'Handle inbound callback requests with clear status tracking and response context.',
  },
};

const DEFAULT_ROUTE = 'overview';
const SHELL_EASE = [0.16, 1, 0.3, 1];
const riseIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: SHELL_EASE } },
};
const staggerIn = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) {
    return 'Not set';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat('en-US', options).format(parsed);
};

const toDateInputValue = (value) => {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
};

const toDateTimeInputValue = (value) => {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value).slice(0, 16);
  }
  const offset = parsed.getTimezoneOffset();
  const localDate = new Date(parsed.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 16);
};

const toTimeInputValue = (value) => {
  if (!value) {
    return '';
  }
  return String(value).slice(0, 5);
};

const getDefaultFieldValue = (field) => {
  if (field.type === 'checkbox') {
    return false;
  }
  if (field.type === 'repeater') {
    return [];
  }
  if (field.type === 'file') {
    return null;
  }
  return '';
};

const normalizeFieldValue = (field, rawValue) => {
  if (field.type === 'checkbox') {
    return Boolean(rawValue);
  }
  if (field.type === 'repeater') {
    if (!Array.isArray(rawValue)) {
      return [];
    }
    return rawValue.map((item) => normalizeRepeaterRow(field.itemFields || [], item || {}));
  }
  if (field.type === 'date') {
    return toDateInputValue(rawValue);
  }
  if (field.type === 'datetime-local') {
    return toDateTimeInputValue(rawValue);
  }
  if (field.type === 'time') {
    return toTimeInputValue(rawValue);
  }
  if (field.type === 'file') {
    return rawValue || null;
  }
  if (rawValue === null || rawValue === undefined) {
    return '';
  }
  return rawValue;
};

function normalizeRepeaterRow(itemFields, row) {
  return itemFields.reduce((accumulator, field) => {
    accumulator[field.name] = normalizeFieldValue(field, row?.[field.name]);
    return accumulator;
  }, {});
}

const buildInitialFormState = (resourceConfig, record) => {
  return resourceConfig.fields.reduce((accumulator, field) => {
    accumulator[field.name] = normalizeFieldValue(field, record?.[field.name]);
    return accumulator;
  }, {});
};

const createEmptyRepeaterRow = (itemFields) => {
  return itemFields.reduce((accumulator, field) => {
    accumulator[field.name] = getDefaultFieldValue(field);
    return accumulator;
  }, {});
};

const valueHasContent = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return value !== null && value !== undefined && String(value).trim() !== '';
};

const serializeFieldValue = (field, value) => {
  if (field.type === 'repeater') {
    const serializedRows = (value || [])
      .map((row) => {
        const output = {};
        (field.itemFields || []).forEach((itemField) => {
          const serializedValue = serializeFieldValue(itemField, row?.[itemField.name]);
          if (serializedValue !== undefined) {
            output[itemField.name] = serializedValue;
          }
        });
        return output;
      })
      .filter((row) => Object.values(row).some(valueHasContent));
    return serializedRows;
  }

  if (field.type === 'number') {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    return Number(value);
  }

  if (field.type === 'checkbox') {
    return Boolean(value);
  }

  if (field.type === 'select') {
    if (value === '' || value === undefined) {
      return null;
    }
    return value;
  }

  if (field.type === 'number') {
    if (value === '' || value === undefined || value === null) {
      return null;
    }
    return Number(value);
  }

  if (field.type === 'file') {
    return value instanceof File ? value : undefined;
  }

  if (value === undefined) {
    return undefined;
  }

  return value;
};

const buildSubmitPayload = (resourceConfig, formState) => {
  const hasNewFiles = (resourceConfig.fileFields || []).some((fieldName) => formState[fieldName] instanceof File);

  if (hasNewFiles) {
    const formData = new FormData();
    resourceConfig.fields.forEach((field) => {
      const serializedValue = serializeFieldValue(field, formState[field.name]);
      if (serializedValue === undefined || serializedValue === null) {
        return;
      }

      if (field.type === 'repeater') {
        formData.append(field.name, JSON.stringify(serializedValue));
        return;
      }

      if (field.type === 'checkbox') {
        formData.append(field.name, serializedValue ? 'true' : 'false');
        return;
      }

      formData.append(field.name, serializedValue);
    });
    return formData;
  }

  const payload = {};
  resourceConfig.fields.forEach((field) => {
    const serializedValue = serializeFieldValue(field, formState[field.name]);
    if (serializedValue !== undefined) {
      payload[field.name] = serializedValue;
    }
  });
  return payload;
};

const getIdentifier = (resourceConfig, record) => record?.[resourceConfig.idKey || 'id'];

const getEndpointForRecord = (resourceConfig, record) => {
  const identifier = getIdentifier(resourceConfig, record);
  if (!identifier) {
    return resourceConfig.endpoint;
  }
  return `${resourceConfig.endpoint}${encodeURIComponent(identifier)}/`;
};

const formatCellValue = (column, value) => {
  if (column.type === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (column.type === 'date' || column.type === 'datetime') {
    return formatDate(value);
  }
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  return String(value);
};

const Pill = ({ active, children }) => (
  <span
    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] ${
      active
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-[#e5ebf5] bg-white text-[#7e8ba3]'
    }`}
  >
    {children}
  </span>
);

const formatCompactNumber = (value) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: numericValue >= 1000 ? 1 : 0,
  }).format(numericValue);
};

const formatCurrencyDisplay = (money) => {
  if (money?.display) {
    return money.display;
  }

  const numericValue = Number(money || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numericValue);
};

const getInitials = (value) =>
  String(value || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'DS';

const UtilityPanelHeader = ({ eyebrow, title, subtitle, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      {eyebrow ? <p className="text-[11px] uppercase tracking-[0.18em] text-[#7e8ba3]">{eyebrow}</p> : null}
      <h3 className="mt-1.5 text-[1.45rem] font-semibold tracking-tight text-[#22324d]">{title}</h3>
      {subtitle ? <p className="mt-1.5 text-sm text-[#7e8ba3]">{subtitle}</p> : null}
    </div>
    {action ? <div>{action}</div> : null}
  </div>
);

const MiniBarChart = ({ data = [] }) => {
  const values = data.map((item) => Number(item?.value || 0));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="grid grid-cols-6 gap-3">
      {data.map((item) => {
        const height = `${Math.max((Number(item?.value || 0) / maxValue) * 100, item?.value ? 14 : 6)}%`;
        return (
          <div key={item.label} className="flex min-w-0 flex-col items-center gap-3">
            <div className="flex h-36 w-full items-end rounded-2xl bg-[#f3f6fb] p-2">
              <div
                className="w-full rounded-xl bg-[linear-gradient(180deg,#34d399,#10b981)]"
                style={{ height }}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#22324d]">{formatCompactNumber(item?.value || 0)}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MiniSparkline = ({ values = [], stroke = '#10b981', fill = 'rgba(16,185,129,0.12)' }) => {
  const numericValues = values.map((value) => Number(value || 0));
  const maxValue = Math.max(...numericValues, 1);
  const minValue = Math.min(...numericValues, 0);
  const width = 240;
  const height = 72;
  const step = numericValues.length > 1 ? width / (numericValues.length - 1) : width;
  const normalize = (value) => {
    if (maxValue === minValue) {
      return height / 2;
    }
    return height - ((value - minValue) / (maxValue - minValue)) * (height - 10) - 5;
  };
  const points = numericValues.map((value, index) => `${index * step},${normalize(value)}`).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[68px] w-full overflow-visible">
      <polyline fill={fill} points={areaPoints} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const WorkspacePanel = ({ className = '', children }) => (
  <div
    className={`relative overflow-hidden rounded-[1.1rem] border border-[#e5ebf5] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] ${className}`}
  >
    <div className="relative">{children}</div>
  </div>
);

const AdminSidebar = ({ activeKey }) => {
  return (
    <motion.aside variants={riseIn} initial="hidden" animate="show" className="xl:sticky xl:top-0 xl:self-start">
      <div className="border-b border-[#e6ecf5] bg-white xl:min-h-screen xl:border-b-0 xl:border-r">
        <div className="border-b border-[#eef2f7] px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Brain className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[1.6rem] font-semibold tracking-tight text-[#22324d]">Design School</h1>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-3 py-5">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">{group.label}</p>
              </div>

              <div className="space-y-1">
                {group.items.map((resourceKey) => {
                  const resource = ADMIN_RESOURCES[resourceKey];
                  const Icon = RESOURCE_ICONS[resourceKey] || LayoutDashboard;
                  const isActive = activeKey === resourceKey;

                  return (
                    <Link
                      key={resourceKey}
                      to={resourceKey === DEFAULT_ROUTE ? '/admin-panel' : `/admin-panel/${resourceKey}`}
                      className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[1rem] transition ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-700'
                          : 'text-[#4c6080] hover:bg-[#f5f7fb] hover:text-[#22324d]'
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-emerald-600' : 'text-[#7387a5] group-hover:text-[#22324d]'}`} />
                      </span>
                      <p className="truncate font-medium">{resource.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

const AdminOverview = ({ data, isLoading }) => {
  const kpis = data?.kpis || {};
  const enrollmentSeries = data?.enrollment_series?.length
    ? data.enrollment_series
    : [
        { label: 'Jan', value: 0 },
        { label: 'Feb', value: 0 },
        { label: 'Mar', value: 0 },
        { label: 'Apr', value: 0 },
        { label: 'May', value: 0 },
        { label: 'Jun', value: 0 },
      ];
  const categoryBreakdown = data?.category_breakdown || [];
  const topCourses = data?.top_courses || [];
  const topInstructors = data?.top_instructors || [];
  const recentCallbacks = data?.recent_callbacks || [];
  const sparklineValues = enrollmentSeries.map((item) => item.value);
  const categoryColors = ['#ff8a3d', '#6aa8ff', '#7de1b8', '#6f7ee8', '#66dfd1', '#ff63b8', '#6b39ff'];

  return (
    <motion.div variants={staggerIn} initial="hidden" animate="show" className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(0,1.55fr)]">
        <motion.section variants={riseIn} className="xl:col-span-2">
          <WorkspacePanel className="p-6">
            <UtilityPanelHeader eyebrow="" title="Students Enrolment" subtitle="In last 30 days enrolment of students" />

            <div className="mt-6 grid gap-6 lg:grid-cols-[auto_auto_minmax(0,1fr)] lg:items-end">
              <div>
                <p className="text-[3rem] font-light leading-none text-[#22324d]">
                  {isLoading ? '...' : formatCompactNumber(kpis.enrollment_month?.value || 0)}
                </p>
                <p className="mt-3 text-sm text-[#8a99b1]">{kpis.enrollment_month?.label || 'This Month'}</p>
              </div>

              <div>
                <p className="text-[3rem] font-light leading-none text-[#22324d]">
                  {isLoading ? '...' : formatCompactNumber(kpis.enrollment_week?.value || 0)}
                </p>
                <p className="mt-3 text-sm text-[#8a99b1]">{kpis.enrollment_week?.label || 'This Week'}</p>
              </div>

              <MiniBarChart data={enrollmentSeries} />
            </div>
          </WorkspacePanel>
        </motion.section>

        <motion.section variants={riseIn} className="xl:row-span-2">
          <WorkspacePanel className="h-full p-6">
            <UtilityPanelHeader eyebrow="" title="Top Categories" subtitle="In last 15 days buy and sells overview." />

            <div className="mt-8 space-y-5">
              {categoryBreakdown.length ? (
                categoryBreakdown.map((item, index) => (
                  <div key={item.name} className="grid grid-cols-[minmax(0,1fr)_150px] items-center gap-6">
                    <div className="h-2 overflow-hidden rounded-full bg-[#edf2f8]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(item.share, item.value ? 14 : 0)}%`,
                          backgroundColor: categoryColors[index % categoryColors.length],
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#3f4f6a]">
                      <span
                        className="h-3 w-3 rounded-sm"
                        style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8a99b1]">No category activity yet.</p>
              )}
            </div>
          </WorkspacePanel>
        </motion.section>

        <motion.section variants={riseIn}>
          <WorkspacePanel className="p-6">
            <UtilityPanelHeader eyebrow="" title="Total Sales" />
            <div className="mt-5">
              <p className="text-[2.7rem] font-light leading-none text-[#22324d]">
                {isLoading ? '...' : formatCurrencyDisplay(kpis.revenue_total)}
              </p>
              <div className="mt-6">
                <MiniSparkline values={sparklineValues} stroke="#6b39ff" fill="rgba(107,57,255,0.08)" />
              </div>
            </div>
          </WorkspacePanel>
        </motion.section>

        <motion.section variants={riseIn}>
          <WorkspacePanel className="p-6">
            <UtilityPanelHeader eyebrow="" title="This week so far" />
            <div className="mt-5">
              <p className="text-[2.7rem] font-light leading-none text-[#22324d]">
                {isLoading ? '...' : formatCurrencyDisplay(kpis.revenue_week)}
              </p>
              <div className="mt-6">
                <MiniSparkline values={[...sparklineValues].reverse()} stroke="#2f6df6" fill="rgba(47,109,246,0.08)" />
              </div>
            </div>
          </WorkspacePanel>
        </motion.section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <motion.section variants={riseIn}>
          <WorkspacePanel className="p-0">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-5">
              <h3 className="text-[1.6rem] font-semibold tracking-tight text-[#22324d]">Top Courses</h3>
              <button className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">Weekly</button>
            </div>

            <div>
              {topCourses.length ? (
                topCourses.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid gap-4 px-6 py-5 md:grid-cols-[44px_minmax(0,1fr)_auto] md:items-start ${
                      index !== topCourses.length - 1 ? 'border-b border-[#eef2f7]' : ''
                    }`}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold"
                      style={{
                        backgroundColor: `${categoryColors[index % categoryColors.length]}1A`,
                        color: categoryColors[index % categoryColors.length],
                      }}
                    >
                      {getInitials(item.category)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#22324d]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#7e8ba3]">{item.price.display}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#22324d]">{item.revenue.display}</p>
                      <p className="mt-1 text-sm text-[#8a99b1]">{item.sold} Sold</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-sm text-[#8a99b1]">No course performance data yet.</div>
              )}
            </div>
          </WorkspacePanel>
        </motion.section>

        <motion.section variants={riseIn}>
          <WorkspacePanel className="p-0">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-5">
              <h3 className="text-[1.6rem] font-semibold tracking-tight text-[#22324d]">Top Instructors</h3>
              <button className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">View All</button>
            </div>

            <div>
              {topInstructors.length ? (
                topInstructors.map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid gap-4 px-6 py-5 md:grid-cols-[48px_minmax(0,1fr)_auto] md:items-center ${
                      index !== topInstructors.length - 1 ? 'border-b border-[#eef2f7]' : ''
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${categoryColors[(index + 1) % categoryColors.length]}20`,
                        color: categoryColors[(index + 1) % categoryColors.length],
                      }}
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#22324d]">{item.name}</p>
                      <p className="mt-1 text-sm text-[#8a99b1]">{item.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end gap-0.5 text-[#f5b50a]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-[#5e6f89]">{item.review_total || 0} Reviews</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-sm text-[#8a99b1]">No mentor data yet.</div>
              )}
            </div>
          </WorkspacePanel>
        </motion.section>

        <motion.section variants={riseIn}>
          <WorkspacePanel className="p-0">
            <div className="flex items-center justify-between border-b border-[#eef2f7] px-6 py-5">
              <h3 className="text-[1.6rem] font-semibold tracking-tight text-[#22324d]">Support Requests</h3>
              <button className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">All Requests</button>
            </div>

            <div>
              {recentCallbacks.length ? (
                recentCallbacks.slice(0, 4).map((item, index) => (
                  <div
                    key={item.id}
                    className={`grid gap-4 px-6 py-5 md:grid-cols-[48px_minmax(0,1fr)_auto] md:items-start ${
                      index !== Math.min(recentCallbacks.length, 4) - 1 ? 'border-b border-[#eef2f7]' : ''
                    }`}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${categoryColors[(index + 3) % categoryColors.length]}1F`,
                        color: categoryColors[(index + 3) % categoryColors.length],
                      }}
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#22324d]">{item.name}</p>
                      <p className="mt-1 truncate text-sm text-[#6b7b95]">{item.enquiry_for}</p>
                      <p className="mt-2 text-sm text-[#9aa8bd]">{formatDate(item.created_at, { minute: '2-digit', hour: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span
                      className={`mt-2 inline-flex h-2.5 w-2.5 rounded-full ${
                        String(item.status || '').toLowerCase() === 'resolved' ? 'bg-emerald-500' : 'bg-[#22324d]'
                      }`}
                    />
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-sm text-[#8a99b1]">No support requests yet.</div>
              )}
            </div>
          </WorkspacePanel>
        </motion.section>
      </div>
    </motion.div>
  );
};

const RepeaterField = ({ field, value, onChange, optionSets, level = 0 }) => {
  const rows = Array.isArray(value) ? value : [];

  const updateRow = (rowIndex, fieldName, nextValue) => {
    onChange(
      rows.map((row, index) => (index === rowIndex ? { ...row, [fieldName]: nextValue } : row)),
    );
  };

  const addRow = () => {
    onChange([...rows, createEmptyRepeaterRow(field.itemFields || [])]);
  };

  const removeRow = (rowIndex) => {
    onChange(rows.filter((_, index) => index !== rowIndex));
  };

  return (
    <div className={`rounded-2xl border border-[#e5ebf5] bg-[#f8fafc] p-4 ${level > 0 ? 'mt-4' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#22324d]">{field.label}</p>
          {field.helper ? <p className="mt-1 text-xs text-[#8a99b1]">{field.helper}</p> : null}
        </div>
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-700 transition hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {rows.length ? (
          rows.map((row, rowIndex) => (
            <div key={`${field.name}-${rowIndex}`} className="rounded-2xl border border-[#e5ebf5] bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.14em] text-[#8a99b1]">
                  {field.itemLabel || 'Item'} {rowIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeRow(rowIndex)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {(field.itemFields || []).map((subField) => (
                  <FieldRenderer
                    key={`${field.name}-${rowIndex}-${subField.name}`}
                    field={subField}
                    value={row[subField.name]}
                    onChange={(nextValue) => updateRow(rowIndex, subField.name, nextValue)}
                    optionSets={optionSets}
                    level={level + 1}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-[#d5deea] bg-white p-4 text-sm text-[#8a99b1]">
            No items added yet.
          </div>
        )}
      </div>
    </div>
  );
};

const FieldRenderer = ({ field, value, onChange, optionSets, level = 0 }) => {
  if (field.type === 'repeater') {
    return (
      <div className="md:col-span-2">
        <RepeaterField field={field} value={value} onChange={onChange} optionSets={optionSets} level={level} />
      </div>
    );
  }

  const options =
    field.options ||
    (field.optionSource ? optionSets[field.optionSource] || [] : []);

  const label = (
    <label className="mb-2 block text-sm font-medium text-[#45556f]">
      {field.label}
      {field.required ? <span className="ml-1 text-emerald-600">*</span> : null}
    </label>
  );

  const sharedClassName =
    'w-full rounded-2xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#22324d] outline-none transition placeholder:text-[#a0aec0] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

  if (field.type === 'textarea') {
    return (
      <div className="md:col-span-2">
        {label}
        <textarea
          className={`${sharedClassName} min-h-[140px] resize-y`}
          value={value || ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ''}
        />
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        {label}
        <select
          className={sharedClassName}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={`${field.name}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <div className="rounded-2xl border border-[#e5ebf5] bg-[#f8fafc] p-4">
        <label className="flex items-center justify-between gap-3 text-sm text-[#45556f]">
          <span>{field.label}</span>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-emerald-500"
          />
        </label>
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div>
        {label}
        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d5deea] bg-[#f8fafc] px-4 py-5 text-center text-sm text-[#7e8ba3] transition hover:border-emerald-300 hover:text-[#22324d]">
          <input
            type="file"
            className="hidden"
            onChange={(event) => onChange(event.target.files?.[0] || null)}
          />
          <span className="font-medium text-[#22324d]">
            {value instanceof File ? value.name : value ? 'Current file attached' : 'Choose a file'}
          </span>
          <span className="mt-1 text-xs text-[#9aa8bd]">
            {value && !(value instanceof File) ? 'Leave empty to keep the current file.' : 'Upload a replacement if needed.'}
          </span>
        </label>
      </div>
    );
  }

  return (
    <div>
      {label}
      <input
        type={field.type || 'text'}
        min={field.min}
        step={field.step}
        className={sharedClassName}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder || ''}
      />
      {field.helper ? <p className="mt-2 text-xs text-[#8a99b1]">{field.helper}</p> : null}
    </div>
  );
};

const ResourceTable = ({ resourceKey, resourceConfig, items, searchTerm, onEdit, onDelete, onCreate }) => {
  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const lowered = searchTerm.trim().toLowerCase();
    return items.filter((item) =>
      resourceConfig.columns.some((column) => String(item?.[column.key] ?? '').toLowerCase().includes(lowered)),
    );
  }, [items, resourceConfig.columns, searchTerm]);

  return (
    <motion.div variants={riseIn}>
      <WorkspacePanel>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef2f7] px-5 py-5 md:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#94a3b8]">{RESOURCE_META[resourceKey]?.eyebrow || 'Collection'}</p>
            <p className="mt-1.5 text-[1.45rem] font-semibold text-[#22324d]">{resourceConfig.title}</p>
            <p className="mt-1.5 text-sm text-[#7e8ba3]">
              {filteredItems.length} {resourceConfig.singularLabel}
              {filteredItems.length === 1 ? '' : 's'} in the current workspace view
            </p>
          </div>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <Plus className="h-4 w-4" />
            Add {resourceConfig.singularLabel}
          </button>
        </div>

        <div className="overflow-x-auto px-2 pb-2">
          <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm text-[#41526d]">
            <thead className="text-[11px] uppercase tracking-[0.14em] text-[#94a3b8]">
              <tr>
                {resourceConfig.columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 font-medium first:pl-6">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 pr-6 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr
                  key={`${resourceConfig.title}-${getIdentifier(resourceConfig, item)}`}
                  className="rounded-[1rem] bg-[#fdfefe] transition hover:bg-[#f8fbff]"
                >
                  {resourceConfig.columns.map((column, columnIndex) => (
                    <td
                      key={`${column.key}-${getIdentifier(resourceConfig, item)}`}
                      className={`border-y border-[#edf2f7] px-4 py-4 align-top ${columnIndex === 0 ? 'rounded-l-[1rem] border-l pl-6 font-medium text-[#22324d]' : ''}`}
                    >
                      {column.type === 'boolean' ? (
                        <Pill active={item?.[column.key] === true}>{item?.[column.key] === true ? 'Yes' : 'No'}</Pill>
                      ) : (
                        formatCellValue(column, item?.[column.key])
                      )}
                    </td>
                  ))}
                  <td className="rounded-r-[1rem] border-y border-r border-[#edf2f7] px-4 py-4 pr-6">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#4c6080] transition hover:bg-[#f5f8fc] hover:text-[#22324d]"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs uppercase tracking-[0.14em] text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filteredItems.length ? (
          <div className="border-t border-[#eef2f7] px-6 py-14 text-center text-sm text-[#8a99b1]">
            Nothing matched the current search.
          </div>
        ) : null}
      </WorkspacePanel>
    </motion.div>
  );
};

const Drawer = ({ title, children, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-[4px]"
  >
    <motion.div
      initial={{ y: 28, opacity: 0, scale: 0.985 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 28, opacity: 0, scale: 0.985 }}
      transition={{ duration: 0.45, ease: SHELL_EASE }}
      onClick={(event) => event.stopPropagation()}
      className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-[1.4rem] border border-[#dde6f1] bg-[#f5f7fb] p-5 shadow-[0_28px_90px_rgba(15,23,42,0.18)] md:p-6"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#e5ebf5] pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#94a3b8]">Editor</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-[#22324d]">{title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#dbe4f0] bg-white text-[#60748f] transition hover:bg-[#f5f8fc] hover:text-[#22324d]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-6">{children}</div>
    </motion.div>
  </motion.div>
);

const SingletonEditor = ({ resourceKey, resourceConfig, record, onSave, isSaving, optionSets, error }) => {
  const [formState, setFormState] = useState(() => buildInitialFormState(resourceConfig, record));

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(formState, record);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={riseIn}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl"
    >
      <WorkspacePanel className="p-5 md:p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#eef2f7] pb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#94a3b8]">{RESOURCE_META[resourceKey]?.eyebrow || 'System'}</p>
            <h2 className="mt-1.5 text-2xl font-semibold text-[#22324d]">{resourceConfig.title}</h2>
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save Settings
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {resourceConfig.fields.map((field) => (
            <FieldRenderer
              key={field.name}
              field={field}
              value={formState[field.name]}
              onChange={(nextValue) => setFormState((current) => ({ ...current, [field.name]: nextValue }))}
              optionSets={optionSets}
            />
          ))}
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </WorkspacePanel>
    </motion.form>
  );
};

const AdminPanelPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const routeResourceKey = params.resourceKey || DEFAULT_ROUTE;
  const currentResourceKey = ADMIN_RESOURCES[routeResourceKey] ? routeResourceKey : DEFAULT_ROUTE;
  const resourceConfig = ADMIN_RESOURCES[currentResourceKey];
  const storedUser = getStoredUser();

  const [dashboardData, setDashboardData] = useState(null);
  const [resourceItems, setResourceItems] = useState([]);
  const [optionSets, setOptionSets] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeRecord, setActiveRecord] = useState(null);
  const [draftState, setDraftState] = useState(null);

  useEffect(() => {
    document.title = `${resourceConfig.title} | Admin Panel`;
  }, [resourceConfig.title]);

  const loadOptionSets = async (fields) => {
    const optionKeys = Array.from(
      new Set(
        (fields || [])
          .flatMap((field) => collectOptionSources(field))
          .filter(Boolean),
      ),
    );

    const loadedOptions = {};
    await Promise.all(
      optionKeys.map(async (key) => {
        const source = OPTION_SOURCES[key];
        if (!source) {
          loadedOptions[key] = [];
          return;
        }

        const { response, payload } = await apiFetch(source.endpoint, { auth: true });
        if (response.status === 401 || response.status === 403) {
          throw new Error('unauthorized');
        }
        const items = Array.isArray(payload) ? payload : payload?.results || payload?.data?.items || [];
        loadedOptions[key] = items.map((item) => ({
          value: source.getValue(item),
          label: source.getLabel(item),
        }));
      }),
    );

    return loadedOptions;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadPage = async () => {
      setIsLoading(true);
      setPageError('');
      setSearchTerm('');
      setActiveRecord(null);
      setDraftState(null);

      try {
        const nextOptionSets = resourceConfig.fields ? await loadOptionSets(resourceConfig.fields) : {};
        if (isCancelled) {
          return;
        }
        setOptionSets(nextOptionSets);

        if (resourceConfig.kind === 'dashboard') {
          const { response, payload } = await apiFetch('admin/dashboard/', { auth: true });
          if (response.status === 401 || response.status === 403) {
            throw new Error('unauthorized');
          }
          if (!response.ok || !payload?.data) {
            throw new Error(extractApiError(payload, 'Unable to load the admin overview.'));
          }
          if (!isCancelled) {
            setDashboardData(payload.data);
          }
          return;
        }

        const { response, payload } = await apiFetch(resourceConfig.endpoint, { auth: true });
        if (response.status === 401 || response.status === 403) {
          throw new Error('unauthorized');
        }

        const items = Array.isArray(payload) ? payload : payload?.results || payload?.data?.items || payload?.data?.resources || [];
        if (!response.ok) {
          throw new Error(extractApiError(payload, `Unable to load ${resourceConfig.title.toLowerCase()}.`));
        }

        if (!isCancelled) {
          setResourceItems(items);
        }
      } catch (error) {
        if (isCancelled) {
          return;
        }

        if (error.message === 'unauthorized') {
          clearAuthSession();
          navigate('/login', { replace: true });
          return;
        }

        setPageError(error.message || 'Unable to load the admin panel.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      isCancelled = true;
    };
  }, [navigate, resourceConfig]);

  const openEditor = (record = null) => {
    setSaveError('');
    setActiveRecord(record);
    setDraftState(buildInitialFormState(resourceConfig, record));
  };

  const closeEditor = () => {
    setActiveRecord(null);
    setDraftState(null);
    setSaveError('');
  };

  const handleSaveRecord = async (formState, record) => {
    setIsSaving(true);
    setSaveError('');

    try {
      const isUpdating = Boolean(record);
      const endpoint =
        resourceConfig.kind === 'singleton'
          ? getEndpointForRecord(resourceConfig, record)
          : isUpdating
            ? getEndpointForRecord(resourceConfig, record)
            : resourceConfig.endpoint;

      const { response, payload } = await apiFetch(endpoint, {
        auth: true,
        method: isUpdating ? 'PATCH' : 'POST',
        body: buildSubmitPayload(resourceConfig, formState),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('unauthorized');
      }

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to save this item.'));
      }

      if (resourceConfig.kind === 'singleton') {
        const refreshed = await apiFetch(resourceConfig.endpoint, { auth: true });
        const nextItems = Array.isArray(refreshed.payload) ? refreshed.payload : [];
        setResourceItems(nextItems);
      } else {
        const refreshed = await apiFetch(resourceConfig.endpoint, { auth: true });
        const nextItems = Array.isArray(refreshed.payload)
          ? refreshed.payload
          : refreshed.payload?.results || refreshed.payload?.data?.items || refreshed.payload?.data?.resources || [];
        setResourceItems(nextItems);
      }

      closeEditor();
    } catch (error) {
      if (error.message === 'unauthorized') {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      setSaveError(error.message || 'Unable to save this item.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    const label = record?.title || record?.name || getIdentifier(resourceConfig, record);
    const confirmed = window.confirm(`Delete ${resourceConfig.singularLabel} "${label}"? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      const endpoint = getEndpointForRecord(resourceConfig, record);
      const { response, payload } = await apiFetch(endpoint, {
        auth: true,
        method: 'DELETE',
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('unauthorized');
      }

      if (!response.ok && response.status !== 204) {
        throw new Error(extractApiError(payload, 'Unable to delete this item.'));
      }

      setResourceItems((current) =>
        current.filter((item) => getIdentifier(resourceConfig, item) !== getIdentifier(resourceConfig, record)),
      );
    } catch (error) {
      if (error.message === 'unauthorized') {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }
      setPageError(error.message || 'Unable to delete this item.');
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  const currentIcon = RESOURCE_ICONS[currentResourceKey] || LayoutDashboard;
  const CurrentIcon = currentIcon;
  const singletonRecord = resourceItems[0] || null;
  const workspaceCount =
    resourceConfig.kind === 'dashboard'
      ? dashboardData?.stats?.published_courses ?? 0
      : resourceConfig.kind === 'singleton'
        ? (singletonRecord ? 1 : 0)
        : resourceItems.length;
  const handleSignOut = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };
  const searchPlaceholder =
    resourceConfig.kind === 'dashboard'
      ? 'Search anything'
      : `Search ${resourceConfig.title.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#22324d] selection:bg-emerald-100 selection:text-emerald-900">
      <main className="grid min-h-screen xl:grid-cols-[290px_minmax(0,1fr)]">
        <AdminSidebar activeKey={currentResourceKey} />

        <div className="min-w-0">
            <header className="sticky top-0 z-10 border-b border-[#e6ecf5] bg-white/95 backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative hidden max-w-[440px] flex-1 md:block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a0b8]" />
                    <input
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full rounded-xl border border-[#e3e9f3] bg-[#fbfcfe] py-3 pl-11 pr-4 text-sm text-[#22324d] outline-none transition placeholder:text-[#9aa8bd] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder={searchPlaceholder}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#6d7f99] transition hover:bg-[#f3f6fb] hover:text-[#22324d]"
                  >
                    <Bell className="h-4.5 w-4.5" />
                  </button>
                  <div className="hidden items-center gap-3 md:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700">
                      {getInitials(storedUser?.email || 'Admin')}
                    </div>
                    <div className="leading-tight">
                      <p className="text-xs text-[#8a99b1]">Administrator</p>
                      <p className="text-sm font-medium text-[#22324d]">{storedUser?.email || 'admin@designschool.com'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e3e9f3] bg-white px-3 py-2.5 text-sm text-[#5e6f89] transition hover:bg-[#f8fafc] hover:text-[#22324d]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </header>

            <div className="px-5 py-6 md:px-8">
              <motion.section initial="hidden" animate="show" variants={staggerIn} className="mb-6">
                <motion.div variants={riseIn} className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <CurrentIcon className="h-6 w-6 text-emerald-600" />
                      <h1 className="text-[2.2rem] font-semibold tracking-tight text-[#22324d]">
                        {resourceConfig.kind === 'dashboard' ? 'Dashboard' : resourceConfig.title}
                      </h1>
                    </div>
                    {resourceConfig.kind === 'dashboard' ? (
                      <p className="mt-2 text-sm text-[#7e8ba3]">Welcome to Learning Management Dashboard.</p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {resourceConfig.kind === 'dashboard' ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg border border-[#dce5f0] bg-white px-4 py-3 text-sm font-medium text-[#33435f] transition hover:bg-[#f8fafc]"
                        >
                          <CalendarClock className="h-4 w-4" />
                          Last 30 Days
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          <FileText className="h-4 w-4" />
                          Reports
                        </button>
                      </>
                    ) : resourceConfig.kind !== 'singleton' ? (
                      <>
                        <Pill active={false}>{workspaceCount} records</Pill>
                        <button
                          type="button"
                          onClick={() => openEditor(null)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          <Plus className="h-4 w-4" />
                          Add {resourceConfig.singularLabel}
                        </button>
                      </>
                    ) : (
                      <Pill active={false}>Global settings</Pill>
                    )}
                  </div>
                </motion.div>
              </motion.section>

              <div className="space-y-6">
              {pageError ? (
                <WorkspacePanel className="border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {pageError}
                </WorkspacePanel>
              ) : null}

              {isLoading ? (
                <WorkspacePanel className="flex min-h-[320px] items-center justify-center">
                  <div className="flex items-center gap-3 text-[#5e6f89]">
                    <LoaderCircle className="h-5 w-5 animate-spin text-emerald-500" />
                    Loading admin workspace...
                  </div>
                </WorkspacePanel>
              ) : resourceConfig.kind === 'dashboard' ? (
                <AdminOverview data={dashboardData} isLoading={isLoading} />
              ) : resourceConfig.kind === 'singleton' ? (
                <SingletonEditor
                  resourceKey={currentResourceKey}
                  key={`${currentResourceKey}-${getIdentifier(resourceConfig, singletonRecord) || 'new'}`}
                  resourceConfig={resourceConfig}
                  record={singletonRecord}
                  onSave={handleSaveRecord}
                  isSaving={isSaving}
                  optionSets={optionSets}
                  error={saveError}
                />
              ) : (
                <ResourceTable
                  resourceKey={currentResourceKey}
                  resourceConfig={resourceConfig}
                  items={resourceItems}
                  searchTerm={searchTerm}
                  onEdit={openEditor}
                  onDelete={handleDeleteRecord}
                  onCreate={() => openEditor(null)}
                />
              )}
              </div>
            </div>
        </div>
      </main>

      <AnimatePresence>
        {draftState && resourceConfig.kind !== 'singleton' ? (
          <Drawer
            title={`${activeRecord ? 'Edit' : 'Create'} ${resourceConfig.singularLabel}`}
            onClose={closeEditor}
          >
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await handleSaveRecord(draftState, activeRecord);
              }}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {resourceConfig.fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={draftState[field.name]}
                    onChange={(nextValue) =>
                      setDraftState((current) => ({
                        ...current,
                        [field.name]: nextValue,
                      }))
                    }
                    optionSets={optionSets}
                  />
                ))}
              </div>

              {saveError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#e5ebf5] pt-4">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#5e6f89] transition hover:bg-[#f8fafc] hover:text-[#22324d]"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    {activeRecord ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </div>
            </form>
          </Drawer>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

function collectOptionSources(field) {
  if (!field) {
    return [];
  }

  if (field.type === 'repeater') {
    return (field.itemFields || []).flatMap(collectOptionSources);
  }

  return field.optionSource ? [field.optionSource] : [];
}

export default AdminPanelPage;
