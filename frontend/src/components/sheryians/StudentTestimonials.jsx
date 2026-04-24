import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviewRows = [
  [
    {
      name: 'Mukti Prasad Dash',
      role: 'Full Stack Developer',
      rating: 4.3,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjWbZRA6Ke_uBDug6H29yb4ML11j0SYQepdf0CYGAaXysgXisz4=s64-c-rp-mo-br100',
      review:
        'Design School is an excellent institute for learning coding. The teachers explain concepts in a very clear and simple way, and the guidance is really supportive.',
    },
    {
      name: 'pradum_k',
      role: 'MERN Stack Developer',
      rating: 4.8,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjXhkkDZMMZMToJ2fVU8eX7lZoeymar4D2Po_jsZttvzF3fz-JyO=s64-c-rp-mo-br100',
      review:
        'Design School is an amazing place to learn coding. The mentors are highly skilled, explain every concept clearly, and guide you like professionals.',
    },
    {
      name: 'Honey Atalkar',
      role: 'Software Engineering Student',
      rating: 4.2,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjXm1hOtHddorHPAjPP5T2ZxFA2IuObOobBQOVuMWXRiPhmPOS69=s64-c-rp-mo-br100',
      review:
        'Design School is the best place to learn coding offline. The teachers explain every topic step by step and use real-life examples to make complex logic easy to understand.',
    },
    {
      name: 'Parth gup Ta',
      role: 'Frontend Developer',
      rating: 4.7,
      image:
        'https://lh3.googleusercontent.com/a/ACg8ocI8p78qOy4zXpD5SruQabi7FJUJXWpr8_R8jUlJTssTY2tktw=s64-c-rp-mo-br100',
      review:
        'Learning at Design School has been an amazing experience. The mentors explain everything so clearly, and the hands-on projects really help in understanding the concepts better.',
    },
    {
      name: 'Mohd Siraj',
      role: 'Web Developer',
      rating: 4.1,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjXBzkmRxwA1hlxiptQHZJnja6TZn97tHnX8l2jKQ7AA_LBtUz4n=s64-c-rp-mo-br100',
      review:
        'I had a great experience at coaching. The teachers are highly supportive and knowledgeable. They explain every concept clearly and make learning enjoyable.',
    },
  ],
  [
    {
      name: 'Samarth Jain',
      role: 'Local Guide & Coder',
      rating: 4.8,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjWcH_XErZbHkM5_0RNlNtiVNWats-GiUl19D4TLcAH7uC145W8XPA=s64-c-rp-mo-ba4-br100',
      review:
        'Really a very amazing place to learn new technologies and life facts too. If you are looking to embark on a transformative coding journey, Design School is the destination.',
    },
    {
      name: 'Akshat Sahu',
      role: 'Software Developer',
      rating: 4.7,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjWTP-gt5AGK-AiTDBw0GI36Bol_nJr3ttYxH25XPjPmCWHpgsG7=s64-c-rp-mo-br100',
      review:
        'The best institute is in Bhopal. I have learned a lot by coming here. After coming here, I just started coding and now I am genuinely enjoying the process.',
    },
    {
      name: 'Om Singhal',
      role: 'Backend Developer',
      rating: 4.4,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjXlzeJC_n1ztgPTSBIg-ReP5z9ayISJTkv0udcszLP2gYWi8dyE=s64-c-rp-mo-br100',
      review:
        'Design School is the best place to learn coding online. I am currently learning online from Design School, and my experience has been top-notch from day one.',
    },
    {
      name: 'Aditya Kumar',
      role: 'Coding Mentor',
      rating: 4.2,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjUNdI9v6r5ncY-YaS9WfLHRX7rs8VSXYon-DjJ89NamEvuV5vtI=s64-c-rp-mo-br100',
      review:
        'We proudly share our teaching journey with Design School, helping students build future-ready coding skills with practical guidance and hands-on mentorship.',
    },
    {
      name: 'Akash Warade',
      role: 'MERN Stack Student',
      rating: 4.9,
      image:
        'https://lh3.googleusercontent.com/a-/ALV-UjU6clBm3K5pH5Chp9QFwNOWquo-bZgRroL1D5ZXVSBnzktp_7Pb=s64-c-rp-mo-br100',
      review:
        'I am a student of the MERN batch and after spending three months here I can say the experience is genuinely amazing. The mentors are deeply invested in student growth.',
    },
  ],
];

