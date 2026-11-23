import React from 'react';
import { motion } from 'motion/react';
import { BoardCard } from '../../utils/gameLogic';

interface MemoryCardProps {
  card: BoardCard;
  isWrongPair: boolean;
  disabled: boolean;
  compact?: boolean;
  onSelect: (card: BoardCard) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  card,
  isWrongPair,
  disabled,
  compact = false,
  onSelect,
}) => {
  const revealed = card.isFlipped || card.isMatched;

  return (
    <motion.button
      type="button"
      disabled={disabled || revealed}
      onClick={() => onSelect(card)}
      aria-label={
        revealed ? `${card.label} card revealed` : 'Hidden memory card'
      }
      animate={
        isWrongPair
          ? { x: [0, -5, 5, -4, 4, 0] }
          : card.isMatched
            ? { scale: [1, 1.05, 1] }
            : { x: 0, scale: 1 }
      }
      transition={{ duration: 0.28 }}
      whileHover={!revealed && !disabled ? { y: -2 } : undefined}
      whileTap={!revealed && !disabled ? { scale: 0.96 } : undefined}
      className={`group relative w-full aspect-square min-h-[38px] sm:min-h-[44px] lg:min-h-0 perspective-1000 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#35C8E8] dark:focus-visible:outline-[#55D9FF] ${
        compact ? 'rounded-lg sm:rounded-xl' : 'rounded-xl sm:rounded-2xl'
      } ${!revealed && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div
        className={`relative h-full w-full preserve-3d transition-transform duration-300 ease-out ${
          revealed ? 'rotate-y-180' : ''
        }`}
      >
        {/* Face Down (Back) */}
        <div
          className={`absolute inset-0 backface-hidden flex items-center justify-center border bg-[#FFFFFF] dark:bg-[#171C35] shadow-xs dark:shadow-none transition-colors duration-150 ${
            compact ? 'rounded-lg sm:rounded-xl' : 'rounded-xl sm:rounded-2xl'
          } ${
            !revealed && !disabled
              ? 'border-[#8056E8]/25 dark:border-[#527BFF]/25 group-hover:border-[#8056E8]/70 dark:group-hover:border-[#9B7BFF]/70 group-hover:shadow-[0_4px_16px_rgba(128,86,232,0.16)] dark:group-hover:shadow-[0_0_20px_rgba(155,123,255,0.22)]'
              : 'border-[#8056E8]/15 dark:border-white/10'
          }`}
        >
          <div
            className={`flex items-center justify-center rounded-lg border border-[#8056E8]/15 dark:border-white/10 bg-[#EFECFF] dark:bg-[#11152A]/80 ${
              compact ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-7 w-7 sm:h-9 sm:w-9'
            }`}
          >
            <svg
              width={compact ? 14 : 18}
              height={compact ? 14 : 18}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="opacity-80 dark:opacity-70 group-hover:opacity-100 transition-opacity"
            >
              <path
                d="M12 3L20 12L12 21L4 12L12 3Z"
                className="stroke-[#8056E8] dark:stroke-[#9B7BFF]"
                strokeWidth="1.8"
              />
              <circle
                cx="12"
                cy="12"
                r="2.2"
                className="fill-[#35C8E8] dark:fill-[#55D9FF]"
              />
            </svg>
          </div>
        </div>

        {/* Face Up (Front — Icon Only) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 flex items-center justify-center border transition-colors duration-200 ${
            compact ? 'rounded-lg sm:rounded-xl' : 'rounded-xl sm:rounded-2xl'
          } ${
            card.isMatched
              ? 'border-[#25B985] dark:border-[#37D99A]/70 bg-[#E6F8F1] dark:bg-[#13292B] shadow-[0_0_16px_rgba(37,185,133,0.18)] dark:shadow-[0_0_20px_rgba(55,217,154,0.2)]'
              : isWrongPair
                ? 'border-[#E11D48] dark:border-[#FF5D78]/80 bg-[#FFE9EE] dark:bg-[#2E1626] shadow-[0_0_14px_rgba(225,29,72,0.18)] dark:shadow-[0_0_18px_rgba(255,93,120,0.25)]'
                : 'border-[#35C8E8] dark:border-[#55D9FF]/55 bg-[#F2FAFF] dark:bg-[#1B2242]'
          }`}
        >
          <span
            className={`select-none leading-none ${
              compact
                ? 'text-xl sm:text-3xl lg:text-[1.75rem] xl:text-3xl'
                : 'text-3xl sm:text-4xl lg:text-[2.25rem] xl:text-5xl'
            }`}
            role="img"
            aria-hidden="true"
          >
            {card.emoji}
          </span>
        </div>
      </div>
    </motion.button>
  );
};
