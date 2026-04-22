# DSA Viewer - LeetCode Style Revision Tracker

A modern, interactive web application for mastering Data Structures & Algorithms with multiple solution approaches. Built with React, TypeScript, Tailwind CSS, and localStorage.

## 🎯 Features

### Core Features
- **Split-Screen Layout**: Problem on the left, solutions on the right
- **Multiple Solutions**: Add multiple approaches to each problem (Brute Force, Optimal, etc.)
- **Solution Tabs**: Quick navigation between different solutions
- **Syntax Highlighting**: Code editor with Monaco Editor integration
- **Local Storage**: All data persists in your browser - no backend needed
- **Keyboard Shortcuts**: Arrow keys to navigate between solutions

### Problem Management
- Add new problems with title, difficulty, description, examples, and tags
- Organize problems by difficulty (Easy, Medium, Hard)
- Search and filter problems
- Delete problems and solutions

### Solution Features
- Code with syntax highlighting
- Time and Space complexity analysis
- Detailed explanations for each approach
- Support for multiple programming languages

## 🚀 Quick Start

### Installation
```bash
cd dsa-revision-tracker
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

## 📋 Project Structure

```
src/
├── components/
│   ├── ProblemListNew.tsx      # Main problem list and add problem modal
│   ├── ProblemViewer.tsx       # Split-screen problem/solution viewer
│   └── SolutionTabs.tsx        # Solution navigation tabs
├── lib/
│   └── storage.ts             # localStorage utilities
├── types.ts                   # TypeScript interfaces
├── App.tsx                    # Main app router
├── main.tsx                   # Entry point
└── index.css                  # Tailwind CSS styles
```

## 💾 Data Structure

### Problems
```typescript
interface Problem {
  id: string;                    // Unique identifier
  questionNumber: number;        // Problem number
  title: string;                 // Problem title
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;           // Problem description
  example?: string;              // Example input/output
  link?: string;                 // Link to original problem
  tags?: string[];               // Problem tags
  solutions: Solution[];         // Array of solutions
  createdAt: string;            // Creation timestamp
  updatedAt: string;            // Last update timestamp
}
```

### Solutions
```typescript
interface Solution {
  id: string;                    // Unique identifier
  title: string;                 // Solution approach name
  code: string;                  // Solution code
  explanation?: string;          // Detailed explanation
  timeComplexity?: string;       // Time complexity (e.g., "O(n)")
  spaceComplexity?: string;      // Space complexity (e.g., "O(1)")
}
```

## 🎮 Usage Guide

### Home Page - Problem List
1. View all problems in a table format
2. Search by problem title or number
3. Filter by difficulty level
4. Click "Add Problem" to create a new problem
5. Click "View" to open a problem in the viewer

### Problem Viewer - Split Screen
**Left Panel:**
- Complete problem statement
- Problem description
- Example inputs and outputs
- Link to original problem (if provided)

**Right Panel:**
- Solution tabs showing all approaches
- Active solution highlighted in emerald
- Code with syntax highlighting
- Time and space complexity
- Detailed explanation

### Adding a Problem
1. Click "Add Problem" button
2. Fill in:
   - Question Number
   - Title
   - Difficulty
   - Description (required)
   - Example (optional)
   - LeetCode Link (optional)
   - Tags (comma-separated)
3. Click "Add Problem"

### Adding a Solution
1. Open a problem in the viewer
2. Click the "+" button in the solution tabs or "Add Solution" button
3. Fill in:
   - Solution Name (e.g., "Brute Force", "Optimal")
   - Code
   - Explanation
   - Time Complexity
   - Space Complexity
4. Click "Save Solution"

## ⌨️ Keyboard Shortcuts

- **Arrow Right (→)**: Navigate to next solution
- **Arrow Left (←)**: Navigate to previous solution

## 🎨 UI/UX Features

- **Dark Theme**: Easy on the eyes, modern design
- **Smooth Animations**: Framer Motion animations for fluid transitions
- **Responsive Design**: Works on desktop and tablet
- **Hover Effects**: Interactive elements provide visual feedback
- **Active States**: Clear indication of selected solutions
- **Loading States**: Skeleton and spinner feedback

## 📦 Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite 6
- **Code Editor**: Monaco Editor
- **Animation**: Framer Motion
- **Routing**: React Router 7
- **Icons**: Lucide React

## 💾 LocalStorage Schema

Data is stored in localStorage under the key `dsa_viewer_problems`:
- Each problem is stored with unique ID and timestamp
- Solutions are nested within problems
- All data is serialized as JSON
- Sample data is automatically loaded on first visit

## 🔄 Data Flow

1. **Initialization**: Sample problems are loaded from `initializeSampleData()`
2. **Problem List**: `loadProblems()` fetches all problems from localStorage
3. **Add Problem**: New problem created with unique ID and saved
4. **Add Solution**: Solution added to problem and data persisted
5. **Delete**: Problem or solution removed from localStorage
6. **Update**: Problem metadata updated with timestamp

## 📚 Sample Problems Included

Three sample problems are included on first load:
1. **Two Sum** (Easy) - 2 solutions (Brute Force, Hash Map)
2. **Reverse String** (Easy) - 1 solution (Two Pointers)
3. **Binary Search** (Medium) - 2 solutions (Iterative, Recursive)

## 🚨 Limitations

- Data stored in browser localStorage only (per-device)
- Limited to ~5-10MB storage depending on browser
- No cloud sync or backup
- Private to single browser/device

## 🎓 Tips for Best Usage

1. **Organize by Tags**: Use consistent tags for related problems
2. **Progressive Complexity**: Add solutions from brute force to optimal
3. **Write Explanations**: Document your thought process
4. **Review Regularly**: Use arrow keys to quickly switch between approaches
5. **Clear Naming**: Use meaningful names for different approaches

## 🤝 Contributing

Feel free to extend this project with:
- Multiple language support
- Export/Import functionality
- Cloud synchronization
- Collaboration features
- Problem difficulty statistics

## 📄 License

This project is open source and available for personal use.

## 🎯 Future Enhancements

- [ ] Export problems to JSON/CSV
- [ ] Import problems from file
- [ ] Progress tracking and statistics
- [ ] Spaced repetition system
- [ ] Problem difficulty rating
- [ ] Multiple language code support
- [ ] Dark/Light theme toggle
- [ ] Cloud synchronization

---

**Happy Coding! 🚀**

For questions or issues, check the code comments or examine the component structure in `src/components/`.
