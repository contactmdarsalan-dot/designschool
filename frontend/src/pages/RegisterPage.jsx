import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Brain, Lock, Mail, User } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { storeAuthSession } from '../lib/auth';
import { extractApiError } from '../lib/errors';
import { IS_GOOGLE_AUTH_ENABLED } from '../lib/googleAuth';

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GoogleRegisterButton = ({ isLoading, onError, onNewSession }) => {
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { response, payload } = await apiFetch('auth/google-login/', {
          method: 'POST',
          body: { access_token: tokenResponse.access_token },
        });

        if (!response.ok) {
          throw new Error(extractApiError(payload, 'Google login failed.'));
        }

        onNewSession(payload);
      } catch (err) {
        onError(err.message || 'Google login failed.');
      }
    },
    onError: () => {
      onError('Google login was cancelled or failed.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => loginWithGoogle()}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-medium text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Register | Design School';
  }, []);

  const handleGoogleSession = (payload) => {
    if (payload.is_new_user || !payload.user?.is_phone_verified) {
      navigate('/verify-phone', { state: { email: payload.user?.email } });
      return;
    }

    storeAuthSession(payload);
    navigate('/dashboard');
  };

  const handleChange = (event) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();

    if (!firstName || !lastName || !email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { response, payload } = await apiFetch('auth/register/', {
        method: 'POST',
        body: {
          first_name: firstName,
          last_name: lastName,
          email,
          password: formData.password,
        },
      });

      if (!response.ok) {
        throw new Error(extractApiError(payload, 'Unable to create your account.'));
      }

      navigate('/verify-phone', {
        state: {
          email,
          firstName,
        },
      });
    } catch (err) {
      setError(err.message || 'Unable to create your account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#070707] text-white">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="flex w-full">
        <div className="relative z-10 hidden w-5/12 flex-col justify-between border-r border-white/5 bg-black/40 p-12 backdrop-blur-sm lg:flex">
          <div>
            <Link to="/" className="group flex w-fit items-center gap-2">
              <div className="relative">
                <Brain className="relative z-10 h-8 w-8 text-brand" />
                <div className="absolute inset-0 rounded-full bg-brand/20 blur-lg" />
              </div>
              <span className="text-xl font-bold tracking-tight">Design School</span>
            </Link>

            <div className="mt-24 max-w-md">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-sm text-brand">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                  </span>
                  Join the Cohort
                </div>
                <h1 className="mb-6 text-4xl font-bold leading-[1.1] md:text-5xl">
                  Build a serious learning system around your <span className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">creative career.</span>
                </h1>
                <p className="text-lg leading-relaxed text-zinc-400">
                  Create your account, verify your phone, and move into a focused student workspace built around courses, recordings, assignments, and certificates.
                </p>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>© 2026 Design School</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Secure onboarding</span>
          </div>
        </div>

        <div className="relative z-10 flex w-full items-center justify-center p-8 sm:p-12 lg:w-7/12">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-[440px]">
            <div className="mb-10 flex flex-col items-center lg:hidden">
              <Link to="/" className="group mb-6 flex items-center gap-2">
                <Brain className="h-8 w-8 text-brand" />
                <span className="text-xl font-bold tracking-tight">Design School</span>
              </Link>
              <h2 className="text-2xl font-bold">Create your account</h2>
              <p className="mt-2 text-center text-zinc-400">Join the student workspace and start your learning journey.</p>
            </div>

            <div className="mb-10 hidden lg:block">
              <h2 className="mb-2 text-3xl font-bold tracking-tight">Create an account</h2>
              <p className="text-zinc-400">We’ll get you verified, enrolled, and into your student dashboard fast.</p>
            </div>

            {IS_GOOGLE_AUTH_ENABLED ? (
              <>
                <GoogleRegisterButton
                  isLoading={isLoading}
                  onError={setError}
                  onNewSession={handleGoogleSession}
                />

                <div className="my-8 flex items-center">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="px-4 text-xs font-medium uppercase tracking-wider text-zinc-500">Or register with email</span>
                  <div className="flex-1 border-t border-white/10" />
                </div>
              </>
            ) : (
              <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400">
                Google sign-up is not configured yet. You can still register with email below.
              </div>
            )}

            <AnimatePresence>
              {error ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="ml-1 text-sm font-medium text-zinc-400">First Name</label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors group-focus-within:text-brand">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                      placeholder="John"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 text-sm font-medium text-zinc-400">Last Name</label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors group-focus-within:text-brand">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-zinc-400">Email Address</label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors group-focus-within:text-brand">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-zinc-400">Password</label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors group-focus-within:text-brand">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="Create a secure password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-zinc-400">Confirm Password</label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors group-focus-within:text-brand">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-12 pr-4 text-white placeholder-zinc-600 transition-all duration-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand/50"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 font-semibold text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 hover:bg-brand/90 focus:ring-4 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:text-brand">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
