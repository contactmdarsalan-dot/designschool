import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock3,
  LoaderCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
  EmptyWorkspaceState,
  MetricTile,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { API_BASE_URL, apiFetch } from '../lib/api';
import { clearAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';
import { cx, formatCurrency, formatDate } from '../lib/studentWorkspace';
import { pageTransition, SHELL_EASE } from '../lib/studentWorkspaceMotion';

const enrollmentTone = (status) => {
  if (status === 'verified') {
    return 'success';
  }
  if (status === 'pending') {
    return 'warning';
  }
  return 'info';
};

const initialSubmitState = {
  isSubmitting: false,
  error: '',
  success: '',
};

const resolveMediaUrl = (value) => {
  if (!value) {
    return '';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const apiOrigin = new URL(API_BASE_URL).origin;
    return value.startsWith('/')
      ? `${apiOrigin}${value}`
      : `${apiOrigin}/${value.replace(/^\/+/, '')}`;
  } catch {
    return value;
  }
};

const StudentJoinCoursePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data, setData, isLoading, error } = useStudentWorkspaceResource(
    'students/join-course/',
    {
      profile: {},
      summary: {},
      courses: [],
      payment_methods: [],
    },
    'Unable to load course enrollment.',
  );

  const [query, setQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [step, setStep] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState();
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [qrImageFailed, setQrImageFailed] = useState(false);
  const [submitState, setSubmitState] = useState(initialSubmitState);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return data.courses;
    }

    return data.courses.filter((course) =>
      [course.title, course.category, course.mentor_name, course.short_description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [data.courses, query]);

  const selectedCourse = data.courses.find((course) => course.id === selectedCourseId) || null;
  const selectedPaymentMethod =
    data.payment_methods.find((method) => String(method.id) === String(paymentMethodId)) || data.payment_methods[0] || null;
  const whatsappValue = whatsappNumber ?? data.profile?.whatsapp_number ?? '';
  const selectedQrCodeUrl = resolveMediaUrl(selectedPaymentMethod?.qr_code_url);

  useEffect(() => {
    setQrImageFailed(false);
  }, [selectedQrCodeUrl]);

  useEffect(() => {
    if (isLoading || selectedCourseId) {
      return;
    }

    const requestedCourseKey = searchParams.get('course') || '';
    const requestedCourse =
      data.courses.find((course) => course.slug === requestedCourseKey) ||
      data.courses.find((course) => course.id === requestedCourseKey);

    if (requestedCourse) {
      const timeoutId = window.setTimeout(() => {
        setSelectedCourseId(requestedCourse.id);
        setModalOpen(true);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [data.courses, isLoading, searchParams, selectedCourseId]);

  useEffect(() => {
    if (!paymentMethodId && data.payment_methods.length) {
      const timeoutId = window.setTimeout(() => {
        setPaymentMethodId(String(data.payment_methods[0].id));
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [data.payment_methods, paymentMethodId]);

  const openEnrollment = (course) => {
    setSelectedCourseId(course.id);
    setStep(1);
    setSubmitState(initialSubmitState);
    setPaymentScreenshot(null);
    setModalOpen(true);
  };

  const closeEnrollment = () => {
    if (submitState.isSubmitting) {
      return;
    }
    setModalOpen(false);
    setStep(1);
    setSubmitState(initialSubmitState);
  };

  const canContinue = Boolean(data.profile.first_name && data.profile.last_name && whatsappValue.trim());
  const canSubmit = Boolean(selectedCourse && selectedPaymentMethod && paymentScreenshot);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCourse || selectedCourse.enrollment_status !== 'available') {
      setSubmitState({ isSubmitting: false, error: 'Choose an available course.', success: '' });
      return;
    }

    if (!canSubmit) {
      setSubmitState({ isSubmitting: false, error: 'Choose payment method and upload screenshot.', success: '' });
      return;
    }

    setSubmitState({ isSubmitting: true, error: '', success: '' });

    const formData = new FormData();
    formData.append('course', selectedCourse.id);
    formData.append('first_name', data.profile.first_name);
    formData.append('last_name', data.profile.last_name);
    formData.append('whatsapp_number', whatsappValue);
    formData.append('payment_method', selectedPaymentMethod.id);
    formData.append('payment_screenshot', paymentScreenshot);

    try {
      const { response, payload } = await apiFetch('students/join-course/', {
        auth: true,
        method: 'POST',
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        navigate('/login', { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to submit enrollment.'));
      }

      setData((current) => ({
        ...current,
        profile: {
          ...current.profile,
          whatsapp_number: whatsappValue,
          is_phone_verified: false,
        },
        summary: {
          ...current.summary,
          available_courses: Math.max((current.summary.available_courses || 0) - 1, 0),
          pending_requests: (current.summary.pending_requests || 0) + 1,
        },
        courses: current.courses.map((course) =>
          course.id === selectedCourse.id
            ? {
                ...course,
                enrollment_status: 'pending',
                enrollment_status_label: 'Pending',
              }
            : course,
        ),
      }));

      setSubmitState({
        isSubmitting: false,
        error: '',
        success: payload.message || 'Enrollment request submitted.',
      });
      setStep(3);
    } catch (nextError) {
      setSubmitState({
        isSubmitting: false,
        error: nextError.message || 'Unable to submit enrollment.',
        success: '',
      });
    }
  };

  if (isLoading) {
    return <WorkspaceLoading label="Loading course enrollment..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel
        eyebrow="Enrollment"
        title="Join a Course"
        description="Pick, pay, upload."
        action={
          <Link
            to="/dashboard/courses"
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce5f0] bg-white px-4 py-2.5 text-sm font-medium text-[#53657f] transition hover:bg-[#f8fafc]"
          >
            My Courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      >
        <div className="grid gap-3 md:grid-cols-3">
          <MetricTile label="Available" value={data.summary.available_courses || 0} hint="Open now" />
          <MetricTile label="Pending" value={data.summary.pending_requests || 0} hint="In review" />
          <MetricTile label="Active" value={data.summary.active_courses || 0} hint="Verified" tone="accent" />
        </div>
      </WorkspacePanel>

      <WorkspacePanel eyebrow="Catalog" title="Published Courses">
        <div className="space-y-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#97a6bc]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search course or mentor"
              className="w-full rounded-[1rem] border border-[#dce5f0] bg-white py-3 pl-11 pr-4 text-sm text-[#22324d] outline-none transition placeholder:text-[#a4b1c6] focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
            />
          </div>

          {filteredCourses.length ? (
            <div className="grid gap-4 2xl:grid-cols-2">
              {filteredCourses.map((course) => {
                const isUnavailable = course.enrollment_status !== 'available';
                const salePrice = course.pricing?.sale_price ?? 0;
                const actualPrice = course.pricing?.price ?? 0;
                const hasDiscount = Number(course.pricing?.discount_percentage || 0) > 0 && salePrice < actualPrice;

                return (
                  <div
                    key={course.id}
                    className={cx(
                      'rounded-[1.15rem] border p-4 transition',
                      isUnavailable ? 'border-[#e5ebf5] bg-[#fbfcfe]' : 'border-emerald-200 bg-emerald-50/70',
                    )}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {course.is_featured ? <StatusBadge value="Featured" tone="success" /> : null}
                          <StatusBadge value={course.level} tone="info" />
                          <StatusBadge value={course.enrollment_status_label} tone={enrollmentTone(course.enrollment_status)} />
                        </div>
                        <h3 className="mt-3 text-[1.35rem] font-semibold tracking-tight text-[#22324d]">{course.title}</h3>
                        {course.short_description ? (
                          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-relaxed text-[#6f819b]">
                            {course.short_description}
                          </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#7e8ba3]">
                          <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.schedule_label}</span>
                          <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">Starts {formatDate(course.start_date)}</span>
                          <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.duration_weeks} weeks</span>
                          <span className="rounded-full border border-[#e5ebf5] bg-white px-3 py-1.5">{course.total_hours} hours</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 rounded-[1rem] border border-[#e5ebf5] bg-white px-4 py-4 lg:min-w-[180px]">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">Pricing</p>
                        <div>
                          <p className="text-2xl font-semibold tracking-tight text-[#22324d]">{formatCurrency(salePrice)}</p>
                          {hasDiscount ? <p className="mt-1 text-sm text-[#8fa0bb] line-through">{formatCurrency(actualPrice)}</p> : null}
                        </div>
                        {hasDiscount ? (
                          <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            Save {course.pricing.discount_percentage}%
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => openEnrollment(course)}
                        disabled={isUnavailable}
                        className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#d3ded8] disabled:text-[#6f819b]"
                      >
                        {course.enrollment_status === 'verified' ? (
                          <BadgeCheck className="h-4 w-4" />
                        ) : course.enrollment_status === 'pending' ? (
                          <Clock3 className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {course.enrollment_status === 'verified'
                          ? 'Already Enrolled'
                          : course.enrollment_status === 'pending'
                            ? 'Request Pending'
                            : 'Start Enrollment'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyWorkspaceState title="No matching courses" description="Clear search to see published courses." />
          )}
        </div>
      </WorkspacePanel>

      <AnimatePresence>
        {modalOpen && selectedCourse ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-[3px]"
            onClick={closeEnrollment}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: SHELL_EASE }}
              className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.25rem] border border-[#dfe7f2] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.25)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 border-b border-[#e5ebf5] bg-white/95 px-5 py-4 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#8fa0bb]">Enrollment</p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#22324d]">{selectedCourse.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeEnrollment}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-[#60748f] transition hover:bg-[#f8fafc]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['Info', 'Checkout', 'Review'].map((label, index) => {
                    const active = step >= index + 1;
                    return (
                      <div key={label} className="space-y-2">
                        <div className={cx('h-1.5 rounded-full', active ? 'bg-emerald-500' : 'bg-[#e5ebf5]')} />
                        <p className={cx('text-xs font-medium', active ? 'text-emerald-700' : 'text-[#8fa0bb]')}>{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                {step === 1 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1rem] border border-[#e5ebf5] bg-[#fbfcfe] px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">Name</p>
                      <p className="mt-2 text-sm font-medium text-[#22324d]">
                        {[data.profile.first_name, data.profile.last_name].filter(Boolean).join(' ') || 'Profile needed'}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[#e5ebf5] bg-[#fbfcfe] px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">Email</p>
                      <p className="mt-2 break-words text-sm font-medium text-[#22324d]">{data.profile.email}</p>
                    </div>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[#60748f]">WhatsApp number</span>
                      <input
                        type="tel"
                        value={whatsappValue}
                        onChange={(event) => setWhatsappNumber(event.target.value)}
                        placeholder="+977 98XXXXXXXX"
                        className="w-full rounded-[1rem] border border-[#dce5f0] bg-white px-4 py-3.5 text-[#22324d] outline-none transition placeholder:text-[#a4b1c6] focus:border-emerald-300 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                      />
                    </label>

                    {!data.profile.first_name || !data.profile.last_name ? (
                      <div className="md:col-span-2 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Add first and last name in Profile first.
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {data.payment_methods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setPaymentMethodId(String(method.id))}
                            className={cx(
                              'rounded-[1rem] border px-4 py-4 text-left transition',
                              String(paymentMethodId) === String(method.id)
                                ? 'border-emerald-300 bg-emerald-50'
                                : 'border-[#e5ebf5] bg-[#fbfcfe] hover:border-[#cad8ea]',
                            )}
                          >
                            <p className="font-semibold text-[#22324d]">{method.name}</p>
                            {method.account_label ? <p className="mt-1 text-sm text-[#7e8ba3]">{method.account_label}</p> : null}
                          </button>
                        ))}
                      </div>

                      <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[1rem] border border-dashed border-[#cbd8ea] bg-[#fbfcfe] px-5 py-6 text-center transition hover:border-emerald-300">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => setPaymentScreenshot(event.target.files?.[0] || null)}
                        />
                        <UploadCloud className="h-8 w-8 text-emerald-600" />
                        <span className="mt-3 text-sm font-semibold text-[#22324d]">
                          {paymentScreenshot ? paymentScreenshot.name : 'Upload payment screenshot'}
                        </span>
                        <span className="mt-1 text-xs text-[#8fa0bb]">PNG, JPG, or WebP</span>
                      </label>
                    </div>

                    <div className="rounded-[1rem] border border-[#e5ebf5] bg-white p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#95a4bc]">Scan QR</p>
                      {selectedQrCodeUrl && !qrImageFailed ? (
                        <img
                          key={selectedQrCodeUrl}
                          src={selectedQrCodeUrl}
                          alt={`${selectedPaymentMethod.name} QR code`}
                          className="mt-3 aspect-square w-full rounded-[0.9rem] border border-[#edf2f8] object-contain"
                          loading="lazy"
                          onError={() => setQrImageFailed(true)}
                        />
                      ) : (
                        <div className="mt-3 flex aspect-square items-center justify-center rounded-[0.9rem] border border-dashed border-[#dbe5f2] text-sm text-[#8fa0bb]">
                          {selectedQrCodeUrl ? 'QR image unavailable' : 'QR not added'}
                        </div>
                      )}
                      <p className="mt-3 text-sm font-medium text-[#22324d]">{selectedPaymentMethod?.name || 'No method'}</p>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
                    <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
                    <p className="mt-3 text-lg font-semibold text-[#22324d]">Request submitted</p>
                    <p className="mt-1 text-sm text-[#5f756d]">Admin will verify payment and unlock the course.</p>
                  </div>
                ) : null}

                {submitState.error ? <div className="mt-4"><WorkspaceError message={submitState.error} /></div> : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5ebf5] pt-4">
                  <button
                    type="button"
                    onClick={() => (step === 1 ? closeEnrollment() : setStep((current) => Math.max(current - 1, 1)))}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-[#5e6f89] transition hover:bg-[#f8fafc]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>

                  {step === 1 ? (
                    <button
                      type="button"
                      disabled={!canContinue}
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#b5c8bf]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}

                  {step === 2 ? (
                    <button
                      type="submit"
                      disabled={submitState.isSubmitting || !canSubmit}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-[#b5c8bf]"
                    >
                      {submitState.isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      Submit
                    </button>
                  ) : null}

                  {step === 3 ? (
                    <button
                      type="button"
                      onClick={closeEnrollment}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                      Done
                      <BadgeCheck className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentJoinCoursePage;
