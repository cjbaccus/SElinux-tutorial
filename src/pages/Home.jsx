import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Award, Terminal, Lock, Zap } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useProgress } from '../hooks/useProgress';

export function Home() {
  const { progress, getTotalCompletion } = useProgress();
  const hasStarted = progress.completedLessons.length > 0;
  const completion = getTotalCompletion();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Lessons',
      description: 'Learn through hands-on practice with real-world scenarios',
    },
    {
      icon: Terminal,
      title: 'Terminal Simulator',
      description: 'Practice SELinux commands in a safe, simulated environment',
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Earn points and unlock achievements as you progress',
    },
    {
      icon: Lock,
      title: 'Security Focused',
      description: 'Master MAC security and protect your systems',
    },
    {
      icon: Zap,
      title: 'Progressive Learning',
      description: 'Build from basics to advanced policy development',
    },
    {
      icon: Shield,
      title: 'Real-World Projects',
      description: 'Complete with nginx configuration capstone project',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-selinux-500 to-selinux-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
                <Shield size={64} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Master SELinux Security
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-selinux-50 max-w-3xl mx-auto">
              Learn Security-Enhanced Linux through interactive tutorials,
              hands-on practice, and real-world projects
            </p>

            {hasStarted ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold">{completion}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-sm text-selinux-100 mt-3">
                    {progress.completedLessons.length} lessons completed •{' '}
                    {progress.totalPoints.toLocaleString()} points earned
                  </p>
                </div>
                <Link to={`/lesson/${progress.currentLesson || '1-1-intro'}`}>
                  <Button size="lg" variant="secondary">
                    Continue Learning
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/lesson/1-1-intro">
                <Button size="lg" variant="secondary">
                  Start Learning
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Why Choose This Tutorial?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-selinux-100 dark:bg-selinux-900/30 rounded-lg">
                    <feature.icon className="w-6 h-6 text-selinux-600 dark:text-selinux-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Your Learning Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: 1, title: 'Fundamentals', lessons: 3, points: 450 },
              { num: 2, title: 'Core Skills', lessons: 3, points: 750 },
              { num: 3, title: 'Policy Development', lessons: 3, points: 750 },
              { num: 4, title: 'Nginx Capstone', lessons: 5, points: 1700 },
            ].map((module) => (
              <div
                key={module.num}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-selinux-500 transition-colors"
              >
                <div className="text-sm font-semibold text-selinux-600 dark:text-selinux-400 mb-2">
                  Module {module.num}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                  {module.title}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>{module.lessons} lessons</div>
                  <div>{module.points} points available</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
