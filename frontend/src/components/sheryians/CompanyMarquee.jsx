import { motion } from 'framer-motion';

const companies = [
  "Walmart", "Microsoft", "Nagarro", "Amazon", "Google", "Meta", "Adobe", "Netflix",
  "Walmart", "Microsoft", "Nagarro", "Amazon", "Google", "Meta", "Adobe", "Netflix"
];

const CompanyMarquee = () => {
  return (
    <section className="py-20 bg-black overflow-hidden relative">
      {/* Gradient Mask */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />

      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-24 items-center px-12"
        >
          {companies.map((company, index) => (
            <span 
              key={index} 
              className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tighter uppercase select-none transition-colors hover:text-brand/20"
              style={{
                WebkitTextStroke: '1px rgba(255, 255, 255, 0.05)',
              }}
            >
              {company}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CompanyMarquee;
