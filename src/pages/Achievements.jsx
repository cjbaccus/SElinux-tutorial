import { motion } from 'framer-motion';
import {
  Trophy,
  Award,
  Star,
  Crown,
  Shield,
  BookOpen,
  Wrench,
  ShieldCheck,
  Flame,
  Target,
} from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';

const iconMap = {
  footprints: Target,
  'book-open': BookOpen,
  wrench: Wrench,
  'shield-check': ShieldCheck,
  award: Award,
  star: Star,
  trophy: Trophy,
  flame: Flame,
  crown: Crown,
};

const tierStyles = {
  bronze: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-500',
  },
  silver: {
    bg: 'bg-gray-100 dark:bg-gray-700/30',
    border: 'border-gray-300 dark:border-gray-600',
    text: 'text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-400',
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-500',
  },
};

export function Achievements() {
  const { getAllAchievements, getAchievementProgress } = useAchievements();
  const achievements = getAllAchievements();
  const progress = getAchievementProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Achievements
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-selinux-500 to-selinux-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            {progress.unlocked} / {progress.total}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const Icon = iconMap[achievement.icon] || Shield;
          const styles = tierStyles[achievement.tier];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                relative p-6 rounded-lg border-2 transition-all
                ${achievement.unlocked
                  ? `${styles.bg} ${styles.border}`
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
                }
              `}
            >
              {/* Tier Badge */}
              <div className="absolute top-4 right-4">
                <div
                  className={`
                  px-2 py-1 rounded text-xs font-semibold text-white
                  ${achievement.unlocked ? styles.badge : 'bg-gray-400'}
                `}
                >
                  {achievement.tier.toUpperCase()}
                </div>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <div
                  className={`
                  inline-flex p-4 rounded-full
                  ${achievement.unlocked
                    ? styles.bg
                    : 'bg-gray-200 dark:bg-gray-700'
                  }
                `}
                >
                  <Icon
                    size={32}
                    className={achievement.unlocked ? styles.text : 'text-gray-400'}
                  />
                </div>
              </div>

              {/* Content */}
              <h3
                className={`
                text-lg font-bold mb-2
                ${achievement.unlocked
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-500'
                }
              `}
              >
                {achievement.title}
              </h3>
              <p
                className={`
                text-sm
                ${achievement.unlocked
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-500 dark:text-gray-600'
                }
              `}
              >
                {achievement.description}
              </p>

              {/* Locked Overlay */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🔒</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
