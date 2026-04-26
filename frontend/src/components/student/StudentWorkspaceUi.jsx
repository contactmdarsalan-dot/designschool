import { CircleAlert, LoaderCircle } from 'lucide-react';

import { cx } from '../../lib/studentWorkspace';

export const WorkspacePanel = ({ className = '', eyebrow, title, description, action, children }) => (
  <section
    className={cx(
      'relative overflow-hidden rounded-[1.1rem] border border-[#e5ebf5] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]',
      className,
    )}
  >
    {(eyebrow || title || description || action) && (
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fa0bb]">{eyebrow}</p> : null}
          {title ? <h2 className="mt-1 text-[1.55rem] font-semibold tracking-tight text-[#22324d]">{title}</h2> : null}
          {description ? <p className="mt-2 text-sm text-[#7e8ba3]">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    )}
    <div className={cx(eyebrow || title || description || action ? 'px-6 pb-6 pt-5' : 'p-6', 'min-w-0')}>{children}</div>
  </section>
);

export const MetricTile = ({ label, value, hint, tone = 'default' }) => {
  const tones = {
    default: 'border-[#e6edf6] bg-white',
    accent: 'border-emerald-100 bg-emerald-50/80',
  };

  return (
    <div className={cx('rounded-[1rem] border px-5 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]', tones[tone] || tones.default)}>
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">{label}</p>
      <p className="mt-3 text-[2rem] font-semibold leading-none tracking-tight text-[#22324d]">{value}</p>
      {hint ? <p className="mt-2 text-sm text-[#7e8ba3]">{hint}</p> : null}
    </div>
  );
};

export const StatusBadge = ({ value, tone = 'neutral' }) => {
  const tones = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-red-200 bg-red-50 text-red-700',
    info: 'border-sky-200 bg-sky-50 text-sky-700',
    neutral: 'border-[#e5ebf5] bg-[#f8fbff] text-[#6b7d97]',
  };

  return (
    <span className={cx('inline-flex rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.18em]', tones[tone] || tones.neutral)}>
      {value}
    </span>
  );
};

export const EmptyWorkspaceState = ({ title, description, action }) => (
  <div className="rounded-[1.2rem] border border-dashed border-[#dbe5f2] bg-[#fbfcfe] px-5 py-12 text-center">
    <p className="text-lg font-medium text-[#22324d]">{title}</p>
    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#7e8ba3]">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const WorkspaceError = ({ message }) => (
  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <div className="flex items-start gap-3">
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  </div>
);

export const WorkspaceLoading = ({ label = 'Loading workspace...' }) => (
  <div className="flex min-h-[260px] items-center justify-center rounded-[1.1rem] border border-[#e5ebf5] bg-white px-5 py-10 text-[#5e6f89] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
    <div className="flex items-center gap-3">
      <LoaderCircle className="h-5 w-5 animate-spin text-emerald-500" />
      <span>{label}</span>
    </div>
  </div>
);

export const MiniBarChart = ({ data = [] }) => {
  const values = data.map((item) => Number(item?.value || 0));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="grid grid-cols-6 gap-3">
      {data.map((item) => {
        const height = `${Math.max((Number(item?.value || 0) / maxValue) * 100, item?.value ? 12 : 6)}%`;
        return (
          <div key={item.label} className="flex min-w-0 flex-col items-center gap-3">
            <div className="flex h-28 w-full items-end rounded-2xl bg-[#f3f6fb] p-2">
              <div className="w-full rounded-xl bg-[linear-gradient(180deg,#34d399,#10b981)]" style={{ height }} />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-[#22324d]">{item.value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MiniSparkline = ({ values = [], stroke = '#10b981', fill = 'rgba(16,185,129,0.12)' }) => {
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
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[70px] w-full overflow-visible">
      <polyline fill={fill} points={areaPoints} />
      <polyline fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

export const HorizontalMeter = ({ label, value, total, colorClass = 'bg-emerald-500' }) => {
  const safeTotal = Math.max(Number(total || 0), 1);
  const width = `${Math.min((Number(value || 0) / safeTotal) * 100, 100)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[#33435f]">{label}</p>
        <p className="text-sm text-[#7e8ba3]">{value}</p>
      </div>
      <div className="h-2 rounded-full bg-[#edf2f8]">
        <div className={cx('h-2 rounded-full', colorClass)} style={{ width }} />
      </div>
    </div>
  );
};