const marqueeRows = reviewRows.map((row) => [...row, ...row]);

const splitReviewLines = (text) =>
  text
    .split('. ')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index, lines) => {
      const needsPeriod = index !== lines.length - 1 || text.trim().endsWith('.');
      return needsPeriod && !line.endsWith('.') ? `${line}.` : line;
    });

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        if (index < fullStars) {
          return <Star key={index} className="h-5 w-5 fill-amber-400 text-amber-400" />;
        }

        if (index === fullStars && partialFill > 0) {
          return (
            <span key={index} className="relative h-5 w-5">
              <Star className="absolute inset-0 h-5 w-5 text-zinc-700" />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${partialFill * 100}%` }}
              >
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </span>
            </span>
          );
        }

        return <Star key={index} className="h-5 w-5 text-zinc-700" />;
      })}
    </div>
  );
};

const ReviewCard = ({ review }) => {
  const reviewLines = splitReviewLines(review.review);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      className="min-w-[68vw] shrink-0 rounded-2xl bg-gradient-to-b from-zinc-500/60 via-zinc-700/15 to-transparent p-[0.5px] sm:min-w-[22.5rem] md:min-w-[30vw] lg:min-w-[21vw]"
    >
      <div className="flex h-full min-h-[21rem] flex-col gap-4 overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(180deg,rgba(5,0,0,0.72)_0%,rgba(20,4,4,0.98)_120%)] px-6 py-7 text-[#D3D3D3] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-300 hover:border-brand/25 hover:bg-[linear-gradient(180deg,rgba(3,10,7,0.92)_0%,rgba(11,23,18,0.98)_120%)] md:px-7 md:py-8"
      >
        <div className="mb-4 flex items-center gap-5 border-b border-white/14 pb-5">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
            <img
              src={review.image}
              alt={review.name}
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-[1.45rem] font-medium text-[#E8E3E3]">{review.name}</h3>
            <p className="text-[1.15rem] font-normal text-white/35">{review.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-lg text-[#7A7A7A]">
          <span>{review.rating.toFixed(1)}</span>
          <RatingStars rating={review.rating} />
        </div>

        <p className="mt-2 text-[1.15rem] font-light leading-[1.5] text-[#D3D3D3] md:min-h-[9.2rem]">
          {reviewLines.map((line, index) => (
            <Fragment key={`${review.name}-${index}`}>
              {line}
              {index < reviewLines.length - 1 ? (
                <>
                  <br />
                  <br />
                </>
              ) : null}
            </Fragment>
          ))}
        </p>
      </div>
    </motion.article>
  );
};

const MarqueeRow = ({ reviews, direction = 'left' }) => {
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max gap-8 px-4 md:gap-14 md:px-2.5 ${
          direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
        }`}
      >
        {reviews.map((review, index) => (
          <ReviewCard
            key={`${direction}-${review.name}-${index}`}
            review={review}
          />
        ))}
      </div>
    </div>
  );
};

const StudentTestimonials = () => {
  return (
    <section className="relative overflow-hidden bg-black py-18 md:py-28" id="student-voices">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[18vw] bg-gradient-to-r from-black via-black/96 to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[18vw] bg-gradient-to-l from-black via-black/96 to-transparent md:block" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="relative inline-flex w-fit border border-brand/35 bg-brand/10 px-4 pb-2 pt-1.5 text-sm font-light uppercase tracking-[0.08em] text-brand md:text-2xl"
        >
          Hear From Our Students
          <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.08 }}
          className="mt-5 mb-5 w-[90%] text-center text-[2.2rem] font-medium capitalize leading-[1.3] text-white md:mb-9 md:text-[3.5rem] md:leading-[4.5rem] lg:w-[75%]"
        >
          We Help Learners Become Industry-Ready Developers.
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ delay: 0.15 }}
        className="relative mt-6 flex flex-col gap-8 md:mt-10 md:gap-12"
      >
        <MarqueeRow reviews={marqueeRows[0]} direction="left" />
        <MarqueeRow reviews={marqueeRows[1]} direction="right" />
      </motion.div>
    </section>
  );
};

export default StudentTestimonials;
