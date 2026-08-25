import { useContext } from 'react';
import { AchievementContext } from '../context/AchievementContext';

/**
 * Hook to access achievement context
 * @returns {Object} Achievement context value
 */
export function useAchievements() {
  const context = useContext(AchievementContext);

  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }

  return context;
}
