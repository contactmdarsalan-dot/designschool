import { motion } from 'framer-motion';
import { Brain, CircleCheck, CircleX, Layers } from 'lucide-react';

const positivePoints = [
  'Highly Affordable, No Quality Cuts',
  'Project-Based, Skill-First Learning',
  'Continuously Updated With Industry Trends',
  'Internal Hackathons, Challenges & Face-Offs',
  'Industry-Relevant, Job-Oriented Curriculum',
];

const otherPoints = [
  'High Fees With Compromised Quality',
  'Theory-Centric Learning',
  'Outdated, Static Curriculum',
  'No Competitive Learning Environment',
  'Limited Practical Exposure',
];

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const ComparisonSection = () => {
  return (
    <section className="bg-black px-6 py-20 text-white md:px-8 md:py-28" id="comparison">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            custom={0}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.6 }}
            variants={reveal}
            className="relative inline-flex w-fit border border-brand/35 bg-brand/10 px-4 pb-2 pt-1.5 text-xl font-light uppercase leading-[1] text-brand md:text-2xl"
          >
            COMPARISON
            <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-white" />
          </motion.div>

          <motion.div
            custom={0.04}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
            variants={reveal}
            className="flex justify-center px-5"
          >
            <div className="mb-5 mt-5 w-[90%] text-center text-[2.2rem] font-medium capitalize leading-[1.3] text-white md:mb-9 md:text-[3.5rem] md:leading-[4.5rem] lg:w-[75%]">
              What Sets Design School Apart From Other Coders
            </div>
          </motion.div>
        </div>

        <motion.div
          custom={0.1}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={reveal}
          className="rounded-[2rem] border border-[#302C2A] bg-black/70 p-5 md:p-6 lg:p-7"
        >
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
            <motion.div
              custom={0.15}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
              className="rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(16,185,129,0.42),rgba(16,185,129,0.14)_24%,rgba(16,185,129,0.04)_100%)] p-[1px] shadow-[0_18px_38px_rgba(16,185,129,0.2),0_0_28px_rgba(16,185,129,0.24)]"
            >
              <div className="rounded-[calc(1.9rem-1px)] border border-emerald-400/20 bg-black px-6 py-7 md:px-10 md:py-8">
                <div className="flex items-center gap-5 pb-4 md:h-24 md:pb-8">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black">
                    <Brain className="relative z-10 h-10 w-10 text-white" />
                    <div className="absolute inset-0 rounded-2xl bg-brand/10 blur-xl" />
                  </div>
                  <div className="h-12 w-px bg-white/18" />
                  <div className="text-left leading-none">
                    <p className="text-[1.95rem] font-light tracking-tight text-white md:text-[2.15rem]">
                      Design
                    </p>
                    <p className="text-[1.95rem] font-light tracking-tight text-white md:text-[2.15rem]">
                      School
                    </p>
                  </div>
                </div>

                <div className="flex flex-col">
                  {positivePoints.map((point, index) => (
                    <motion.div
                      key={point}
                      custom={0.18 + index * 0.04}
                      initial="hidden"
                      whileInView="show"
                      viewport={{ once: true, amount: 0.4 }}
                      variants={reveal}
                      className="flex items-start gap-3 py-4 md:py-5"
                    >
                      <CircleCheck className="mt-1 h-6 w-6 shrink-0 text-brand" />
                      <p className="text-xl font-light leading-snug text-white md:text-[1.6rem]">
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              custom={0.2}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
              className="px-2 pt-2 md:px-6 md:pt-4 lg:pr-10"
            >
              <div className="flex items-center gap-5 pb-4 md:h-24 md:pb-8">
                <Layers className="h-8 w-8 shrink-0 text-white md:h-9 md:w-9" />
                <p className="text-[2.3rem] font-light text-white md:text-[3rem]">Others</p>
              </div>

              <div className="flex flex-col">
                {otherPoints.map((point, index) => (
                  <motion.div
                    key={point}
                    custom={0.24 + index * 0.04}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.4 }}
                    variants={reveal}
                    className="flex items-start gap-3 py-4 md:py-5"
                  >
                    <CircleX className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[#052319] text-brand" />
                    <p className="text-xl font-light leading-snug text-white md:text-[1.6rem]">
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
