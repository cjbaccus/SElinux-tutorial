import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Crown, Shield } from 'lucide-react';
import { useAchievements } from '../../hooks/useAchievements';

const iconMap = {
  trophy: Trophy,
  star: Star,
  award: Award,
  crown: Crown,
  shield: Shield,
};

const tierColors = {
  bronze: {
    bg: 'from-orange-500 to-orange-600',
    glow: 'shadow-orange-500/50',
  },
  silver: {
    bg: 'from-gray-400 to-gray-500',
    glow: 'shadow-gray-400/50',
  },
  gold: {
    bg: 'from-yellow-500 to-yellow-600',
    glow: 'shadow-yellow-500/50',
  },
};

export function AchievementToast() {
  const { recentAchievement } = useAchievements();

  if (!recentAchievement) return null;

  const Icon = iconMap[recentAchievement.icon] || Trophy;
  const colors = tierColors[recentAchievement.tier] || tierColors.gold;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`
            bg-white dark:bg-gray-800 rounded-lg shadow-2xl ${colors.glow}
            border-2 border-transparent
            overflow-hidden
          `}
        >
          {/* Gradient Header */}
          <div className={`h-2 bg-gradient-to-r ${colors.bg}`} />

          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className={`
                  p-3 rounded-full bg-gradient-to-br ${colors.bg}
                  flex items-center justify-center
                `}
              >
                <Icon size={28} className="text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Achievement Unlocked!
                  </h3>
                  <span className={`
                    px-2 py-0.5 rounded text-xs font-semibold text-white
                    bg-gradient-to-r ${colors.bg}
                  `}>
                    {recentAchievement.tier.toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold text-selinux-600 dark:text-selinux-400 mb-1">
                  {recentAchievement.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {recentAchievement.description}
                </p>
              </div>
            </div>
          </div>

          {/* Confetti Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: Math.random() * 100 - 50 + '%',
                  y: '0%',
                }}
                animate={{
                  opacity: 0,
                  y: '100%',
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  delay: Math.random() * 0.5,
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6'][
                    Math.floor(Math.random() * 5)
                  ],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
