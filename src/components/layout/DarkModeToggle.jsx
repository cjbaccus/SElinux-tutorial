import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { DarkModeContext } from '../../context/DarkModeContext';

export function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-7 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-selinux-500 focus:ring-offset-2"
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDarkMode ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDarkMode ? (
          <Moon size={14} className="text-gray-800" />
        ) : (
          <Sun size={14} className="text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}
