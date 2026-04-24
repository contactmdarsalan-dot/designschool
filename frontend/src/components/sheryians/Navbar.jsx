import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { clearAuthSession, getRefreshToken, getStoredUser, isAuthenticated, subscribeToAuthChanges } from '../../lib/auth';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [session, setSession] = useState({
    authenticated: isAuthenticated(),
    user: getStoredUser(),
  });
  const lastScrollY = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setSession({
        authenticated: isAuthenticated(),
        user: getStoredUser(),
      });
    });
    return unsubscribe;
  }, []);

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
    if (!href) {
      return false;
    }

    if (href === '/') {
      return location.pathname === '/';
    }

    if (href === '/courses') {
      return location.pathname === '/courses' || location.pathname.startsWith('/courses/');
    }

    if (href === '/blog') {
      return location.pathname === '/blog' || location.pathname.startsWith('/blog/');
    }

    if (href === '/free-resources') {
      return location.pathname === '/free-resources' || location.pathname.startsWith('/free-resources/');
    }

    if (href === '/request-callback') {
      return location.pathname === '/request-callback';
    }

    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    return location.pathname === href;
  };

  const handleLogout = async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await apiFetch('auth/logout/', {
          method: 'POST',
          auth: true,
          body: { refresh },
        });
      }
    } catch {
      // We still clear local auth state even if the network request fails.
    } finally {
      clearAuthSession();
      setMenuOpen(false);
      navigate('/');
    }
  };

  const actionLinks = session.authenticated
    ? [
        {
          label: session.user?.role === 'student' ? 'Dashboard' : 'Account',
          to: '/dashboard',
          variant: 'primary',
        },
      ]
    : [
        { label: 'Sign In', to: '/login', variant: 'secondary' },
        { label: 'Register', to: '/register', variant: 'primary' },
      ];

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
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative">
            <Brain className="relative z-10 h-8 w-8 text-white" />
            <div className="absolute inset-0 rounded-full bg-brand/20 blur-lg" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-white">Design School</span>
          </div>
        </Link>

        <nav
          className={`hidden items-center gap-8 rounded-xl border px-8 py-3 backdrop-blur-md transition-colors md:flex ${
            hasScrolled || menuOpen
              ? 'border-white/14 bg-black/28 shadow-[0_18px_55px_rgba(0,0,0,0.42)]'
              : 'border-zinc-800/50 bg-zinc-900/50 shadow-2xl'
          }`}
        >
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`text-[14px] font-medium transition-all duration-300 ${
                isActiveLink(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {session.authenticated ? (
            <>
              <div className="rounded-lg border border-white/14 bg-white/[0.02] px-3 py-2 text-sm text-white/70">
                {session.user?.first_name || session.user?.email || 'Student'}
              </div>
              <Link
                to="/dashboard"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.06]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.06]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button className="p-2 text-white md:hidden" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-0 right-0 top-full flex flex-col gap-6 border-b border-zinc-800 bg-black/95 p-8 backdrop-blur-xl md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-lg font-medium transition-colors ${
                  isActiveLink(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-zinc-800" />
            <div className="grid grid-cols-2 gap-3">
              {session.authenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 bg-white/[0.02] px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/35 hover:bg-white/[0.06]"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                actionLinks.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className={`text-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-brand font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] hover:bg-emerald-400'
                        : 'border border-white/20 bg-white/[0.02] text-white/90 hover:border-white/35 hover:bg-white/[0.06]'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {action.label}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
