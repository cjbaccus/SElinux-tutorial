import { Link } from 'react-router-dom';
import { Shield, Trophy, BookOpen } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';
import { useProgress } from '../../hooks/useProgress';
import { motion } from 'framer-motion';

export function Header() {
  const { progress, getTotalCompletion } = useProgress();
  const completion = getTotalCompletion();

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 bg-selinux-500 rounded-lg group-hover:bg-selinux-600 transition-colors">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SELinux Tutorial
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Interactive Learning Platform
              </p>
            </div>
          </Link>

          {/* Progress and Navigation */}
          <div className="flex items-center space-x-6">
            {/* Progress Bar */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Progress
                </span>
                <span className="text-sm font-semibold text-selinux-600 dark:text-selinux-400">
                  {completion}%
                </span>
              </div>
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-selinux-500 to-selinux-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Points Display */}
            <Link
              to="/progress"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Trophy size={16} className="text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {progress.totalPoints.toLocaleString()}
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-4">
              <Link
                to="/lessons"
                className="text-gray-600 dark:text-gray-300 hover:text-selinux-600 dark:hover:text-selinux-400 transition-colors"
              >
                <BookOpen size={20} />
              </Link>
              <Link
                to="/achievements"
                className="text-gray-600 dark:text-gray-300 hover:text-selinux-600 dark:hover:text-selinux-400 transition-colors"
              >
                <Trophy size={20} />
              </Link>
            </nav>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
