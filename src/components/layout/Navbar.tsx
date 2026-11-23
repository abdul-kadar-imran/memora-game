import React from 'react';
import { BarChart3, Gamepad2, Moon, Sun } from 'lucide-react';
import { AppRoute } from '../../hooks/useRouter';
import { useMemoraStore } from '../../hooks/useMemoraStore';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const MemoraLogoMark: React.FC = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0 transition-transform duration-200 group-hover:scale-105"
  >
    <rect
      x="2"
      y="2"
      width="28"
      height="28"
      rx="8"
      className="fill-[#FFFFFF] dark:fill-[#11152A]"
      stroke="url(#memora_grad)"
      strokeWidth="2"
    />
    <path
      d="M9.5 21.5V10.5L16 16.5L22.5 10.5V21.5"
      stroke="url(#memora_grad)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="16"
      cy="21"
      r="1.6"
      className="fill-[#35C8E8] dark:fill-[#55D9FF]"
    />
    <defs>
      <linearGradient
        id="memora_grad"
        x1="2"
        y1="2"
        x2="30"
        y2="30"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8056E8" />
        <stop offset="0.55" stopColor="#477BFF" />
        <stop offset="1" stopColor="#35C8E8" />
      </linearGradient>
    </defs>
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { data, theme, stats, toggleTheme } = useMemoraStore();
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-[#8056E8]/15 dark:border-white/10 bg-[#F8F7FF]/90 dark:bg-[#090B18]/90 backdrop-blur-md transition-colors duration-200">
      {/* Desktop Header (>= md): Single Row */}
      <div className="mx-auto hidden md:flex h-16 max-w-7xl items-center justify-between gap-4 px-6 lg:px-8">
        {/* Zone 1: MEMORA Logo */}
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="group flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#35C8E8] dark:focus-visible:outline-[#55D9FF] rounded-lg"
          aria-label="MEMORA Home"
        >
          <img
            src="/memora icon.png"
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
            draggable={false}
          />
          <span className="text-lg font-bold tracking-tight text-[#20213A] dark:text-[#F5F5FF]">
            MEMORA
          </span>
        </button>

        {/* Zone 2: Two Primary Destinations */}
        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-1.5 rounded-xl bg-[#EFECFF] dark:bg-[#11152A] p-1 border border-[#8056E8]/15 dark:border-white/10"
        >
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors min-h-[38px] ${currentRoute === '/'
              ? 'bg-[#FFFFFF] dark:bg-[#171C35] text-[#20213A] dark:text-[#F5F5FF] shadow-[0_0_0_1px_rgba(128,86,232,0.38)] dark:shadow-[0_0_0_1px_rgba(155,123,255,0.45)]'
              : 'text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF]'
              }`}
          >
            <Gamepad2
              className="h-4 w-4 text-[#8056E8] dark:text-[#9B7BFF]"
              aria-hidden="true"
            />
            <span>Game Arena</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors min-h-[38px] ${currentRoute === '/dashboard'
              ? 'bg-[#FFFFFF] dark:bg-[#171C35] text-[#20213A] dark:text-[#F5F5FF] shadow-[0_0_0_1px_rgba(53,200,232,0.45)] dark:shadow-[0_0_0_1px_rgba(85,217,255,0.45)]'
              : 'text-[#5E6282] dark:text-[#929BB8] hover:text-[#20213A] dark:hover:text-[#F5F5FF]'
              }`}
          >
            <BarChart3
              className="h-4 w-4 text-[#35C8E8] dark:text-[#55D9FF]"
              aria-hidden="true"
            />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Zone 3: Player Level/XP + Light/Dark Theme Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className="flex items-center gap-2.5 rounded-xl bg-[#EFECFF] dark:bg-[#11152A] px-3 py-1.5 border border-[#8056E8]/15 dark:border-white/10 hover:border-[#8056E8]/45 dark:hover:border-[#9B7BFF]/40 transition-colors text-left"
            title="View player level and XP on Dashboard"
          >
            <span className="text-xs font-bold text-[#8056E8] dark:text-[#9B7BFF] whitespace-nowrap">
              Lv. {stats.level}
            </span>
            <span
              className="text-[#5E6282]/50 dark:text-[#929BB8]/50"
              aria-hidden="true"
            >
              ·
            </span>
            <span className="font-mono-tabular text-xs font-semibold text-[#477BFF] dark:text-[#55D9FF] whitespace-nowrap">
              {data.totalXP.toLocaleString()} XP
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#8056E8]/20 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] text-[#8056E8] dark:text-[#55D9FF] hover:border-[#8056E8]/55 dark:hover:border-[#55D9FF]/50 hover:bg-[#EFECFF] dark:hover:bg-[#171C35] transition-colors shrink-0 shadow-xs"
          >
            {isDark ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Header (< md): Centered MEMORA Title Top Row + Game Arena / Dashboard Bottom Row */}
      <div className="md:hidden px-3.5 pt-2.5 pb-2.5 space-y-2">
        {/* Top Row: Level pill left | Centered MEMORA title | Theme button right */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="justify-self-start">
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              className="flex items-center gap-1.5 rounded-lg border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF] dark:bg-[#11152A] px-2.5 py-1.5 text-left min-h-[36px]"
              aria-label={`Level ${stats.level}, ${data.totalXP} XP`}
            >
              <span className="text-[11px] font-bold text-[#8056E8] dark:text-[#9B7BFF] whitespace-nowrap">
                Lv.{stats.level}
              </span>
              <span
                className="text-[#5E6282]/50 dark:text-[#929BB8]/50 text-[10px]"
                aria-hidden="true"
              >
                ·
              </span>
              <span className="font-mono-tabular text-[11px] font-semibold text-[#477BFF] dark:text-[#55D9FF] whitespace-nowrap">
                {data.totalXP.toLocaleString()}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="group justify-self-center flex items-center gap-2 whitespace-nowrap rounded-lg py-0.5 focus-visible:outline-2 focus-visible:outline-[#35C8E8] dark:focus-visible:outline-[#55D9FF]"
            aria-label="MEMORA Home"
          >
            <img
              src="/memora icon.png"
              alt=""
              className="h-7 w-7 shrink-0 object-contain"
              draggable={false}
            />

            <span className="text-base font-extrabold tracking-wide text-[#20213A] dark:text-[#F5F5FF]">
              MEMORA
            </span>
          </button>

          <div className="justify-self-end">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#8056E8]/20 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#11152A] text-[#8056E8] dark:text-[#55D9FF] hover:bg-[#EFECFF] dark:hover:bg-[#171C35] transition-colors"
            >
              {isDark ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Row of Header: Game Arena & Dashboard */}
        <nav
          aria-label="Mobile Primary Navigation"
          className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#EFECFF] dark:bg-[#11152A] p-1 border border-[#8056E8]/15 dark:border-white/10"
        >
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${currentRoute === '/'
              ? 'bg-[#FFFFFF] dark:bg-[#171C35] text-[#20213A] dark:text-[#F5F5FF] shadow-[0_0_0_1px_rgba(128,86,232,0.4)] dark:shadow-[0_0_0_1px_rgba(155,123,255,0.5)]'
              : 'text-[#5E6282] dark:text-[#929BB8] active:text-[#20213A] dark:active:text-[#F5F5FF]'
              }`}
          >
            <Gamepad2
              className="h-4 w-4 text-[#8056E8] dark:text-[#9B7BFF]"
              aria-hidden="true"
            />
            <span>Game Arena</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/dashboard')}
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors min-h-[40px] ${currentRoute === '/dashboard'
              ? 'bg-[#FFFFFF] dark:bg-[#171C35] text-[#20213A] dark:text-[#F5F5FF] shadow-[0_0_0_1px_rgba(53,200,232,0.45)] dark:shadow-[0_0_0_1px_rgba(85,217,255,0.5)]'
              : 'text-[#5E6282] dark:text-[#929BB8] active:text-[#20213A] dark:active:text-[#F5F5FF]'
              }`}
          >
            <BarChart3
              className="h-4 w-4 text-[#35C8E8] dark:text-[#55D9FF]"
              aria-hidden="true"
            />
            <span>Dashboard</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
