import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { DarkModeProvider } from './context/DarkModeContext';
import { ProgressProvider } from './context/ProgressContext';
import { AchievementProvider } from './context/AchievementContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { LessonView } from './pages/LessonView';
import { Progress } from './pages/Progress';
import { Achievements } from './pages/Achievements';
import { AchievementToast } from './components/gamification/AchievementToast';
import { Menu } from 'lucide-react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DarkModeProvider>
      <ProgressProvider>
        <AchievementProvider>
          <div className="min-h-screen flex flex-col">
            <Header />

            <div className="flex flex-1">
              {/* Sidebar - shown on lesson pages */}
              <Routes>
                <Route
                  path="/lesson/:lessonId"
                  element={
                    <Sidebar
                      isOpen={sidebarOpen}
                      onClose={() => setSidebarOpen(false)}
                    />
                  }
                />
              </Routes>

              {/* Main Content */}
              <main className="flex-1 overflow-x-hidden">
                {/* Mobile menu button - shown on lesson pages */}
                <Routes>
                  <Route
                    path="/lesson/:lessonId"
                    element={
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="md:hidden fixed bottom-6 left-6 z-20 p-4 bg-selinux-600 text-white rounded-full shadow-lg hover:bg-selinux-700 transition-colors"
                        aria-label="Open menu"
                      >
                        <Menu size={24} />
                      </button>
                    }
                  />
                </Routes>

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/lesson/:lessonId" element={<LessonView />} />
                  <Route path="/lessons" element={<Navigate to="/lesson/1-1-intro" replace />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>

            <Footer />

            {/* Achievement Toast Notification */}
            <AchievementToast />
          </div>
        </AchievementProvider>
      </ProgressProvider>
    </DarkModeProvider>
  );
}

export default App;
