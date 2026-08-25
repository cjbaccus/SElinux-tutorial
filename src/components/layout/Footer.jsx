import { Github, BookOpen, Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-selinux-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                SELinux Tutorial
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              An interactive web-based platform for learning SELinux through
              hands-on practice and gamified lessons.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-selinux-600 dark:hover:text-selinux-400 transition-colors"
                >
                  Red Hat SELinux Docs
                </a>
              </li>
              <li>
                <a
                  href="https://selinuxproject.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-selinux-600 dark:hover:text-selinux-400 transition-colors"
                >
                  SELinux Project
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/SELinuxProject/selinux-notebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-selinux-600 dark:hover:text-selinux-400 transition-colors"
                >
                  SELinux Notebook
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Important Note
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This tutorial uses simulated environments for educational purposes.
              Always test SELinux configurations in a safe environment before
              applying to production systems.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Built with React, Vite, and Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
