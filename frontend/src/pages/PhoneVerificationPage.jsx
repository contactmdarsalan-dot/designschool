import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, CheckCircle2, Phone, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { storeAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';

const OTP_LENGTH = 6;

const PhoneVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);
  const email = location.state?.email || '';

  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(Array.from({ length: OTP_LENGTH }, () => ''));
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Verify Phone | Design School';
  }, []);

  const fullPhoneNumber = `+977${phoneNumber}`;

  const handleSendCode = async (event) => {
    event.preventDefault();
    if (!email) {
      setError('Please create or sign in to an account first.');
      return;
    }
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfo('');

    try {
      const { response, payload } = await apiFetch('auth/generate-otp/', {
        method: 'POST',
        body: {
          email,
          phone_number: fullPhoneNumber,
        },
      });

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to send OTP.'));
      }

      setStep(2);
      setInfo('Verification code sent successfully. Check your phone.');
      window.setTimeout(() => inputRefs.current[0]?.focus(), 120);
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    if (error) {
      setError('');
    }

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { response, payload } = await apiFetch('auth/verify-otp/', {
        method: 'POST',
        body: {
          email,
          otp_code: otpCode,
        },
      });

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to verify OTP.'));
      }

      storeAuthSession(payload);
      setStep(3);
      window.setTimeout(() => {
        navigate('/dashboard');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Unable to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async () => {
    if (isLoading) {
      return;
    }
    await handleSendCode({ preventDefault: () => {} });
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center p-6">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-20 left-0 flex w-full justify-center">
            <Link to="/" className="group flex items-center gap-2">
              <div className="relative">
                <Brain className="relative z-10 h-8 w-8 text-brand" />
                <div className="absolute inset-0 rounded-full bg-brand/20 blur-lg" />
              </div>
              <span className="text-xl font-bold tracking-tight">Design School</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />

                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-brand">
                  <Phone className="h-6 w-6" />
                </div>

                <h2 className="mb-2 text-2xl font-bold">Secure your account</h2>
                <p className="mb-8 leading-relaxed text-zinc-400">
                  Verify your phone number so we can protect your account and unlock your student dashboard.
                </p>

                {!email ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                    We don&apos;t have an email for this verification flow yet. Please register or sign in first.
                  </div>
                ) : null}

                {error ? <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
                {info ? <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{info}</p> : null}

                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="space-y-2">
                    <label className="ml-1 text-sm font-medium text-zinc-400">Phone Number</label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-medium text-white">
                        +977
                      </div>
                      <div className="absolute inset-y-2 left-14 w-px bg-white/10" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(event) => setPhoneNumber(event.target.value.replace(/\D/g, ''))}
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-20 pr-4 tracking-wide text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                        placeholder="98XXXXXXXX"
                        maxLength="15"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10 || !email}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-semibold text-black transition-all duration-300 hover:bg-zinc-200 focus:ring-4 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : null}

            {step === 2 ? (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="absolute right-6 top-6 text-zinc-500 transition-colors hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-brand">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h2 className="mb-2 text-2xl font-bold">Check your phone</h2>
                <p className="mb-8 leading-relaxed text-zinc-400">
                  We&apos;ve sent a 6-digit verification code to <span className="font-medium text-white">{fullPhoneNumber}</span>
                </p>

                {error ? <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
                {info ? <p className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{info}</p> : null}

                <form onSubmit={handleVerify} className="space-y-8">
                  <div className="flex justify-between gap-2 sm:gap-4">
                    {otp.map((digit, index) => (
                      <input
                        key={`otp-${index}`}
                        ref={(element) => {
                          inputRefs.current[index] = element;
                        }}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(event) => handleOtpChange(index, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(index, event)}
                        className="h-12 w-10 rounded-xl border border-white/10 bg-white/[0.03] text-center text-xl font-bold text-white transition-all duration-300 focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/50 sm:h-14 sm:w-12"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length < OTP_LENGTH}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-brand/90 focus:ring-4 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <p className="text-center text-sm text-zinc-500">
                    Didn&apos;t receive the code?{' '}
                    <button type="button" onClick={resendCode} className="font-medium text-white transition-colors hover:text-brand">
                      Resend
                    </button>
                  </p>
                </form>
              </motion.div>
            ) : null}

            {step === 3 ? (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-10 text-center shadow-2xl backdrop-blur-xl"
              >
                <div className="absolute inset-0 bg-brand/5" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                  className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10"
                >
                  <CheckCircle2 className="h-10 w-10 text-brand" />
                </motion.div>

                <h2 className="relative z-10 mb-2 text-2xl font-bold">Verification complete</h2>
                <p className="relative z-10 text-zinc-400">
                  Your phone is verified. Redirecting you to the student dashboard now.
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
