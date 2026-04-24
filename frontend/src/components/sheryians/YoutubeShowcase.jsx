import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, ArrowUpRight } from 'lucide-react';
import { useRef, useState } from 'react';

const videos = [
  {
    title: 'How to Get Placed in Tech in 2025 (No Luck, Just Skills)',
    views: '43k Views',
    likes: '2.8k Likes',
    href: 'https://youtu.be/VeAYpzd4e4U',
    thumbnail: 'https://i.ytimg.com/vi/VeAYpzd4e4U/hqdefault.jpg',
  },
  {
    title: 'Complete Web Development Roadmap 2025',
    views: '128k Views',
    likes: '6.2k Likes',
    href: 'https://youtu.be/SDQpAzYsfYk',
    thumbnail: 'https://i.ytimg.com/vi/SDQpAzYsfYk/hqdefault.jpg',
  },
  {
    title: 'Master JavaScript in 30 Days - Full Course',
    views: '840k Views',
    likes: '22k Likes',
    href: 'https://youtu.be/a-wVHL0lpb0',
    thumbnail: 'https://i.ytimg.com/vi/a-wVHL0lpb0/hqdefault.jpg',
  },
  {
    title: 'React.js Complete Tutorial for Beginners',
    views: '444k Views',
    likes: '14k Likes',
    href: 'https://youtu.be/3LRZRSIh_KE',
    thumbnail: 'https://i.ytimg.com/vi/3LRZRSIh_KE/hqdefault.jpg',
  },
];

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 90,
    scale: 0.94,
  },
  show: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.12 + index * 0.08,
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const YoutubeShowcase = () => {
  const defaultActiveIndex = Math.min(1, videos.length - 1);
  const [activeIndex, setActiveIndex] = useState(defaultActiveIndex);
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const headingY = useTransform(scrollYProgress, [0, 1], [60, -20]);
  const headingOpacity = useTransform(scrollYProgress, [0.05, 0.28], [0, 1]);
  const cardsX = useTransform(scrollYProgress, [0.15, 0.85], ['24%', '-20%']);
  const cardsY = useTransform(scrollYProgress, [0.15, 0.5], [48, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black px-0 py-20 md:py-28"
      id="youtube"
    >
      <motion.div
        style={{ y: headingY, opacity: headingOpacity }}
        className="mx-auto mb-8 flex w-full max-w-7xl flex-col items-center justify-center px-6 text-center md:mb-10 md:px-8"
      >
        <div className="relative inline-flex w-fit border border-brand/35 bg-brand/10 px-4 pb-2 pt-1.5 text-xl font-light uppercase leading-[1] text-brand md:text-2xl">
          YOUTUBE
          <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-white" />
          <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-white" />
        </div>

        <h2 className="mt-5 mb-5 w-[90%] text-center text-[2.2rem] font-medium capitalize leading-[1.3] text-white md:mb-9 md:text-[3.5rem] md:leading-[4.5rem] lg:w-[75%]">
          200+ Free Coding & Design Tutorials On Design School
        </h2>
      </motion.div>

      <div className="relative overflow-hidden py-6 md:py-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-[12vw] bg-gradient-to-r from-black via-black/95 to-transparent md:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-[12vw] bg-gradient-to-l from-black via-black/95 to-transparent md:block" />

        <motion.div
          style={{ x: cardsX, y: cardsY }}
          className="flex w-max gap-5 pr-6 md:gap-7"
          onMouseLeave={() => setActiveIndex(defaultActiveIndex)}
        >
          {videos.map((video, index) => (
            <motion.div key={video.href} style={{ zIndex: activeIndex === index ? 30 : 10 }}>
              <motion.a
                href={video.href}
                target="_blank"
                rel="noreferrer"
                custom={index}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.35 }}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className={`group shrink-0 overflow-hidden rounded-2xl border p-4 backdrop-blur-[18px] transition-[transform,opacity,filter,border-color,background-color,box-shadow] duration-500 w-[70vw] sm:w-[26rem] md:w-[33rem] lg:w-[35rem] ${
                  activeIndex === index
                    ? 'border-brand/35 bg-zinc-950/95 shadow-[inset_0_33px_68px_rgba(255,255,255,0.08),0_8px_34px_rgba(0,0,0,0.35)] md:scale-100 md:opacity-100 md:blur-0'
                    : 'border-zinc-800/80 bg-black/75 shadow-[inset_0_20px_40px_rgba(255,255,255,0.04),0_4px_7px_rgba(0,0,0,0.05),0_4px_4px_rgba(0,0,0,0.08)] md:scale-[0.86] md:opacity-30 md:blur-[4px] md:saturate-[0.65]'
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-colors duration-300 group-hover:border-brand/40 group-hover:text-brand">
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </div>
                  <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition-all duration-300 group-hover:border-brand/40 group-hover:bg-brand/15 group-hover:text-brand">
                    <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>

                <div className="pt-3 font-light">
                  <h3 className="mb-2 line-clamp-2 text-[1.2rem] font-medium tracking-wide text-white">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[0.95rem] text-white/60">
                    <span>{video.views}</span>
                    <span>&bull;</span>
                    <span>{video.likes}</span>
                  </div>
                </div>
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default YoutubeShowcase;
