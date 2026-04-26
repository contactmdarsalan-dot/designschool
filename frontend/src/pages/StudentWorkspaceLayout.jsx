import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Brain,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquareMore,
  Search,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { clearAuthSession, getStoredUser, subscribeToAuthChanges } from '../lib/auth';
import { STUDENT_WORKSPACE_NAV, cx, getInitials, getStudentWorkspaceMeta } from '../lib/studentWorkspace';
import { SHELL_EASE } from '../lib/studentWorkspaceMotion';

const sidebarMotion = {
  hidden: { opacity: 0, x: -18 },
  show: { opacity: 1, x: 0, transition: { duration: 0.42, ease: SHELL_EASE } },
};

const contentMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: SHELL_EASE } },
};

const SidebarContent = ({ user, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col">
    <div className="border-b border-[#e6ecf5] px-6 py-6">
      <NavLink to="/" className="flex items-center gap-3" onClick={onNavigate}>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <Brain className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[1.6rem] font-semibold tracking-tight text-[#22324d]">Design School</p>
        </div>
      </NavLink>
    </div>

    <div className="flex-1 space-y-8 px-3 py-5">
      <div>
        <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">Student</p>
        <div className="space-y-1">
          {STUDENT_WORKSPACE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.key}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cx(
                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-[1rem] transition',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'text-[#4c6080] hover:bg-[#f5f7fb] hover:text-[#22324d]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className={cx('h-4.5 w-4.5', isActive ? 'text-emerald-600' : 'text-[#7387a5] group-hover:text-[#22324d]')} />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 px-3">
        <p className="pb-3 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">Workspace</p>
        <div className="rounded-[1rem] border border-[#e5ebf5] bg-[#f8fbff] px-4 py-4">
          <p className="text-sm font-medium text-[#22324d]">{user?.first_name || user?.email || 'Student'}</p>
          <p className="mt-1 text-sm text-[#7e8ba3]">{user?.email || 'student@designschool.com'}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl border border-[#e5ebf5] bg-white px-4 py-3 text-left text-sm font-medium text-[#5e6f89] transition hover:bg-[#f5f7fb] hover:text-[#22324d]"
        >
          <LogOut className="h-4.5 w-4.5" />
          Sign out
        </button>
      </div>
    </div>
  </div>
);

const StudentWorkspaceLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      setUser(getStoredUser());
    });

    return unsubscribe;
  }, []);

  const pageMeta = useMemo(() => getStudentWorkspaceMeta(location.pathname), [location.pathname]);

  useEffect(() => {
    document.title = `${pageMeta.label} | Student Workspace`;
  }, [pageMeta.label]);

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#22324d] selection:bg-emerald-100 selection:text-emerald-900">
      <main className="min-h-screen">
        <motion.aside
          variants={sidebarMotion}
          initial="hidden"
          animate="show"
          className="hidden border-r border-[#e6ecf5] bg-white xl:fixed xl:inset-y-0 xl:left-0 xl:z-40 xl:block xl:w-[290px] xl:overflow-y-auto"
        >
          <SidebarContent user={user} onLogout={handleLogout} />
        </motion.aside>

        <div className="min-w-0 xl:pl-[290px]">
          <header className="sticky top-0 z-30 border-b border-[#e6ecf5] bg-white/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-8">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#e3e9f3] bg-white text-[#5e6f89] xl:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="relative hidden max-w-[440px] flex-1 md:block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91a0b8]" />
                  <input
                    readOnly
                    className="w-full rounded-xl border border-[#e3e9f3] bg-[#fbfcfe] py-3 pl-11 pr-4 text-sm text-[#22324d] outline-none placeholder:text-[#9aa8bd]"
                    placeholder="Search anything"
                  />
                </div>

                <div className="min-w-0 xl:hidden">
                  <p className="truncate text-lg font-semibold text-[#22324d]">{pageMeta.label}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#6d7f99] transition hover:bg-[#f3f6fb] hover:text-[#22324d]"
                >
                  <MessageSquareMore className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#6d7f99] transition hover:bg-[#f3f6fb] hover:text-[#22324d]"
                >
                  <Bell className="h-4.5 w-4.5" />
                </button>
                <div className="hidden items-center gap-3 md:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-700">
                    {getInitials(user?.first_name || user?.email || 'Student')}
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs text-[#8a99b1]">Student</p>
                    <p className="max-w-[220px] truncate text-sm font-medium text-[#22324d]">{user?.email || 'student@designschool.com'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#6d7f99]" />
                </div>
              </div>
            </div>
          </header>

          <motion.main variants={contentMotion} initial="hidden" animate="show" className="px-5 py-6 md:px-8">
            <Outlet />
          </motion.main>
        </div>
      </main>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-[2px] xl:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.32, ease: SHELL_EASE }}
              className="h-full w-[88vw] max-w-[320px] border-r border-[#e6ecf5] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#e6ecf5] px-5 py-5">
                <p className="text-lg font-semibold text-[#22324d]">Student Menu</p>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dbe4f0] bg-white text-[#60748f]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent user={user} onNavigate={() => setMenuOpen(false)} onLogout={handleLogout} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default StudentWorkspaceLayout;
