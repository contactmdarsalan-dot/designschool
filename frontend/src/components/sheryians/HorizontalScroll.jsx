import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, BookOpen, Brain, Code2, Palette, Rocket, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { apiFetch } from '../../lib/api';

const fallbackImages = [
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2064&auto=format&fit=crop',
];

const iconMap = {
  BookOpen,
  Brain,
  Code2,
  Palette,
  Rocket,
  Trophy,
  Users,
};

const normalizeCategoryCard = (category, index) => ({
  id: category.id || category.slug || index,
  title: category.name || 'Course Category',
  description: category.short_description || 'Explore focused programs designed for practical outcomes.',
  image: category.image_url || fallbackImages[index % fallbackImages.length],
  badge: category.badge || (index === 0 ? 'Featured' : ''),
  iconUrl: category.icon_url || '',
  icon: iconMap[category.icon_name] || iconMap.Brain,
  href: `/courses?category=${category.slug}`,
});

const Card = ({ card, index, scrollYProgress }) => {
  const staggerY = index % 2 === 0 ? 80 : -80;
  const y = useTransform(scrollYProgress, [0, 0.4], [staggerY, 0]);

  // Handle icon gracefully
  const Icon = card.icon || Brain;

  return (
    <motion.div
      style={{ y }}
      className="relative shrink-0 w-[420px] h-[520px] rounded-[32px] overflow-hidden group cursor-pointer border border-zinc-800/50 bg-zinc-900 shadow-2xl"
    >
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Crown Doodle for first card */}
      {index === 0 && (
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <path d="M10 60L30 20L60 50L90 20L110 60H10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="10" cy="60" r="4" fill="currentColor" />
            <circle cx="30" cy="20" r="4" fill="currentColor" />
            <circle cx="60" cy="50" r="4" fill="currentColor" />
            <circle cx="90" cy="20" r="4" fill="currentColor" />
            <circle cx="110" cy="60" r="4" fill="currentColor" />
          </svg>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-60" />
      
      {/* Badge */}
      {card.badge && (
        <div className="absolute top-8 left-8 bg-brand px-5 py-2 rounded-full flex items-center gap-2 shadow-lg z-20">
          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-black uppercase tracking-widest">{card.badge}</span>
        </div>
      )}

      {/* Icon Overlay */}
      <div className="absolute top-8 left-8 w-14 h-14 bg-black/40 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
        {card.iconUrl ? (
          <img src={card.iconUrl} alt="" className="h-7 w-7 object-contain" />
        ) : (
          <Icon className="w-6 h-6 text-brand" />
        )}
      </div>

      {/* Arrow Icon */}
      <Link
        to={card.href}
        className="absolute top-8 right-8 w-14 h-14 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 group-hover:bg-brand group-hover:text-black transition-all duration-500 shadow-xl z-20"
        aria-label={`View ${card.title} courses`}
      >
        <ArrowUpRight className="w-6 h-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
      </Link>

      {/* Content */}
      <div className="absolute bottom-10 left-10 right-10 z-20">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-brand transition-colors">{card.title}</h3>
        {card.description && (
          <p className="text-zinc-400 text-[13px] leading-relaxed line-clamp-2 transition-all group-hover:text-white/90">
            {card.description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const HorizontalScroll = () => {
  const targetRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const { response, payload } = await apiFetch('courses/categories/');
        if (!response.ok) {
          return;
        }
        const categoryRows = Array.isArray(payload) ? payload : payload?.data?.categories || payload?.data || [];
        if (isMounted) {
          setCategories(
            categoryRows
              .filter((category) => category.show_on_home !== false)
              .sort((left, right) => (left.sort_order || 0) - (right.sort_order || 0)),
          );
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(() => categories.map(normalizeCategoryCard), [categories]);
  const x = useTransform(scrollYProgress, [0.1, 1], ['0%', cards.length > 3 ? '-60%' : '-25%']);

  if (!cards.length) {
    return null;
  }

  return (
    <section ref={targetRef} className="relative h-[300vh] bg-black">
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 mb-16 text-center">
          {/* Impact Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block relative px-6 py-1.5 mb-8 group"
          >
            <span className="absolute inset-0 bg-zinc-900 border border-brand/50 rounded-sm" />
            <span className="absolute -top-1 -left-1 w-2 h-2 bg-brand border border-black" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand border border-black" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-brand border border-black" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-brand border border-black" />
            <span className="relative z-10 text-brand text-[11px] font-bold tracking-[0.2em] uppercase">Impact</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[42px] md:text-[56px] font-extrabold text-white tracking-tight leading-[1.1]"
          >
            Explore The Skills That Move You <br /> Faster And Better
          </motion.h2>
        </div>

        <motion.div style={{ x }} className="flex gap-10 px-[10%]">
          {cards.map((card, index) => (
            <Card key={card.id} card={card} index={index} scrollYProgress={scrollYProgress} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScroll;
