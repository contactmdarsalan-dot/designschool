import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Are Design School courses suitable for beginners?',
    answer:
      'Yes. Design School offers beginner-friendly learning paths along with advanced concepts. Our programs are structured to support complete beginners as well as professionals who want to level up.',
  },
  {
    question: 'Does Design School provide placement assistance?',
    answer:
      'Yes. We provide placement-focused support through resume reviews, mock interviews, project guidance, and mentorship to help learners become interview ready.',
  },
  {
    question: 'What programming languages and technologies are covered in the courses?',
    answer:
      'Our tracks cover modern web and software stacks, including HTML, CSS, JavaScript, React, Node.js, databases, system design, and AI-ready workflows depending on your course.',
  },
  {
    question: 'Are the classes live or pre-recorded, and can I access recordings later?',
    answer:
      'Most cohorts are live with structured schedules, and recordings are shared for revision. This helps you learn in real time and catch up whenever needed.',
  },
  {
    question: 'Do students get real-world project experience during the course?',
    answer:
      'Absolutely. We focus on practical, project-based learning so you build portfolio-ready work and develop the problem-solving skills companies look for.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section className="bg-black px-6 py-20 md:px-8 md:py-28" id="faqs">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            className="relative inline-flex w-fit border border-brand/35 bg-brand/10 px-4 pb-2 pt-1.5 text-xl font-light uppercase leading-[1] text-brand md:text-2xl"
          >
            FAQS
            <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-white" />
            <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            className="flex justify-center px-5"
          >
            <h2 className="mb-5 mt-5 w-[90%] text-center text-[2.2rem] font-medium capitalize leading-[1.3] text-white md:mb-9 md:text-[3.5rem] md:leading-[4.5rem] lg:w-[75%]">
              Frequently Asked Questions From Our Students
            </h2>
          </motion.div>
        </div>

        <div className="mx-auto flex w-full max-w-[68rem] flex-col gap-4 md:gap-5">
          {faqs.map((item, index) => {
            const isOpen = index === openIndex;

            return (
              <motion.article
                key={item.question}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-3xl border bg-[#000205] px-6 py-5 backdrop-blur-[20px] transition-colors md:px-7 md:py-6 ${
                  isOpen ? 'border-white/16' : 'border-[#2A2D30]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className="flex w-full items-center justify-between gap-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`text-[1.25rem] leading-tight tracking-tight md:text-[2rem] ${
                      isOpen ? 'text-white' : 'text-white/45'
                    }`}
                  >
                    {item.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.24, ease: [0.33, 1, 0.68, 1] }}
                    className="shrink-0 text-white/85"
                  >
                    <ChevronDown className="h-8 w-8 md:h-9 md:w-9" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pt-5 text-[1rem] leading-relaxed text-white/62 md:max-w-[92%] md:text-[1.3rem] md:leading-snug">
                        {item.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
