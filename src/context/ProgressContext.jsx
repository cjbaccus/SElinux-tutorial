import { createContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export const ProgressContext = createContext();

const initialProgress = {
  completedLessons: [],
  currentLesson: null,
  totalPoints: 0,
  moduleProgress: {
    1: { completed: 0, total: 3 },
    2: { completed: 0, total: 3 },
    3: { completed: 0, total: 3 },
    4: { completed: 0, total: 5 },
  },
  startedAt: null,
  lastActivityAt: null,
};

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useLocalStorage('selinux-progress', initialProgress);

  const completeLesson = useCallback((lessonId, points, moduleNum) => {
    setProgress((prev) => {
      // Don't add points if already completed
      if (prev.completedLessons.includes(lessonId)) {
        return prev;
      }

      const newCompleted = [...prev.completedLessons, lessonId];
      const newPoints = prev.totalPoints + points;

      // Update module progress
      const moduleProgress = { ...prev.moduleProgress };
      if (moduleProgress[moduleNum]) {
        moduleProgress[moduleNum] = {
          ...moduleProgress[moduleNum],
          completed: moduleProgress[moduleNum].completed + 1,
        };
      }

      return {
        ...prev,
        completedLessons: newCompleted,
        totalPoints: newPoints,
        moduleProgress,
        lastActivityAt: new Date().toISOString(),
        startedAt: prev.startedAt || new Date().toISOString(),
      };
    });
  }, [setProgress]);

  const setCurrentLesson = useCallback((lessonId) => {
    setProgress((prev) => ({
      ...prev,
      currentLesson: lessonId,
      lastActivityAt: new Date().toISOString(),
      startedAt: prev.startedAt || new Date().toISOString(),
    }));
  }, [setProgress]);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, [setProgress]);

  const isLessonCompleted = useCallback((lessonId) => {
    return progress.completedLessons.includes(lessonId);
  }, [progress.completedLessons]);

  const getModuleCompletion = useCallback((moduleNum) => {
    const module = progress.moduleProgress[moduleNum];
    if (!module) return 0;
    return Math.round((module.completed / module.total) * 100);
  }, [progress.moduleProgress]);

  const getTotalCompletion = useCallback(() => {
    const totalLessons = Object.values(progress.moduleProgress).reduce(
      (sum, module) => sum + module.total,
      0
    );
    const completedLessons = progress.completedLessons.length;
    return Math.round((completedLessons / totalLessons) * 100);
  }, [progress]);

  const value = {
    progress,
    completeLesson,
    setCurrentLesson,
    resetProgress,
    isLessonCompleted,
    getModuleCompletion,
    getTotalCompletion,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}
