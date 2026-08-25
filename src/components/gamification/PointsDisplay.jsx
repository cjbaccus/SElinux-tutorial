import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

export function PointsDisplay({ points, recentPoints = null, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Trophy size={16} className="text-yellow-500" />
        <span className="text-sm font-bold text-gray-900 dark:text-white">
          {points.toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Trophy size={24} />
          <span className="text-sm font-medium opacity-90">Total Points</span>
        </div>
        {recentPoints && recentPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-1 text-sm"
          >
            <TrendingUp size={16} />
            <span>+{recentPoints}</span>
          </motion.div>
        )}
      </div>
      <div className="text-4xl font-bold">
        {points.toLocaleString()}
      </div>
    </div>
  );
}
