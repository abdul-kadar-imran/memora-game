
import React from 'react';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';

interface FooterProps {
  onAction?: () => void;
}

const PORTFOLIO_URL = 'https://imran-desktop.vercel.app/';
const BLUE = '65,105,225';
const AC = `rgba(${BLUE},`;

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="relative z-10 mx-auto mt-4 w-full max-w-7xl px-3 pb-6 sm:px-6">

      <div
        className="relative w-full overflow-hidden rounded-[32px]"
        style={{
          background:
            'linear-gradient(160deg, rgba(7,9,16,0.97) 0%, rgba(5,7,15,0.99) 60%, rgba(3,5,12,1) 100%)',
          border: `1px solid ${AC}0.18)`,
          boxShadow: `0 0 0 1px ${AC}0.06), 0 0 80px ${AC}0.07), 0 12px 48px rgba(0,0,0,0.75)`,
        }}
      >

        {/* Top glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${AC}0.55), transparent)`,
          }}
        />

        {/* Bottom dot texture */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[30px]"
          style={{
            backgroundImage: `radial-gradient(circle, ${AC}0.28) 1px, transparent 1px)`,
            backgroundSize: '14px 14px',
            opacity: 0.55,
            maskImage:
              'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
          }}
        />

        {/* Ambient blue glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[55px] w-[380px] -translate-x-1/2"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${AC}0.30) 0%, ${AC}0.08) 50%, transparent 72%)`,
            filter: 'blur(8px)',
          }}
        />

        {/* Central luminous arc */}
        <svg
          className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-[300px] -translate-x-1/2"
          viewBox="0 0 300 32"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="arcGradBlue" x1="0" y1="0" x2="300" y2="0">
              <stop offset="0%" stopColor={`${AC}0)`} />
              <stop offset="25%" stopColor={`${AC}0.4)`} />
              <stop offset="50%" stopColor="rgba(160,190,255,1)" />
              <stop offset="75%" stopColor={`${AC}0.4)`} />
              <stop offset="100%" stopColor={`${AC}0)`} />
            </linearGradient>
          </defs>

          <path
            d="M0 32 Q150 -2 300 32"
            stroke={`${AC}0.3)`}
            strokeWidth="5"
            style={{ filter: 'blur(3px)' }}
          />
          <path
            d="M0 32 Q150 -2 300 32"
            stroke="url(#arcGradBlue)"
            strokeWidth="1.5"
          />
        </svg>

        {/* Footer content */}
        <div className="relative z-10 flex flex-col items-center justify-between gap-5 px-5 pb-8 pt-5 sm:flex-row sm:px-7 sm:pb-9">

          {/* Left: Logo and name */}
          <div className="flex shrink-0 items-center gap-4">

            <motion.a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Visit My Portfolio"
              whileHover={{ scale: 1.08, rotate: 8 }}
              whileTap={{ scale: 0.94 }}
              animate={{
                boxShadow: [
                  `0 0 0 1px ${AC}0.5), 0 0 18px ${AC}0.25)`,
                  `0 0 0 1px ${AC}0.8), 0 0 28px ${AC}0.5)`,
                  `0 0 0 1px ${AC}0.5), 0 0 18px ${AC}0.25)`,
                ],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="group relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border"
              style={{
                background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08), ${AC}0.1) 18%, rgba(4,6,14,0.98) 72%)`,
                borderColor: `${AC}0.3)`,
              }}
            >
              <div
                className="absolute inset-[5px] rounded-full border"
                style={{ borderColor: `${AC}0.3)` }}
              />

              <span
                className="relative z-10 font-serif text-[22px] font-bold"
                style={{
                  color: 'rgba(180,210,255,0.96)',
                  textShadow: `0 0 12px ${AC}0.9)`,
                }}
              >
                I
              </span>

              <span className="pointer-events-none absolute -top-11 whitespace-nowrap rounded-lg border border-blue-400/20 bg-[#0A0E18] px-3 py-1 text-[11px] text-blue-200 opacity-0 transition-all group-hover:-translate-y-1 group-hover:opacity-100">
                Visit My Portfolio ↗
              </span>
            </motion.a>

            <div
              className="h-11 w-px shrink-0"
              style={{
                background: `linear-gradient(to bottom, transparent, ${AC}0.35), transparent)`,
              }}
            />

            <div className="flex flex-col gap-1 select-none">
              <span
                className="font-orbitron text-[9px] font-semibold uppercase tracking-[0.32em] text-blue-200/70"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                Abdul Kadar
              </span>

              <span
                className="text-xl font-bold uppercase tracking-[0.22em] text-[#4169E1] sm:text-[22px]"
                style={{
                  textShadow: `0 0 8px ${AC}0.6), 0 0 20px ${AC}0.35)`,
                }}
              >
                IMRAN
              </span>
            </div>
          </div>

          {/* Center: Tagline */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-medium tracking-wider text-white sm:gap-3 sm:text-xs lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <span>Design</span>
            <span className="text-[#4169E1]">•</span>
            <span>Develop</span>
            <span className="text-[#4169E1]">•</span>
            <span>Deploy</span>
          </div>

          {/* Right: Globe action */}
          <div className="flex shrink-0 items-center gap-4">
            <div
              className="hidden h-11 w-px sm:block"
              style={{
                background: `linear-gradient(to bottom, transparent, ${AC}0.35), transparent)`,
              }}
            />

            <motion.a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Portfolio"
              title="Visit Portfolio"
              whileHover={{ scale: 1.08, rotate: -6 }}
              whileTap={{ scale: 0.94 }}
              animate={{
                boxShadow: [
                  `0 0 0 1px ${AC}0.6), 0 0 18px ${AC}0.25)`,
                  `0 0 0 1px ${AC}0.85), 0 0 28px ${AC}0.5)`,
                  `0 0 0 1px ${AC}0.6), 0 0 18px ${AC}0.25)`,
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-400/30 bg-[#080D1B] text-[#4169E1] transition-colors hover:border-cyan-300 hover:text-cyan-300"
            >
              <Globe className="h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
};
