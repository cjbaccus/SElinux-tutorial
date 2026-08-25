import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export function AchievementBadge({ achievement, unlocked, size = 'md' }) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
  };

  const tierColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
  };

  return (
    <div className="relative inline-block">
      <motion.div
        whileHover={unlocked ? { scale: 1.05 } : {}}
        className={`
          ${sizes[size]} rounded-full
          flex items-center justify-center
          ${unlocked
            ? `bg-gradient-to-br ${tierColors[achievement.tier]} shadow-lg`
            : 'bg-gray-300 dark:bg-gray-700'
          }
          transition-all duration-200
        `}
      >
        {unlocked ? (
          <div className="text-white">
            {/* Icon would go here based on achievement.icon */}
            <div className="text-2xl">🏆</div>
          </div>
        ) : (
          <Lock size={iconSizes[size]} className="text-gray-500 dark:text-gray-600" />
        )}
      </motion.div>

      {unlocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
