import { motion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { useRef, useState } from 'react';

const reveal = {
  hidden: { opacity: 0, y: 36, scale: 0.98 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const imageTiles = {
  proudMoment: {
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop',
    title: 'Proud Moment For Batch 2.0',
    description:
      'First win of many. Congratulations Kapil on being the first to crack an internship from Batch 2.0.',
    position: 'center',
  },
  spotlight: {
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop',
    title: 'Student Spotlight',
    description:
      'Congratulations to Praful for getting placed at Zerror Studios as a Full Stack Developer.',
    position: 'center',
  },
  nikita: {
    image:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1200&auto=format&fit=crop',
    title: 'Congrats, Nikita!',
    description:
      "Nikita Dwivedi's hard work and determination led her to Maventic Innovative as a Developer.",
    position: 'center',
  },
  champions: {
    image:
      'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1800&auto=format&fit=crop',
    title: 'Celebrating Our Placement Champions',
    description:
      'Meet our success stories. These bright minds secured amazing placements with our guidance and their hard work.',
    position: 'center',
  },
};

const tileBase =
  'overflow-hidden rounded-[1.15rem] bg-black/10 text-white shadow-[0_1px_0_rgba(255,255,255,0.04)]';

function VideoTile({ poster, src, className = '', style }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  return (
    <motion.div
      custom={0.08}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={reveal}
      className={`${tileBase} relative group ${className}`}
      style={style}
    >
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          className="h-full w-full object-cover object-center outline-none"
          poster={poster}
          src={src}
          playsInline
          muted
          loop
          preload="metadata"
        >
          <track kind="captions" label="English" />
        </video>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${
            playing ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
          }`}
        >
          <span className="flex h-[4.15rem] w-[4.15rem] items-center justify-center rounded-full border-[1.8px] border-white text-white">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </button>
      </div>
    </motion.div>
  );
}

function ImageTile({ tile, className = '', style, alwaysVisible = false }) {
  return (
    <motion.a
      href="#courses"
      custom={0.12}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={reveal}
      className={`${tileBase} relative group block ${className}`}
      style={style}
    >
      <img
        src={tile.image}
        alt={tile.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] group-hover:grayscale-[0.08]"
        style={{ objectPosition: tile.position }}
        loading="lazy"
      />

      {alwaysVisible ? (
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/5 to-[#10b981]">
          <div className="absolute right-5 top-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="h-8 w-8" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-8 pt-20 text-white">
            <h3 className="text-[2.4rem] font-semibold leading-[1.02]">{tile.title}</h3>
            <p className="mt-2 max-w-[26rem] text-[1rem] leading-relaxed text-white/90">
              {tile.description}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute right-5 top-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full bg-black text-white transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="h-8 w-8" />
          </div>
          <div className="absolute inset-x-0 bottom-0 hidden min-h-[30%] translate-y-full bg-gradient-to-b from-transparent to-[#10b981] pt-10 transition-transform duration-500 group-hover:translate-y-0 lg:flex">
            <div className="mt-auto p-8 pt-10">
              <h3 className="text-3xl font-extrabold capitalize text-white">{tile.title}</h3>
              <p className="mt-1 max-w-[40rem] text-lg text-white/90">{tile.description}</p>
            </div>
          </div>
        </>
      )}
    </motion.a>
  );
}

function StatTile({ className = '', style }) {
  return (
    <motion.div
      custom={0.16}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={reveal}
      className={`${tileBase} relative bg-[#10b981] ${className}`}
      style={style}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:34px_34px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.18),transparent_40%)]" />
      <div className="relative flex h-full flex-col justify-end p-8 text-white">
        <div className="text-[2.7rem] font-light leading-none tracking-[-0.06em] md:text-[5rem]">
          01
        </div>
        <div className="mt-1 text-[3.4rem] font-light leading-[0.92] tracking-[-0.06em] md:text-[5.6rem]">
          Million
        </div>
        <p className="mt-4 max-w-[14rem] text-lg text-white/85">
          Students Trust Design School To Build Career Momentum.
        </p>
      </div>
    </motion.div>
  );
}

const Community = () => {
  return (
    <section className="w-full rounded-[2.5rem] bg-[#effdf6] py-20 text-black sm:px-6">
      <div className="flex flex-col items-center justify-center">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={reveal}
          className="relative inline-flex w-fit border border-[#10b981]/55 bg-[#10b9811f] px-4 pb-2 pt-1.5 text-xl font-light uppercase leading-[1] text-black/90 md:text-2xl"
        >
          COMMUNITY
          <span className="absolute -left-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-black/60" />
          <span className="absolute -right-[1.5px] -top-[1.5px] h-[3px] w-[3px] bg-black/60" />
          <span className="absolute -bottom-[1.5px] -left-[1.5px] h-[3px] w-[3px] bg-black/60" />
          <span className="absolute -bottom-[1.5px] -right-[1.5px] h-[3px] w-[3px] bg-black/60" />
        </motion.div>

        <motion.div
          custom={0.04}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal}
          className="flex justify-center px-5"
        >
          <div className="mb-5 mt-5 w-[90%] text-center text-[2.2rem] font-medium capitalize leading-[1.3] text-black md:mb-9 md:text-[3.5rem] md:leading-[4.5rem] lg:w-[75%]">
            They Came. They Cooked. They Got Placed.
          </div>
        </motion.div>

        <motion.div
          custom={0.08}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          variants={reveal}
          className="mb-10 flex rounded-2xl bg-gradient-to-b from-white/50 to-transparent p-[0.5px] sm:mb-20"
        >
          <a
            href="#courses"
            className="group rounded-2xl px-8 py-3 text-center text-2xl font-bold text-white transition-all duration-300 hover:[background-position:left_center] hover:shadow-[0_0px_40px_5px_rgba(16,185,129,0.5)] sm:px-10 sm:py-4"
            style={{
              background:
                'linear-gradient(96.76deg, rgb(16, 185, 129) 5.3%, rgb(3, 59, 44) 234.66%) right center / 150% 100% border-box padding-box, border-box',
              transition: 'background-position 300ms, box-shadow 300ms',
            }}
          >
            <div className="relative mx-auto w-max overflow-hidden">
              <div className="transition-transform duration-300 ease-out group-hover:-translate-y-full">
                Explore Courses <span>&rarr;</span>
              </div>
              <div className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0">
                Explore Courses <span>&rarr;</span>
              </div>
            </div>
          </a>
        </motion.div>

        <div className="flex w-full flex-col gap-6 px-6 sm:hidden">
          <VideoTile
            poster="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/krYucg76Kc.webp"
            src="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/krYucg76Kc.webm"
            className="h-[70vh]"
          />
          <ImageTile tile={imageTiles.proudMoment} className="h-[18rem]" />
          <ImageTile tile={imageTiles.spotlight} className="h-[18rem]" />
          <StatTile className="h-[20rem]" />
          <ImageTile tile={imageTiles.nikita} className="h-[22rem]" alwaysVisible />
          <ImageTile tile={imageTiles.champions} className="h-[20rem]" />
          <VideoTile
            poster="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/nrzKSGhzfc.webp"
            src="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/nrzKSGhzfc.webm"
            className="h-[70vh]"
          />
        </div>

        <div className="mx-auto hidden h-[760px] w-full max-w-[1800px] grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(12,minmax(0,1fr))] gap-4 px-4 sm:grid md:gap-6 md:px-6 lg:h-[1120px] lg:px-20">
          <VideoTile
            poster="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/krYucg76Kc.webp"
            src="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/krYucg76Kc.webm"
            style={{ gridColumn: '1 / span 5', gridRow: '1 / span 8' }}
          />

          <ImageTile
            tile={imageTiles.proudMoment}
            style={{ gridColumn: '6 / span 8', gridRow: '1 / span 4' }}
          />

          <ImageTile
            tile={imageTiles.spotlight}
            style={{ gridColumn: '14 / span 5', gridRow: '1 / span 4' }}
          />

          <StatTile style={{ gridColumn: '6 / span 4', gridRow: '5 / span 4' }} />

          <ImageTile
            tile={imageTiles.nikita}
            style={{ gridColumn: '10 / span 4', gridRow: '5 / span 4' }}
            alwaysVisible
          />

          <ImageTile
            tile={imageTiles.champions}
            style={{ gridColumn: '1 / span 13', gridRow: '9 / span 4' }}
          />

          <VideoTile
            poster="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/nrzKSGhzfc.webp"
            src="https://dfdx9u0psdezh.cloudfront.net/CommunitySection/nrzKSGhzfc.webm"
            style={{ gridColumn: '14 / span 5', gridRow: '5 / span 8' }}
          />
        </div>
      </div>
    </section>
  );
};

export default Community;
