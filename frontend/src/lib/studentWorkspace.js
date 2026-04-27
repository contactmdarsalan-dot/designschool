import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck2,
  LayoutDashboard,
  ListTodo,
  PlayCircle,
  UserRound,
} from 'lucide-react';

export const STUDENT_WORKSPACE_NAV = [
  {
    key: 'overview',
    label: 'Dashboard',
    to: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview',
  },
  {
    key: 'courses',
    label: 'Courses',
    to: '/dashboard/courses',
    icon: BookOpen,
    description: 'Active learning',
  },
  {
    key: 'assignments',
    label: 'Assignments',
    to: '/dashboard/assignments',
    icon: ListTodo,
    description: 'Deadlines and submissions',
  },
  {
    key: 'recordings',
    label: 'Recordings',
    to: '/dashboard/recordings',
    icon: PlayCircle,
    description: 'Replay center',
  },
  {
    key: 'attendance',
    label: 'Attendance',
    to: '/dashboard/attendance',
    icon: CalendarCheck2,
    description: 'Session history',
  },
  {
    key: 'certificates',
    label: 'Certificates',
    to: '/dashboard/certificates',
    icon: Award,
    description: 'Proof of completion',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    to: '/dashboard/notifications',
    icon: Bell,
    description: 'Alerts and email',
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/dashboard/profile',
    icon: UserRound,
    description: 'Account settings',
  },
];

export const getStudentWorkspaceMeta = (pathname) => {
  const normalizedPath = pathname || '/dashboard';
  const sorted = [...STUDENT_WORKSPACE_NAV].sort((left, right) => right.to.length - left.to.length);
  return sorted.find((item) => normalizedPath === item.to || normalizedPath.startsWith(`${item.to}/`)) || STUDENT_WORKSPACE_NAV[0];
};

export const formatDate = (value, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  if (!value) {
    return 'Not scheduled';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Not scheduled';
  }

  return new Intl.DateTimeFormat('en-US', options).format(parsed);
};

export const formatTime = (value) => {
  if (!value) {
    return 'TBA';
  }

  const [hours = '00', minutes = '00'] = String(value).split(':');
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
};

export const formatDateTime = (value) => {
  if (!value) {
    return 'Not available';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsed);
};

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'N/A';
  }

  return `${Math.round(Number(value))}%`;
};

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(value || 0));

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const getInitials = (value) =>
  String(value || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'DS';

export const cx = (...values) => values.filter(Boolean).join(' ');
