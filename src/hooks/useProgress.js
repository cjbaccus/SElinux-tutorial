import { useContext } from 'react';
import { ProgressContext } from '../context/ProgressContext';

/**
 * Hook to access progress context
 * @returns {Object} Progress context value
 */
export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }

  return context;
}
