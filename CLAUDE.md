# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive web-based se-linux tutorial where users learn se-linux policy and how to make se-linux policy through hands-on practice with validation, hints, and gamification features.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Code Editor**: @uiw/react-textarea-code-editor
- **State Management**: React Context API
- **Persistence**: localStorage
- **Browser Polyfills**: buffer (required for gray-matter in browser environment)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
```

## Project Structure

## Architecture

### Gamification
- Points awarded on lesson completion (defined in lesson frontmatter)
- Achievements checked in achievements.js:34 after each completion
- Progress tracked: completed lessons, total points, achievements
- AchievementToast.jsx displays celebration animations

### Dark Mode
- DarkModeContext.jsx manages dark mode state via Context API
- User preference persisted to localStorage via useLocalStorage hook
- Tailwind CSS configured with `darkMode: 'class'` in tailwind.config.js
- Dark mode toggled by adding/removing 'dark' class on document element
- DarkModeToggle.jsx provides animated toggle switch (sun/moon icons) in header
- All components support dark mode with `dark:` Tailwind variants
- Smooth color transitions (300ms) for better UX
