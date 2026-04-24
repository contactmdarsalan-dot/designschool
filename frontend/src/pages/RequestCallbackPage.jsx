import { useState } from 'react';
import { ChevronDown, CheckCircle2, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';
import { apiFetch } from '../lib/api';
import { extractApiError } from '../lib/errors';

const backdropCards = [
  {
    src: 'https://ik.imagekit.io/sheryians/courses/cohort3thumbnai_E9AGbX-rJ.webp',
    className: 'left-[4%] top-[30%] w-[32vw] max-w-[460px] -rotate-6',
  },
  {
    src: 'https://ik.imagekit.io/sheryians/courses_gif/undefined-Image_2_QUZ-yb_0T.jpeg',
    className: 'left-[34%] top-[58%] w-[30vw] max-w-[430px] rotate-3',
  },
  {
    src: 'https://ik.imagekit.io/sheryians/Cohort%202.0/cohort-3_ekZjBiRzc-2_76HU4-Mz5z.jpeg?updatedAt=1757741949621',
    className: 'right-[6%] top-[34%] w-[32vw] max-w-[460px] rotate-4',
  },
];

const enquiryOptions = [
  { label: 'Online Course (Website)', value: 'online_course' },
  { label: 'Live Cohort Program', value: 'live_cohort' },
  { label: 'Offline Classes', value: 'offline_classes' },
  { label: 'Career Guidance', value: 'career_guidance' },
  { label: 'Other', value: 'other' },
];

const RequestCallbackPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    enquiryFor: enquiryOptions[0].value,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || formData.phoneNumber.trim().length < 10) {
      setError('Please enter your name and a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { response, payload } = await apiFetch('public/callback-requests/', {
        method: 'POST',
        body: {
          name: formData.name.trim(),
          country_code: '+977',
          phone_number: formData.phoneNumber.trim(),
          enquiry_for: formData.enquiryFor,
          message: formData.message.trim(),
          source_page: '/request-callback',
        },
      });

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to submit callback request.'));
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to submit callback request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-100">
      <Navbar />

      <main className="relative min-h-screen overflow-hidden pt-28 md:pt-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.28),rgba(0,0,0,0.94)_65%)]" />
          {backdropCards.map((card) => (
            <img
              key={card.src}
              src={card.src}
              alt=""
              className={`absolute hidden rounded-3xl border border-white/10 object-cover opacity-30 blur-[3.5px] lg:block ${card.className}`}
            />
          ))}
          <div className="absolute inset-0 bg-black/68 backdrop-blur-[5px]" />
        </div>

        <section className="relative z-10 flex min-h-[calc(100vh-9rem)] items-center justify-center px-4 py-8 md:px-8">
          <form
            className="relative w-full max-w-[640px] rounded-[22px] border border-white/20 bg-[#030303]/95 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.6)] md:p-10"
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Close callback form"
              className="absolute right-4 top-4 rounded-full p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h1 className="text-center text-3xl font-semibold tracking-tight md:text-[3.6rem]">
              Request a Callback
            </h1>
            <p className="mx-auto mt-3 max-w-md text-center text-base leading-snug text-white/62 md:text-[1.45rem]">
              Fill the form below and our team will get back to you with the right course or program details.
            </p>

            {success ? (
              <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center md:mt-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle2 className="h-7 w-7 text-emerald-300" />
                </div>
                <h2 className="mt-4 text-2xl font-semibold">Callback booked successfully</h2>
                <p className="mt-3 text-sm text-white/70 md:text-base">
                  Thanks for reaching out. Our team will contact you shortly on the number you shared.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 md:text-base"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="mt-8 space-y-5 md:mt-10 md:space-y-6">
                {error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                ) : null}

                <label className="block">
                  <span className="mb-2 block text-sm text-white/70 md:text-[1.28rem]">Name</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    placeholder="Enter your name here"
                    className="h-12 w-full rounded-xl border border-white/18 bg-black/70 px-4 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/70 focus:outline-none md:h-[3.35rem] md:text-[1rem]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-white/70 md:text-[1.28rem]">Phone no.</span>
                  <div className="flex h-12 items-center rounded-xl border border-white/18 bg-black/70 px-4 focus-within:border-emerald-400/70 md:h-[3.35rem]">
                    <img
                      src="https://flagcdn.com/w40/np.png"
                      alt="Nepal flag"
                      className="h-4 w-6 rounded-[2px] object-cover"
                      loading="lazy"
                    />
                    <span className="ml-2 border-r border-white/20 pr-3 text-sm font-medium text-white md:text-[1rem]">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(event) => handleChange('phoneNumber', event.target.value.replace(/\D/g, ''))}
                      placeholder="Enter your number here"
                      className="ml-3 w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none md:text-[1rem]"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-white/70 md:text-[1.28rem]">Enquiry For</span>
                  <div className="relative">
                    <select
                      className="h-12 w-full appearance-none rounded-xl border border-white/18 bg-black/70 px-4 pr-10 text-sm text-white focus:border-emerald-400/70 focus:outline-none md:h-[3.35rem] md:text-[1rem]"
                      value={formData.enquiryFor}
                      onChange={(event) => handleChange('enquiryFor', event.target.value)}
                    >
                      {enquiryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm text-white/70 md:text-[1.28rem]">
                    How can we help you?
                  </span>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(event) => handleChange('message', event.target.value)}
                    placeholder="E.g. I want details about the offline course, fees, and schedule..."
                    className="w-full rounded-xl border border-white/18 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/70 focus:outline-none md:text-[1rem]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] text-base font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 md:h-[3.35rem] md:text-[1.05rem]"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Book My Callback
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
};

export default RequestCallbackPage;
