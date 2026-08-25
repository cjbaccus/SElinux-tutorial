# SELinux Interactive Tutorial

An interactive, gamified web-based tutorial for learning Security-Enhanced Linux (SELinux) through hands-on practice. Built with React, Vite, and Tailwind CSS.

## 🎯 Purpose

This project provides an engaging way to learn SELinux fundamentals and advanced concepts, culminating in setting up custom SELinux policies for running an nginx web server on RHEL 8+ systems.

## ✨ Features

### 🎓 Interactive Learning
- **Progressive Lesson System**: 14 lessons across 4 modules
- **Hands-on Practice**: Interactive terminal simulator with 30+ SELinux commands
- **Real-world Scenarios**: Practical examples and use cases
- **Instant Feedback**: Validation and hints for exercises

### 🎮 Gamification
- **Points System**: Earn points for completing lessons (3,100 total points)
- **10 Achievements**: Bronze, silver, and gold tier achievements
- **Progress Tracking**: Visual progress bars and statistics
- **Celebration Animations**: Toast notifications when unlocking achievements

### 🎨 Modern UI/UX
- **Dark Mode**: Full dark mode support with smooth transitions
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: Framer Motion for delightful interactions
- **Accessible**: Keyboard navigation and ARIA labels

### 🛠️ Interactive Components
- **Terminal Simulator**: Practice SELinux commands in a safe environment
- **Code Editor**: Write and validate SELinux policies
- **Multiple Choice Quizzes**: Test your knowledge
- **Progressive Hints**: Get help when you need it

## 📚 Learning Path

### Module 1: SELinux Fundamentals (450 points)
1. Introduction to SELinux (100 pts)
2. SELinux Modes (150 pts)
3. SELinux Contexts (200 pts)

### Module 2: Working with SELinux (750 points)
1. Boolean Management (200 pts)
2. File Context Management (250 pts)
3. Troubleshooting SELinux (300 pts)

### Module 3: Policy Development (750 points)
1. Understanding Policy Modules (250 pts)
2. Creating Custom Policies (300 pts)
3. Port and Network Context (200 pts)

### Module 4: Nginx Capstone Project (1,700 points)
1. Nginx Installation & Basic Setup (200 pts)
2. Custom Document Root (300 pts)
3. Custom Port Configuration (300 pts)
4. Reverse Proxy Policy (400 pts)
5. Custom Policy Module (500 pts)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-selinux-tutorial

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

1. **Start Learning**: Click "Start Learning" on the home page
2. **Navigate Lessons**: Use the sidebar to browse modules and lessons
3. **Practice Commands**: Use the terminal simulator to practice SELinux commands
4. **Complete Exercises**: Answer quizzes and complete coding challenges
5. **Track Progress**: View your progress and achievements in the dedicated pages
6. **Dark Mode**: Toggle dark mode using the switch in the header

## 🏗️ Project Structure

```
my-selinux-tutorial/
├── public/
│   └── lessons/              # Markdown lesson files
│       ├── module-1/
│       ├── module-2/
│       ├── module-3/
│       └── module-4/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components (Button, Modal, Tooltip)
│   │   ├── gamification/     # Achievement, progress components
│   │   ├── interactive/      # Terminal, quiz, editor widgets
│   │   ├── layout/           # Header, Sidebar, Footer
│   │   └── lesson/           # Lesson display components
│   ├── context/              # React Context providers
│   │   ├── AchievementContext.jsx
│   │   ├── DarkModeContext.jsx
│   │   └── ProgressContext.jsx
│   ├── data/
│   │   ├── achievements.js   # Achievement definitions
│   │   ├── commandDatabase.js # Terminal command responses
│   │   └── lessonStructure.js # Lesson organization
│   ├── hooks/                # Custom React hooks
│   ├── pages/                # Main application pages
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🧪 Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Routing**: React Router 6
- **Code Editor**: @uiw/react-textarea-code-editor
- **Syntax Highlighting**: react-syntax-highlighter
- **Markdown**: react-markdown with gray-matter
- **Icons**: Lucide React
- **State Management**: React Context API
- **Persistence**: localStorage

## 📝 Creating New Lessons

Lessons are markdown files with frontmatter metadata:

```markdown
---
id: lesson-id
title: Lesson Title
module: 1
lesson: 1
points: 100
estimatedTime: 15
prerequisites: []
---

# Lesson Content

Your markdown content here...
```

Place lesson files in `public/lessons/module-X/` and they'll be automatically loaded.

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize the SELinux brand colors:

```javascript
colors: {
  selinux: {
    500: '#0ea5e9',
    600: '#0284c7',
    // ... more shades
  },
}
```

### Achievements

Add new achievements in `src/data/achievements.js`:

```javascript
{
  id: 'achievement-id',
  title: 'Achievement Title',
  description: 'Description',
  icon: 'trophy',
  tier: 'gold',
  checkUnlock: (progress) => /* unlock logic */
}
```

### Terminal Commands

Extend the command database in `src/data/commandDatabase.js`:

```javascript
'your-command': {
  output: 'Command output',
  description: 'Command description',
  requiresRoot: false,
}
```

## 🔒 Security Note

This tutorial uses a **simulated terminal environment** for educational purposes. The terminal does not execute real commands or modify your system. Always practice SELinux commands in a safe test environment before applying to production systems.

## 🤝 Contributing

Contributions are welcome! To add new lessons:

1. Create markdown files in the appropriate module directory
2. Follow the existing frontmatter format
3. Include practical examples and exercises
4. Update `lessonStructure.js` if needed

## 📖 Additional Resources

- [Red Hat SELinux Documentation](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/using_selinux/index)
- [SELinux Project](https://selinuxproject.org/)
- [SELinux Notebook](https://github.com/SELinuxProject/selinux-notebook)

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- SELinux Project and NSA for SELinux
- Red Hat for extensive SELinux documentation
- React and Vite communities for excellent tools

---

**Happy Learning!** Master SELinux security through interactive practice. 🛡️
