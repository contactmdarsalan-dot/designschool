import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const studentImages = [
  'https://ik.imagekit.io/sheryians/students/1764611471979-a5146ade-8ab9-4b7f-9855-83e80edf2e3f-1_all_6810_55Ht7UJe6.jpg?updatedAt=1764611473623',
  'https://ik.imagekit.io/sheryians/students/1763358465375-4932_9bX0q8pkf.jpg?updatedAt=1763358467925',
  'https://ik.imagekit.io/sheryians/students/1763450438835-1763450213822_GyFFcHso3.jpg?updatedAt=1763450441070',
  'https://ik.imagekit.io/sheryians/students/1763383043355-1000245810_Qyc5r9LWS.jpg?updatedAt=1763383046926',
];

let heroGsapRegistered = false;

const registerHeroGsap = () => {
  if (!heroGsapRegistered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    heroGsapRegistered = true;
  }
};

const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    registerHeroGsap();

    const ctx = gsap.context(() => {
      const root = heroRef.current;
      if (!root) {
        return;
      }

      gsap.set('[data-hero-depth]', { transformPerspective: 1400 });

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.1,
        },
      });

      timeline
        .to('[data-hero-heading]', { yPercent: -18, opacity: 0.68, scale: 0.97 }, 0)
        .to('[data-hero-copy]', { yPercent: -22, opacity: 0.32 }, 0)
        .to('[data-hero-proof]', { yPercent: -16, opacity: 0.38 }, 0.02)
        .to('[data-hero-cta]', { yPercent: -20, opacity: 0.18 }, 0.04)
        .to('[data-hero-badge]', { yPercent: -12, opacity: 0.55 }, 0.02)
        .to('[data-hero-glow]', { yPercent: -14, scale: 1.18, opacity: 0.58 }, 0)
        .to('[data-hero-grid]', { yPercent: 10, opacity: 0.16 }, 0)
        .to('[data-hero-lines]', { yPercent: 14, opacity: 0.3 }, 0)
        .to('[data-hero-depth]', { yPercent: -8 }, 0);
    }, heroRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-6 pb-20 pt-32 text-white md:px-8 md:pt-40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.08)_22%,rgba(8,8,8,0.95)_58%,#000_100%)] pointer-events-none" />
      <div
        data-hero-grid
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:120px_120px] opacity-25 pointer-events-none"
      />
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-white/10 pointer-events-none" />
      <div
        data-hero-glow
        className="absolute left-1/2 top-[26%] h-[26rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.05)_38%,transparent_72%)] blur-3xl pointer-events-none"
      />

      <div data-hero-lines className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-[31%] h-px w-[18%] bg-gradient-to-r from-transparent via-white/12 to-transparent" />
        <div className="absolute right-0 top-[31%] h-px w-[18%] bg-gradient-to-l from-transparent via-white/12 to-transparent" />
        <div className="absolute left-[12%] top-0 h-[46%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute right-[12%] top-0 h-[46%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute left-[25%] top-0 h-[54%] w-px rotate-45 bg-gradient-to-b from-transparent via-white/10 to-transparent origin-top" />
        <div className="absolute right-[25%] top-0 h-[54%] w-px -rotate-45 bg-gradient-to-b from-transparent via-white/10 to-transparent origin-top" />
        <div className="absolute left-[9%] top-[22%] h-36 w-40 bg-[radial-gradient(circle,rgba(16,185,129,0.58)_1px,transparent_1.4px)] bg-[length:14px_14px] opacity-30" />
        <div className="absolute right-[9%] top-[30%] h-56 w-60 bg-[radial-gradient(circle,rgba(16,185,129,0.56)_1px,transparent_1.4px)] bg-[length:18px_18px] opacity-25" />
        <div className="absolute right-[14%] top-[46%] h-36 w-36 border border-white/8 [clip-path:polygon(18%_0,100%_0,82%_50%,100%_100%,18%_100%,0_50%)]" />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center justify-center gap-3 text-center md:gap-6">
        <motion.h4
          data-hero-badge
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 text-center text-sm font-medium uppercase tracking-[0.1em] text-brand md:text-[1.05rem]"
        >
          Learn. &nbsp;Build. &nbsp;Get Placed.
        </motion.h4>

        <motion.div
          data-hero-heading
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="w-[90%] text-center text-[2.7rem] font-light tracking-tight capitalize leading-[1.18] sm:leading-[1.12] md:text-[5rem] md:leading-[5rem] lg:w-[70%] lg:text-[4.7rem]"
        >
          <h1>
            Become the Software Engineer that{' '}
            <span className="relative mx-auto inline-block w-fit border border-brand bg-[rgba(16,185,129,0.12)] px-2 pt-[0.06rem] text-white/90">
              Companies
              <span className="absolute left-0 top-0 z-10 aspect-square h-1 -translate-x-1/2 -translate-y-1/2 bg-white" />
              <span className="absolute right-0 top-0 z-10 aspect-square h-1 translate-x-1/2 -translate-y-1/2 bg-white" />
              <span className="absolute bottom-0 left-0 z-10 aspect-square h-1 -translate-x-1/2 translate-y-1/2 bg-white" />
              <span className="absolute bottom-0 right-0 z-10 aspect-square h-1 translate-x-1/2 translate-y-1/2 bg-white" />
            </span>{' '}
            Want to Hire!
          </h1>
        </motion.div>

        <motion.p
          data-hero-copy
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="w-[90%] text-center text-[1.2rem] font-light text-[#D7D7D7] md:text-[1.9rem] lg:w-[65%]"
        >
          Join a growing community of students preparing for real-world tech careers at
          Design School.
        </motion.p>

        <motion.div
          data-hero-proof
          data-hero-depth
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.22 }}
          className="flex flex-wrap items-center justify-center gap-2 text-center text-lg font-light text-white/70"
        >
          <div className="flex w-32">
            {studentImages.map((image, index) => (
              <div
                key={image}
                className="aspect-square h-10 shrink-0 overflow-hidden rounded-full border border-white/30"
                style={{ transform: `translateX(-${index * 30}%)` }}
              >
                <img
                  className={`h-full w-full object-cover ${index === 2 ? 'object-top' : ''}`}
                  alt="Student"
                  loading="eager"
                  src={image}
                />
              </div>
            ))}
          </div>
          <span className="font-bold text-brand">10K+</span>
          <span>Students learning in our mastery programs</span>
        </motion.div>

        <motion.div
          data-hero-cta
          data-hero-depth
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 mt-5 flex rounded-2xl bg-gradient-to-b from-white/50 to-transparent p-[0.5px]"
        >
          <a
            className="group rounded-2xl px-8 py-3 text-center text-xl font-bold text-white outline-none transition-all duration-300 hover:[background-position:left_center] hover:shadow-[0_0px_40px_5px_rgba(16,185,129,0.45)] sm:px-10 sm:py-4"
            href="#courses"
            style={{
              background:
                'linear-gradient(96.76deg, rgb(16, 185, 129) 5.3%, rgb(3, 59, 44) 234.66%) right center / 150% 100% border-box padding-box, border-box',
              transition: 'background-position 300ms, box-shadow 300ms',
            }}
          >
            <div className="relative mx-auto w-max cursor-pointer overflow-hidden">
              <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                Start Journey <span>&rarr;</span>
              </div>
              <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                Start Journey <span>&rarr;</span>
              </div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
