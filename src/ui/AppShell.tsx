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
} from "lucide-react";
import { NavLink, Outlet, useMatch } from "react-router-dom";
import { Logo, NotificationButton, QuestionRailButton, UserAvatar } from "./components";
import { useRailStore } from "../store/railStore";

const miniIcons = [
  ChartNoAxesColumnIncreasing, ClipboardPenLine, FileClock,
  Users, Trophy, Trash2, HelpCircle, UserCircle, Bell, Settings,
];

const MainNav = () => (
  <nav className="main-nav">
    <NavLink to="/dashboard">
      <ChartNoAxesColumnIncreasing size={18} />
      <span>Dashboard</span>
    </NavLink>
    <NavLink to="/tests/new">
      <ClipboardPenLine size={18} />
      <span>Test Creation</span>
    </NavLink>
    <NavLink to="/dashboard" end={false}>
      <FileClock size={18} />
      <span>Test Tracking</span>
    </NavLink>
  </nav>
);

export const AppShell = () => {
  const { totalQuestions, doneCount } = useRailStore();

  const isEditRoute      = !!useMatch("/tests/:testId/edit");
  const isQuestionsRoute = !!useMatch("/tests/:testId/questions");
  const isPreviewRoute   = !!useMatch("/tests/:testId/preview");
  const isBuilderRoute   = isEditRoute || isQuestionsRoute || isPreviewRoute;

  return (
    <div className="flex min-h-screen">

      {/* Layout 1: normal sidebar */}
      {!isBuilderRoute && (
        <aside className="flex w-[210px] flex-shrink-0 flex-col border-r border-brand-line bg-white">
          <div className="px-5 py-6 border-b border-brand-line">
            <Logo />
          </div>
          <MainNav />
        </aside>
      )}

      {/* Layout 2: builder sidebar */}
      {isBuilderRoute && (
        <aside className="flex w-[210px] flex-shrink-0 flex-col border-r border-brand-line bg-white">

          {/* full logo */}
          <div className="px-5 py-4 border-b border-brand-line">
            <Logo />
          </div>

          {/* icon strip + question rail */}
          <div className="flex flex-1">

            {/* left strip — icons only */}
            <div className="flex w-10 flex-shrink-0 flex-col items-center border-r border-brand-line ">
              <div className="flex flex-1 flex-col items-center justify-center gap-5 text-[#697185]">
                {miniIcons.map((Icon, i) => <Icon key={i} size={18} />)}
              </div>
            </div>

            {/* right panel — question rail */}
            <div className="flex flex-1  justify-center flex-col px-3 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-brand-ink">Question creation</span>
                <ChevronsLeft size={15} className="text-brand-blue cursor-pointer flex-shrink-0" />
              </div>
              <p className="text-xs text-[#6b7487] mb-3">Total Questions . {totalQuestions}</p>
              <div className="flex flex-col gap-2">
                {Array.from({ length: Math.min(6, totalQuestions) }, (_, i) => (
                  <QuestionRailButton key={i} index={i} done={i < doneCount} />
                ))}
              </div>
            </div>

          </div>
        </aside>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="topbar">
          <div />
          <div className="profile">
            <NotificationButton />
            <UserAvatar src="/assets/profile.png" name="Alex Wando" role="Admin" />
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
