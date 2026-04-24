import { motion } from 'framer-motion';
import { Play, Clock, Star, ArrowRight } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: "Full Stack Web Development",
    instructor: "Sarthak Sharma",
    rating: 4.9,
    reviews: 1240,
    duration: "6 Months",
    price: "₹14,999",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop",
    isPopular: true
  },
  {
    id: 2,
    title: "Mastering React & Next.js",
    instructor: "Harsh Vandana",
    rating: 4.8,
    reviews: 850,
    duration: "3 Months",
    price: "₹8,999",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "UI/UX Design Mastery",
    instructor: "Muskan Sharma",
    rating: 4.9,
    reviews: 620,
    duration: "4 Months",
    price: "₹12,499",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=2070&auto=format&fit=crop",
  }
];

const Courses = () => {
  return (
    <section className="py-32 bg-black relative px-8">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-10 h-[1px] bg-brand" />
              <span className="text-brand text-[12px] font-bold tracking-[0.3em] uppercase">Curated Learning</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black text-white tracking-tighter"
            >
              Explore Our <span className="text-brand">Top</span> Courses
            </motion.h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold flex items-center gap-3 group transition-colors hover:bg-zinc-800"
          >
            View All Courses
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] overflow-hidden hover:border-brand/30 transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative h-[280px] overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60" />

                {course.isPopular && (
                  <div className="absolute top-6 left-6 px-4 py-1.5 bg-brand text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                    Popular
                  </div>
                )}

                <button className="absolute bottom-6 right-6 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <Play className="w-6 h-6 fill-current" />
                </button>
              </div>

              {/* Content */}
              <div className="p-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold">{course.rating}</span>
                  </div>
                  <span className="text-zinc-500 text-xs font-medium">({course.reviews} reviews)</span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-6 group-hover:text-brand transition-colors line-clamp-2 leading-tight">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between pt-8 border-t border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                      {course.instructor.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Mentor</span>
                      <span className="text-sm text-zinc-200 font-bold">{course.instructor}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-brand tracking-tighter">{course.price}</span>
                    <span className="text-[10px] text-zinc-500 font-bold flex items-center justify-end gap-1 uppercase">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;
