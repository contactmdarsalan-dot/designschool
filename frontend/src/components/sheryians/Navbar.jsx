import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  ArrowRight,
  BookOpen,
  Brain,
  ChevronDown,
  Layers,
  LayoutGrid,
  Menu,
  PenTool,
  Route,
  Search,
  Sparkles,
  Star,
  UsersRound,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { normalizeCourseCard } from '../../lib/courseContent';
import {
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  isAdminUser,
  isAuthenticated,
  subscribeToAuthChanges,
} from '../../lib/auth';

const categoryIconMap = {
  Brain,
  Layers,
  LayoutGrid,
  PenTool,
  Sparkles,
};

const fallbackCourseCategories = [
  { label: 'UI/UX Design', href: '/courses?q=ui%2Fux', icon: PenTool, description: 'Interface craft, flows, and visual hierarchy' },
  { label: 'Product Design', href: '/courses?q=product', icon: Layers, description: 'Research-led product thinking and critique' },
  { label: 'Web Design', href: '/courses?q=web', icon: LayoutGrid, description: 'Responsive pages, systems, and launch polish' },
  { label: 'Figma', href: '/courses?q=figma', icon: Sparkles, description: 'Prototyping, variants, and handoff workflows' },
  { label: 'Design Systems', href: '/courses?q=design%20systems', icon: Brain, description: 'Reusable patterns for serious teams' },
];

const fallbackFeaturedCourses = [
  { label: 'Beginner UI/UX', href: '/courses?q=beginner%20ui%2Fux', description: 'Start with layout, usability, and portfolio basics' },
  { label: 'UX Research', href: '/courses?q=ux%20research', description: 'Learn interviews, synthesis, and product insight' },
  { label: 'Portfolio Mastery', href: '/courses?q=portfolio', description: 'Shape case studies that hiring teams can scan' },
  { label: 'Figma Advanced', href: '/courses?q=figma%20advanced', description: 'Move from wireframes to production handoff systems' },
];

