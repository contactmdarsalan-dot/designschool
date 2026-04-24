import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Phone, ArrowRight, Brain, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

const PhoneVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [step, setStep] = useState(1); // 1: Enter phone, 2: Verify OTP, 3: Success
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    document.title = 'Verify Phone | Design School';
  }, []);

  const handleSendCode = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      // Focus first OTP input after transition
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, 1500);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.join('').length < 6) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      
      // Redirect to home or dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white flex overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="w-full flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md relative">
          
          {/* Logo / Back Button */}
          <div className="absolute -top-20 left-0 w-full flex justify-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Brain className="w-8 h-8 text-brand relative z-10" />
                <div className="absolute inset-0 bg-brand/20 blur-lg rounded-full" />
              </div>
              <span className="text-xl font-bold tracking-tight">Design School</span>
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand to-transparent opacity-50" />
                
                <div className="w-12 h-12 bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center mb-6 text-brand">
                  <Phone className="w-6 h-6" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Secure your account</h2>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  We need to verify your phone number to keep your account secure and prevent spam.
                </p>

                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white font-medium">
                        +1
                      </div>
                      <div className="absolute inset-y-2 left-12 w-px bg-white/10" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-16 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-300 tracking-wide"
                        placeholder="(555) 000-0000"
                        maxLength="15"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || phoneNumber.length < 10}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 focus:ring-4 focus:ring-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
              >
                <button 
                  onClick={() => setStep(1)}
                  className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-full flex items-center justify-center mb-6 text-brand">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Check your phone</h2>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                  We've sent a 6-digit verification code to <span className="text-white font-medium">+{phoneNumber}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-8">
                  <div className="flex justify-between gap-2 sm:gap-4">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-bold bg-white/[0.03] border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-300"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.join('').length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand text-black font-semibold hover:bg-brand/90 focus:ring-4 focus:ring-brand/20 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      'Verify & Complete'
                    )}
                  </button>

                  <p className="text-center text-sm text-zinc-500">
                    Didn't receive the code?{' '}
                    <button type="button" className="text-white hover:text-brand transition-colors font-medium">
                      Resend
                    </button>
                  </p>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-brand/5" />
                
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                  className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6 relative z-10"
                >
                  <CheckCircle2 className="w-10 h-10 text-brand" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2 relative z-10">Verification Complete!</h2>
                <p className="text-zinc-400 relative z-10">
                  Your account has been successfully verified. Redirecting you to the dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerificationPage;
