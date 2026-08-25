import { motion } from 'framer-motion';
import { Trophy, Target, Award, Clock, TrendingUp } from 'lucide-react';
import { useProgress } from '../hooks/useProgress';
import { useAchievements } from '../hooks/useAchievements';
import { lessonStructure } from '../data/lessonStructure';

export function Progress() {
  const { progress, getTotalCompletion, getModuleCompletion } = useProgress();
  const { getAchievementProgress } = useAchievements();

  const totalCompletion = getTotalCompletion();
  const achievementProgress = getAchievementProgress();

  const totalLessons = lessonStructure.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  );

  const stats = [
    {
      icon: Target,
      label: 'Lessons Completed',
      value: `${progress.completedLessons.length}/${totalLessons}`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Trophy,
      label: 'Total Points',
      value: progress.totalPoints.toLocaleString(),
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      icon: Award,
      label: 'Achievements',
      value: `${achievementProgress.unlocked}/${achievementProgress.total}`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Overall Progress',
      value: `${totalCompletion}%`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
        Your Progress
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Module Progress */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
          Module Progress
        </h2>
        <div className="space-y-6">
          {lessonStructure.map((module) => {
            const completion = getModuleCompletion(module.moduleNum);
            const completedLessons = module.lessons.filter((lesson) =>
              progress.completedLessons.includes(lesson.id)
            ).length;

            return (
              <div key={module.moduleNum}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Module {module.moduleNum}: {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {completedLessons} of {module.lessons.length} lessons completed
                    </p>
                  </div>
                  <span className="text-lg font-bold text-selinux-600 dark:text-selinux-400">
                    {completion}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-selinux-500 to-selinux-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Stats (if available) */}
      {progress.startedAt && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activity Timeline
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Started:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {new Date(progress.startedAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Last Activity:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {progress.lastActivityAt
                  ? new Date(progress.lastActivityAt).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