const fallbackLearningPaths = [
  { label: 'Become a Product Designer', href: '/paths', description: 'UI fundamentals, research, portfolio, and critique' },
  { label: 'Design Systems Track', href: '/paths', description: 'Components, tokens, accessibility, and documentation' },
  { label: 'UX Research Sprint', href: '/paths', description: 'Interview planning, synthesis, and insight reporting' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [dynamicFeaturedCourses, setDynamicFeaturedCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [session, setSession] = useState({
    authenticated: isAuthenticated(),
    user: getStoredUser(),
  });
  const lastScrollY = useRef(0);
  const coursesTriggerRef = useRef(null);
  const megaMenuRef = useRef(null);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setMobileCoursesOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    let isCancelled = false;

    const loadMenuData = async () => {
      try {
        const [categoryResult, courseResult] = await Promise.all([
          apiFetch('courses/categories/'),
          apiFetch('public/courses/?page=1&limit=6&featured=true'),
        ]);

        if (isCancelled) {
          return;
        }

        if (categoryResult.response.ok) {
          const rows = Array.isArray(categoryResult.payload)
            ? categoryResult.payload
            : categoryResult.payload?.data?.categories || categoryResult.payload?.data || [];
          setDynamicCategories(
            rows
              .filter((category) => category.show_on_home !== false)
              .slice(0, 5)
              .map((category) => ({
                label: category.name,
                href: `/courses?category=${category.slug}`,
                icon: categoryIconMap[category.icon_name] || Brain,
                description: category.short_description || 'Explore focused lessons and projects',
              })),
          );
        }

        if (courseResult.response.ok) {
          const courses = (courseResult.payload?.data?.courses || []).map(normalizeCourseCard).slice(0, 3);
          setDynamicFeaturedCourses(
            courses.map((course) => ({
              label: course.title,
              href: course.href,
              description: course.description || `${course.featuredCard.durationValue} ${course.featuredCard.durationLabel} pathway`,
              category: course.category?.name || course.tags?.[0] || 'Featured',
              ratingAvg: course.ratingAvg,
              ratingCount: course.ratingCount,
              thumbnail: course.thumbnail,
            })),
          );
        }
      } catch {
        if (!isCancelled) {
          setDynamicCategories([]);
          setDynamicFeaturedCourses([]);
        }
      }
    };

    loadMenuData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Paths', href: '/paths' },
    { name: 'Assess Skills', href: '/assess-skills' },
    { name: 'Blog', href: '/blog' },
    { name: 'Free Resources', href: '/free-resources' },
    { name: 'Request Callback', href: '/request-callback' },
  ];

  const courseCategories = useMemo(
    () => (dynamicCategories.length > 0 ? dynamicCategories : fallbackCourseCategories),
    [dynamicCategories],
  );

  const featuredCourses = useMemo(
    () => (dynamicFeaturedCourses.length > 0 ? dynamicFeaturedCourses : fallbackFeaturedCourses),
    [dynamicFeaturedCourses],
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredCourseCategories = useMemo(() => {
    if (!normalizedSearchQuery) {
      return courseCategories;
    }

    const matches = courseCategories.filter((item) => (
      `${item.label} ${item.description}`.toLowerCase().includes(normalizedSearchQuery)
    ));
    return matches.length > 0 ? matches : courseCategories;
  }, [courseCategories, normalizedSearchQuery]);

  const filteredFeaturedCourses = useMemo(() => {
    if (!normalizedSearchQuery) {
      return featuredCourses;
    }

    const matches = featuredCourses.filter((item) => (
      `${item.label} ${item.description} ${item.category || ''}`.toLowerCase().includes(normalizedSearchQuery)
    ));
    return matches.length > 0 ? matches : featuredCourses;
  }, [featuredCourses, normalizedSearchQuery]);

  const learningPathItems = useMemo(() => {
    if (filteredCourseCategories.length === 0) {
      return fallbackLearningPaths;
    }

    return filteredCourseCategories.slice(0, 3).map((item, index) => ({
      label: index === 0 ? 'Become a Product Designer' : `${item.label} Path`,
      href: '/paths',
      description: item.description,
    }));
  }, [filteredCourseCategories]);

  const activeCategory = filteredCourseCategories[activeCategoryIndex] || filteredCourseCategories[0] || courseCategories[0];
  const featuredCourse = filteredFeaturedCourses[0] || featuredCourses[0];
  const featuredRatings = featuredCourses.map((course) => Number(course.ratingAvg || 0)).filter(Boolean);
  const averageRating = featuredRatings.length
    ? (featuredRatings.reduce((sum, rating) => sum + rating, 0) / featuredRatings.length).toFixed(1)
    : '4.9';

  useEffect(() => {
    setActiveCategoryIndex(0);
  }, [normalizedSearchQuery, courseCategories.length]);

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

    if (href === '/paths') {
      return location.pathname === '/paths';
    }

    if (href === '/assess-skills') {
      return location.pathname === '/assess-skills' || location.pathname === '/assess/skills';
    }

    if (href === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/dashboard/');
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

  const closeMenus = () => {
    setMenuOpen(false);
    setMegaOpen(false);
    setMobileCoursesOpen(false);
    setSearchQuery('');
  };

  const actionLinks = session.authenticated
    ? [
        {
          label: isAdminUser() ? 'Admin Panel' : 'Dashboard',
          to: isAdminUser() ? '/admin-panel' : '/dashboard',
          variant: 'primary',
        },
      ]
    : [
        { label: 'Sign In', to: '/login', variant: 'secondary' },
        { label: 'Register', to: '/register', variant: 'primary' },
      ];

  const focusFirstMegaControl = () => {
    window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  };

  const openMegaMenu = () => {
    setMegaOpen(true);
    focusFirstMegaControl();
  };

  const handleCoursesTriggerKeyDown = (event) => {
    if (event.key === 'Escape') {
      setMegaOpen(false);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMegaMenu();
    }
  };

  const handleMegaKeyDown = (event) => {
    if (event.key === 'Escape') {
      setMegaOpen(false);
      coursesTriggerRef.current?.focus();
      return;
    }

    if (event.key !== 'Tab' || !megaMenuRef.current) {
      return;
    }

    const focusable = Array.from(
      megaMenuRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])'),
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleCategoryKeyDown = (event, index) => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !megaMenuRef.current) {
      return;
    }

    event.preventDefault();
    const nextIndex = event.key === 'ArrowDown'
      ? (index + 1) % filteredCourseCategories.length
      : (index - 1 + filteredCourseCategories.length) % filteredCourseCategories.length;
    setActiveCategoryIndex(nextIndex);
    megaMenuRef.current.querySelectorAll('[data-category-item]')?.[nextIndex]?.focus();
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
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              ref={coursesTriggerRef}
              type="button"
              className={`flex items-center gap-1.5 text-[14px] font-medium transition-all duration-300 ${
                isActiveLink('/courses') ? 'text-white' : 'text-zinc-400 hover:text-white'
              }`}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => (megaOpen ? setMegaOpen(false) : openMegaMenu())}
              onFocus={() => setMegaOpen(true)}
              onKeyDown={handleCoursesTriggerKeyDown}
            >
              Courses
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  ref={megaMenuRef}
                  role="dialog"
                  aria-label="Course navigation"
                  onKeyDown={handleMegaKeyDown}
                  className="fixed left-1/2 top-24 w-[min(1080px,calc(100vw-48px))] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/12 bg-[#050505]/95 shadow-[0_28px_90px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
                >
                  <div className="border-b border-white/10 bg-white/[0.025] p-4">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search courses, paths, UI/UX, Figma..."
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/45 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-brand/60"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-[0.95fr_1fr_0.85fr_0.95fr] gap-0">
                    <div className="border-r border-white/10 p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Explore</p>
                      <div className="space-y-1">
                        {filteredCourseCategories.map((item, index) => {
                          const Icon = item.icon;
                          const active = item.label === activeCategory?.label;
                          return (
                            <Link
                              key={item.label}
                              data-category-item
                              to={item.href}
                              className={`group flex gap-3 rounded-xl px-3 py-3 transition-colors focus:outline-none ${
                                active
                                  ? 'bg-brand/10 text-white'
                                  : 'hover:bg-white/[0.07] focus:bg-white/[0.07]'
                              }`}
                              onMouseEnter={() => setActiveCategoryIndex(index)}
                              onFocus={() => setActiveCategoryIndex(index)}
                              onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                              onClick={closeMenus}
                            >
                              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/[0.04] text-brand transition-colors ${
                                active ? 'border-brand/50 bg-brand/15' : 'border-white/10 group-hover:border-brand/40 group-hover:bg-brand/10'
                              }`}>
                                <Icon size={18} />
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-white">{item.label}</span>
                                <span className="mt-0.5 block text-xs leading-5 text-zinc-400">{item.description}</span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                      {activeCategory ? (
                        <div className="mt-4 rounded-xl border border-brand/20 bg-brand/[0.06] p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Preview</p>
                          <p className="mt-2 text-sm font-semibold text-white">{activeCategory.label}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400">{activeCategory.description}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="border-r border-white/10 p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Featured Courses</p>
                      <div className="space-y-2">
                        {filteredFeaturedCourses.slice(0, 4).map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="block rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-white/10 hover:bg-white/[0.06] focus:border-white/10 focus:bg-white/[0.06] focus:outline-none"
                            onClick={closeMenus}
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="block text-sm font-semibold text-white">{item.label}</span>
                              {item.ratingAvg ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-200">
                                  <Star size={12} />
                                  {Number(item.ratingAvg).toFixed(1)}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-zinc-400">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/courses"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white transition-colors hover:border-brand/50 hover:text-brand"
                        onClick={closeMenus}
                      >
                        <BookOpen size={15} />
                        View all courses
                      </Link>
                    </div>

                    <div className="border-r border-white/10 p-5">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Popular Paths</p>
                      <div className="space-y-2">
                        {learningPathItems.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="group block rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-brand/25 hover:bg-brand/[0.07] focus:border-brand/25 focus:bg-brand/[0.07] focus:outline-none"
                            onClick={closeMenus}
                          >
                            <span className="flex items-center gap-2 text-sm font-semibold text-white">
                              <Route size={15} className="text-brand" />
                              {item.label}
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-zinc-400">{item.description}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to="/paths"
                        className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand hover:text-emerald-200"
                        onClick={closeMenus}
                      >
                        Open learning paths
                        <ArrowRight size={14} />
                      </Link>
                    </div>

                    <div className="p-5">
                      <div className="flex h-full flex-col justify-between rounded-2xl border border-brand/25 bg-brand/[0.08] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <div>
                          {featuredCourse?.thumbnail ? (
                            <img
                              src={featuredCourse.thumbnail}
                              alt=""
                              className="mb-4 h-24 w-full rounded-xl object-cover opacity-85"
                              loading="lazy"
                            />
                          ) : (
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-black">
                              <Award size={21} />
                            </div>
                          )}
                          <p className="text-lg font-bold leading-tight text-white">Start your design career</p>
                          <p className="mt-3 text-sm leading-6 text-zinc-300">
                            Build a guided path through lessons, projects, mentor review, and portfolio polish.
                          </p>
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                              <BookOpen size={15} className="text-brand" />
                              <p className="mt-2 text-sm font-semibold text-white">{featuredCourses.length}+ courses</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                              <Star size={15} className="text-brand" />
                              <p className="mt-2 text-sm font-semibold text-white">{averageRating} rating</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                            <UsersRound size={14} className="text-brand" />
                            Mentor-led path preview
                          </div>
                        </div>
                        <Link
                          to={featuredCourse?.href || '/courses?q=ui%2Fux'}
                          className="mt-6 inline-flex items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-brand"
                          onClick={closeMenus}
                        >
                          Find your path
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
                to={isAdminUser() ? '/admin-panel' : '/dashboard'}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
              >
                {isAdminUser() ? 'Admin Panel' : 'Dashboard'}
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-4 text-left text-lg font-medium text-white"
                aria-expanded={mobileCoursesOpen}
                onClick={() => setMobileCoursesOpen((open) => !open)}
              >
                Courses
                <ChevronDown
                  size={18}
                  className={`transition-transform duration-200 ${mobileCoursesOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {mobileCoursesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-1 px-3 pb-4">
                      {courseCategories.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                            onClick={closeMenus}
                          >
                            <Icon size={18} className="text-brand" />
                            <span>
                              <span className="block text-sm font-semibold">{item.label}</span>
                              <span className="block text-xs text-zinc-500">{item.description}</span>
                            </span>
                          </Link>
                        );
                      })}
                      <Link
                        to="/courses"
                        className="mt-2 rounded-lg bg-brand px-4 py-3 text-center text-sm font-bold text-black"
                        onClick={closeMenus}
                      >
                        Browse all courses
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <hr className="border-zinc-800" />
            <div className="grid grid-cols-2 gap-3">
              {session.authenticated ? (
                <>
                  <Link
                    to={isAdminUser() ? '/admin-panel' : '/dashboard'}
                    className="text-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-colors hover:bg-emerald-400"
                    onClick={() => setMenuOpen(false)}
                  >
                    {isAdminUser() ? 'Admin Panel' : 'Dashboard'}
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
