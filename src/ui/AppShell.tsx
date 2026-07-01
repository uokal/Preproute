import {
  ChartNoAxesColumnIncreasing,
  ClipboardPenLine,
  FileClock,
  Settings,
  Trophy,
  Users,
  Bell,
  HelpCircle,
  Trash2,
  UserCircle,
  ChevronsLeft,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useMatch, useNavigate } from "react-router-dom";
import { Logo, NotificationButton, QuestionRailButton, SkeletonBlock, UserAvatar } from "./components";
import { useRailStore } from "../store/railStore";
import { authStorage } from "../api/authStorage";

const miniIcons = [
  ChartNoAxesColumnIncreasing, ClipboardPenLine, FileClock,
  Users, Trophy, Trash2, HelpCircle, UserCircle, Bell, Settings,
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex h-12 items-center gap-3 rounded-[7px] border-l-[5px] pl-4 pr-4 text-base font-medium no-underline transition-colors hover:bg-brand-secondary hover:text-brand-secondaryText max-[980px]:h-10 max-[980px]:border-b-[3px] max-[980px]:border-l-0 ${
    isActive ? "border-brand-blue bg-[#f4f6ff] text-brand-blue" : "border-transparent text-[#697185]"
  }`;

const MainNav = () => (
  <nav className="flex flex-col gap-2 px-1 pt-7 max-[980px]:flex-row max-[980px]:overflow-x-auto max-[980px]:px-3 max-[980px]:pt-3" aria-label="Primary navigation">
    <NavLink to="/dashboard" className={navLinkClass}>
      <ChartNoAxesColumnIncreasing size={18} />
      <span>Dashboard</span>
    </NavLink>
    <NavLink to="/tests/new" className={navLinkClass}>
      <ClipboardPenLine size={18} />
      <span>Test Creation</span>
    </NavLink>
    <NavLink to="/tracking" className={navLinkClass}>
      <FileClock size={18} />
      <span>Test Tracking</span>
    </NavLink>
  </nav>
);

export const AppShell = () => {
  const { visible: railVisible, doneCount, questions: railQuestions } = useRailStore();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const questionRailRef = useRef<HTMLDivElement>(null);

  const isEditRoute      = !!useMatch("/tests/:testId/edit");
  const isQuestionsRoute = !!useMatch("/tests/:testId/questions");
  const isPreviewRoute   = !!useMatch("/tests/:testId/preview");
  const isBuilderRoute   = isEditRoute || isQuestionsRoute || isPreviewRoute;

  const logout = () => {
    authStorage.clear();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!profileOpen) return undefined;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (profileRef.current?.contains(event.target as Node)) return;
      setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!questionRailRef.current || !isBuilderRoute) return;
    questionRailRef.current.scrollTo({
      top: questionRailRef.current.scrollHeight,
      left: questionRailRef.current.scrollWidth,
      behavior: "smooth"
    });
  }, [doneCount, isBuilderRoute]);

  return (
    <div className="flex h-screen min-w-0 overflow-hidden font-sans text-brand-ink max-[980px]:flex-col">

      {/* Layout 1: normal sidebar */}
      {!isBuilderRoute && (
        <aside className="flex w-[240px] flex-shrink-0 flex-col overflow-hidden border-r border-brand-line bg-white max-[980px]:w-full max-[980px]:border-b max-[980px]:border-r-0">
          <div className="flex min-h-[92px] items-center border-b border-brand-line px-8 max-[980px]:min-h-20 max-[980px]:px-5">
            <Logo />
          </div>
          <MainNav />
        </aside>
      )}

      {/* Layout 2: builder sidebar */}
      {isBuilderRoute && (
        <aside className="flex w-[240px] flex-shrink-0 flex-col overflow-hidden border-r border-brand-line bg-white max-[980px]:w-full max-[980px]:border-b max-[980px]:border-r-0">

          {/* full logo */}
          <div className="flex min-h-[92px] items-center border-b border-brand-line px-8 max-[980px]:min-h-20 max-[980px]:px-5">
            <Logo />
          </div>

          {/* icon strip + question rail */}
          <div className="flex min-h-0 flex-1 items-center max-[980px]:items-stretch">

            {/* left strip — icons only */}
          <div className="flex h-full w-[45px] flex-shrink-0 flex-col items-center self-stretch border-r border-brand-line max-[980px]:hidden">
  <div className="flex flex-1 flex-col items-center justify-center gap-5 py-6 text-[#697185]">
                {miniIcons.map((Icon, i) => <Icon key={i} size={18} aria-hidden="true" />)}
              </div>
            </div>

            {/* right panel — question rail */}
            <div className="flex min-h-0 flex-1 flex-col px-3 py-6 max-[980px]:min-w-[195px] max-[980px]:flex-row max-[980px]:items-center max-[980px]:justify-start max-[980px]:gap-4 max-[980px]:overflow-x-auto max-[980px]:px-5 max-[980px]:py-3.5">
              <div className="mb-1 flex flex-shrink-0 items-center justify-between">
                <span className="text-sm font-semibold text-brand-ink">Question creation</span>
                <ChevronsLeft size={15} className="text-brand-blue cursor-pointer flex-shrink-0" />
              </div>
              <p className="mb-3 flex-shrink-0 text-xs text-[#6b7487]">Total Questions . {railQuestions.length}</p>
              <div
                ref={questionRailRef}
                className={`flex flex-col gap-2 pr-1 max-[980px]:flex-row max-[980px]:overflow-y-hidden max-[980px]:overflow-x-auto max-[980px]:pb-0 max-[980px]:pr-0 ${
                  railQuestions.length > 6
                    ? "max-h-[330px] overflow-y-auto pb-4"
                    : "overflow-hidden pb-0"
                }`}
              >
                {!railVisible
                  ? Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="flex h-9 w-full items-center gap-2 rounded-[7px] border border-[#ebedf2] px-3">
                        <SkeletonBlock className="h-5 w-5 rounded-full flex-shrink-0" />
                        <SkeletonBlock className="h-3 w-24" />
                      </div>
                    ))
                  : railQuestions.map((q, i) => (
                      <QuestionRailButton key={q.id} index={i} done={q.status === "completed"} current={q.status === "current"} />
                    ))
                }
              </div>
            </div>

          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-[92px] flex-shrink-0 items-center justify-between border-b border-[#edf0f5] px-7 max-[720px]:h-auto max-[720px]:px-4 max-[720px]:py-3.5">
          <div />
          <div className="flex items-center gap-3">
            <NotificationButton />
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="rounded-[7px] px-2 py-1 transition-colors duration-200 hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <UserAvatar src="/assets/profile.png" name="Alex Wando" role="Admin" />
              </button>
              {profileOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-44 rounded-[7px] border border-brand-line bg-white p-2 shadow-[0_18px_50px_rgba(47,58,76,0.12)]" role="menu">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-[7px] px-3 py-2 text-left text-sm font-medium text-brand-secondaryText transition-colors duration-200 hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary/25"
                    role="menuitem"
                    onClick={logout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-11 pt-7 max-[720px]:px-3.5 max-[720px]:pb-8 max-[720px]:pt-4">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
