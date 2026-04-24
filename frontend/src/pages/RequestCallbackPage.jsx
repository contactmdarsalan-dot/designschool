import { ChevronDown, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/sheryians/Navbar';

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
  'Online Course (Website)',
  'Live Cohort Program',
  'Offline Classes',
  'Career Guidance',
];

const RequestCallbackPage = () => {
  const navigate = useNavigate();

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
            onSubmit={(event) => event.preventDefault()}
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
              Fill the form below to request a callback from our team.
            </p>

            <div className="mt-8 space-y-5 md:mt-10 md:space-y-6">
              <label className="block">
                <span className="mb-2 block text-sm text-white/70 md:text-[1.28rem]">Name</span>
                <input
                  type="text"
                  placeholder="Enter your Name here"
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
                    defaultValue={enquiryOptions[0]}
                  >
                    {enquiryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
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
                  placeholder="E.g. I want details about the offline course, fees, and schedule..."
                  className="w-full rounded-xl border border-white/18 bg-black/70 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-emerald-400/70 focus:outline-none md:text-[1rem]"
                />
              </label>

              <button
                type="submit"
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[linear-gradient(95deg,#169254_6%,#052f1f_235%)] text-base font-semibold text-white transition hover:brightness-110 md:h-[3.35rem] md:text-[1.05rem]"
              >
                <Send className="h-4 w-4" />
                Book My Callback
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default RequestCallbackPage;
