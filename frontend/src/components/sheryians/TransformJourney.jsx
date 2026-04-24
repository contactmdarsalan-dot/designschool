import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const backdropCards = [
  {
    id: 'card-1',
    className: 'left-[6%] top-[10%] hidden h-44 w-32 rotate-[-8deg] md:block',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'card-2',
    className: 'left-[14%] bottom-[8%] hidden h-52 w-36 rotate-[7deg] lg:block',
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'card-3',
    className: 'left-[30%] top-[62%] hidden h-56 w-40 rotate-[-4deg] md:block',
    image:
      'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'card-4',
    className: 'right-[26%] top-[8%] hidden h-44 w-32 rotate-[10deg] md:block',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'card-5',
    className: 'right-[9%] top-[25%] hidden h-64 w-44 rotate-[-2deg] lg:block',
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=900&auto=format&fit=crop',
  },
  {
    id: 'card-6',
    className: 'right-[12%] bottom-[6%] hidden h-56 w-40 rotate-[6deg] md:block',
    image:
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=900&auto=format&fit=crop',
  },
];

const SlidingButtonLabel = ({ text }) => {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-full">
        {text}
      </span>
      <span className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
        {text}
      </span>
    </span>
  );
};

const TransformJourney = () => {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-24 md:px-8 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,rgba(16,185,129,0.05)_35%,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.65)_40%,rgba(0,0,0,0.86)_100%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {backdropCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            whileInView={{ opacity: 0.56, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
              delay: 0.04 + index * 0.06,
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`absolute overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_18px_50px_rgba(0,0,0,0.5)] ${card.className}`}
          >
            <img
              src={card.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover brightness-[0.78] contrast-[1.05] blur-[2px]"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="mx-auto max-w-5xl text-[1.9rem] font-light leading-[1.16] tracking-tight text-white md:text-[3.7rem] md:leading-[1.08] lg:text-[4.2rem]"
        >
          Transform Your Learning Journey
          <br />
          Into A Career Breakthrough With
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{ delay: 0.08 }}
          className="relative mx-auto mt-5 flex w-fit border border-[#10b981]/80 bg-[#10b9811f] px-5 py-2 text-[1.95rem] font-light leading-none tracking-tight text-[#e8fff5] md:mt-6 md:px-8 md:py-2.5 md:text-[4.05rem]"
        >
          Design School
          <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white/90" />
          <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white/90" />
          <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-white/90" />
          <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-white/90" />
        </motion.div>

        <div className="mt-9 flex justify-center md:mt-11">
          <motion.a
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: 0.12 }}
            href="#courses"
            className="group inline-flex items-center gap-3 rounded-2xl px-8 py-3.5 text-lg font-bold text-white transition-all duration-300 hover:[background-position:left_center] hover:shadow-[0_0px_40px_5px_rgba(16,185,129,0.45)] md:text-[1.55rem]"
            style={{
              background:
                'linear-gradient(96.76deg, rgb(16, 185, 129) 5.3%, rgb(3, 59, 44) 234.66%) right center / 150% 100% border-box padding-box, border-box',
              transition: 'background-position 300ms, box-shadow 300ms',
            }}
          >
            <SlidingButtonLabel text="Explore Courses" />
            <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default TransformJourney;
