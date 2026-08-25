import { createContext, useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { achievements } from '../data/achievements';

export const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [unlockedAchievements, setUnlockedAchievements] = useLocalStorage('selinux-achievements', []);
  const [recentAchievement, setRecentAchievement] = useState(null);

  const checkAndUnlockAchievements = useCallback((progress) => {
    const newlyUnlocked = [];

    achievements.forEach((achievement) => {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) {
        return;
      }

      // Check if achievement criteria is met
      if (achievement.checkUnlock(progress)) {
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements((prev) => [
        ...prev,
        ...newlyUnlocked.map((a) => a.id),
      ]);

      // Show the first newly unlocked achievement
      setRecentAchievement(newlyUnlocked[0]);

      // Clear recent achievement after 5 seconds
      setTimeout(() => setRecentAchievement(null), 5000);
    }
  }, [unlockedAchievements, setUnlockedAchievements]);

  const getAchievementProgress = useCallback(() => {
    return {
      unlocked: unlockedAchievements.length,
      total: achievements.length,
      percentage: Math.round((unlockedAchievements.length / achievements.length) * 100),
    };
  }, [unlockedAchievements]);

  const isAchievementUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.includes(achievementId);
  }, [unlockedAchievements]);

  const getAllAchievements = useCallback(() => {
    return achievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
    }));
  }, [unlockedAchievements]);

  const value = {
    unlockedAchievements,
    recentAchievement,
    checkAndUnlockAchievements,
    getAchievementProgress,
    isAchievementUnlocked,
    getAllAchievements,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}
