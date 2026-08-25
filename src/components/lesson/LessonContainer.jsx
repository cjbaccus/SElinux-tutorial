import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Award, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { LessonContent } from './LessonContent';
import { Button } from '../common/Button';
import { useProgress } from '../../hooks/useProgress';
import { useAchievements } from '../../hooks/useAchievements';
import { loadLesson } from '../../utils/markdownParser';
import { lessonStructure } from '../../data/lessonStructure';

export function LessonContainer({ lessonId }) {
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { completeLesson, isLessonCompleted, setCurrentLesson, progress } = useProgress();
  const { checkAndUnlockAchievements } = useAchievements();

  const isCompleted = isLessonCompleted(lessonId);

  useEffect(() => {
    setCurrentLesson(lessonId);
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    setLoading(true);
    const data = await loadLesson(lessonId);
    setLesson(data);
    setLoading(false);
  };

  const handleComplete = () => {
    if (!isCompleted && lesson?.frontmatter) {
      const moduleNum = parseInt(lessonId.split('-')[0]);
      completeLesson(lessonId, lesson.frontmatter.points || 0, moduleNum);

      // Check for achievements after a short delay
      setTimeout(() => {
        checkAndUnlockAchievements(progress);
      }, 500);
    }

    // Navigate to next lesson
    const nextLesson = getNextLesson();
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    }
  };

  const getNextLesson = () => {
    for (const module of lessonStructure) {
      const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex !== -1) {
        // Next lesson in same module
        if (lessonIndex < module.lessons.length - 1) {
          return module.lessons[lessonIndex + 1];
        }
        // First lesson of next module
        const nextModuleIndex = lessonStructure.findIndex(
          (m) => m.moduleNum === module.moduleNum
        ) + 1;
        if (nextModuleIndex < lessonStructure.length) {
          return lessonStructure[nextModuleIndex].lessons[0];
        }
      }
    }
    return null;
  };

  const getPreviousLesson = () => {
    for (const module of lessonStructure) {
      const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex !== -1) {
        // Previous lesson in same module
        if (lessonIndex > 0) {
          return module.lessons[lessonIndex - 1];
        }
        // Last lesson of previous module
        const prevModuleIndex = lessonStructure.findIndex(
          (m) => m.moduleNum === module.moduleNum
        ) - 1;
        if (prevModuleIndex >= 0) {
          const prevModule = lessonStructure[prevModuleIndex];
          return prevModule.lessons[prevModule.lessons.length - 1];
        }
      }
    }
    return null;
  };

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-selinux-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Lesson Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isCompleted && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {lesson?.frontmatter?.title || 'Lesson'}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          {lesson?.frontmatter?.estimatedTime && (
            <div className="flex items-center space-x-2">
              <Clock size={16} />
              <span>{lesson.frontmatter.estimatedTime} min</span>
            </div>
          )}
          {lesson?.frontmatter?.points && (
            <div className="flex items-center space-x-2">
              <Award size={16} className="text-yellow-500" />
              <span>{lesson.frontmatter.points} points</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lesson Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8"
      >
        <LessonContent content={lesson?.content || ''} />
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {previousLesson && (
            <Button
              variant="ghost"
              onClick={() => navigate(`/lesson/${previousLesson.id}`)}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {!isCompleted && (
            <Button onClick={handleComplete} variant="success">
              {nextLesson ? 'Complete & Continue' : 'Complete Lesson'}
            </Button>
          )}
          {isCompleted && nextLesson && (
            <Button onClick={() => navigate(`/lesson/${nextLesson.id}`)}>
              Next Lesson
              <ChevronRight size={20} className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
