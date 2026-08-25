import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, CheckCircle, Lock, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProgress } from '../../hooks/useProgress';
import { lessonStructure } from '../../data/lessonStructure';

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { isLessonCompleted, getModuleCompletion } = useProgress();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)]
          w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 z-30
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <nav className="p-4 space-y-6">
          {lessonStructure.map((module) => {
            const completion = getModuleCompletion(module.moduleNum);

            return (
              <div key={module.moduleNum}>
                {/* Module Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Module {module.moduleNum}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {completion}%
                    </span>
                  </div>
                  <h4 className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {module.title}
                  </h4>
                  {/* Progress bar */}
                  <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-selinux-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Lessons */}
                <ul className="space-y-1">
                  {module.lessons.map((lesson, index) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isActive = location.pathname === `/lesson/${lesson.id}`;
                    const isLocked = index > 0 && !isLessonCompleted(module.lessons[index - 1].id);

                    return (
                      <li key={lesson.id}>
                        <Link
                          to={isLocked ? '#' : `/lesson/${lesson.id}`}
                          onClick={(e) => {
                            if (isLocked) e.preventDefault();
                            if (!isLocked && isOpen) onClose();
                          }}
                          className={`
                            flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                            transition-colors group
                            ${isActive
                              ? 'bg-selinux-50 dark:bg-selinux-900/20 text-selinux-700 dark:text-selinux-400'
                              : isLocked
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {/* Status Icon */}
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : isLocked ? (
                              <Lock size={16} />
                            ) : (
                              <Circle size={16} className="text-gray-400" />
                            )}
                          </div>

                          {/* Lesson Title */}
                          <span className="flex-1 truncate">{lesson.title}</span>

                          {/* Points */}
                          {!isLocked && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {lesson.points}pt
                            </span>
                          )}

                          {/* Arrow for active */}
                          {isActive && !isLocked && (
                            <ChevronRight size={16} className="text-selinux-600" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
