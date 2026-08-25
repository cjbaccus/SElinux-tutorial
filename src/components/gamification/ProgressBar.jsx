import { motion } from 'framer-motion';

export function ProgressBar({ current, total, label, showPercentage = true }) {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
          {showPercentage && (
            <span className="text-sm font-semibold text-selinux-600 dark:text-selinux-400">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-selinux-500 to-selinux-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {!showPercentage && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {current} / {total}
          </span>
        </div>
      )}
    </div>
  );
}
