import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateNavbarVisibility = () => {
      const currentScrollY = window.scrollY || 0;
      const scrollDelta = currentScrollY - lastScrollY.current;

      setHasScrolled(currentScrollY > 18);

      if (menuOpen || currentScrollY < 24) {
        setShowNav(true);
      } else if (scrollDelta > 6) {
        setShowNav(false);
      } else if (scrollDelta < -6) {
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    updateNavbarVisibility();
    window.addEventListener('scroll', updateNavbarVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateNavbarVisibility);
    };
  }, [menuOpen]);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Blog', href: '/blog' },
    { name: 'Free Resources', href: '/free-resources' },
    { name: 'Request Callback', href: '/request-callback' },
  ];

  const isActiveLink = (href) => {
    if (!href || href === '#') {
      return false;
    }

    if (href === '/') {
      return location.pathname === '/';
    }

    if (href === '/courses') {
      return location.pathname === '/courses' || location.pathname.startsWith('/courses/');
    }

    if (href === '/blog') {
      return location.pathname === '/blog';
    }

    if (href === '/free-resources') {
      return (
        location.pathname === '/free-resources' ||
        location.pathname === '/play-code-game' ||
        location.pathname.startsWith('/play-code-game/')
      );
    }

    if (href === '/request-callback') {
      return location.pathname === '/request-callback';
    }

    return location.pathname === href;
  };

  return (
    <motion.header
      initial={false}
      animate={{
        y: showNav ? 0 : -120,
        opacity: showNav ? 1 : 0,
      }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 right-0 top-0 z-[100] transition-[padding,background-color,backdrop-filter,border-color,box-shadow] duration-300 ${
        hasScrolled || menuOpen
          ? 'border-b border-white/10 bg-[#070707]/62 py-3 backdrop-blur-2xl shadow-[0_14px_44px_rgba(0,0,0,0.42)]'
          : 'border-b border-transparent bg-transparent py-6'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative">
            <Brain className="w-8 h-8 text-white relative z-10" />
            <div className="absolute inset-0 bg-brand/20 blur-lg rounded-full" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-white tracking-tight">Design School</span>

          </div>
        </a>

        {/* Desktop Nav - Floating Bar */}
        <nav
          className={`hidden items-center gap-8 rounded-xl border px-8 py-3 backdrop-blur-md transition-colors md:flex ${
            hasScrolled || menuOpen
              ? 'border-white/14 bg-black/28 shadow-[0_18px_55px_rgba(0,0,0,0.42)]'
              : 'border-zinc-800/50 bg-zinc-900/50 shadow-2xl'
          }`}
        >
          {links.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={`text-[14px] font-medium transition-all duration-300 ${
                isActiveLink(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <button
            type="button"
            className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.06]"
          >
            Sign In
          </button>
          <Link
            to="/register"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
          >
            Register
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-zinc-800 p-8 flex flex-col gap-6 md:hidden"
          >
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-lg font-medium transition-colors ${
                  isActiveLink(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <hr className="border-zinc-800" />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.06]"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </button>
              <Link
                to="/register"
                className="text-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
