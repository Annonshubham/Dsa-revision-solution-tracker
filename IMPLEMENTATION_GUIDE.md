# DSA Viewer - Implementation Guide

## Overview

The DSA Viewer is a complete, production-ready web application built with React + TypeScript + Tailwind CSS. It provides a LeetCode-like interface for managing and studying Data Structure & Algorithm problems with multiple solution approaches.

## Architecture

### Component Structure
```
App.tsx (Router & State Management)
├── ProblemListNew.tsx (Problem List Page)
│   ├── Search & Filter
│   ├── Problem Table
│   └── Add Problem Modal
└── ProblemViewer.tsx (Split-Screen Viewer)
    ├── SolutionTabs.tsx (Solution Navigation)
    └── Solution Display
```

## Key Components Deep Dive

### 1. Storage System (`lib/storage.ts`)

**Purpose**: Manage all localStorage operations without Firebase

**Key Functions**:
- `generateId()`: Creates unique IDs using timestamp + random string
- `loadProblems()`: Fetches all problems from localStorage
- `addProblem()`: Creates and saves new problem
- `deleteProblem()`: Removes problem from storage
- `updateProblem()`: Updates existing problem
- `addSolution()`: Adds solution to a problem
- `deleteSolution()`: Removes solution from problem
- `initializeSampleData()`: Loads 3 sample problems on first visit

**Data Persistence**:
```javascript
localStorage.setItem('dsa_viewer_problems', JSON.stringify(problems));
```

### 2. Problem Viewer (`components/ProblemViewer.tsx`)

**Split Screen Layout**:
```
┌─────────────────────────────────────┐
│ Header: Problem Title & Difficulty   │
├──────────────────┬──────────────────┤
│                  │                  │
│   Problem        │   Solution Tabs  │
│   Description    │   & Content      │
│                  │                  │
│   Example        │   Code Display   │
│                  │   Complexity     │
│                  │   Explanation    │
└──────────────────┴──────────────────┘
```

**Features**:
- Keyboard shortcuts (Arrow Left/Right)
- Add new solution with form
- Edit and delete solutions
- Responsive to window resize

**Keyboard Handler**:
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') navigateNext();
    else if (e.key === 'ArrowLeft') navigatePrevious();
  };
  window.addEventListener('keydown', handleKeyPress);
}, [activeSolutionId]);
```

### 3. Solution Tabs (`components/SolutionTabs.tsx`)

**Features**:
- Animated tab switching with Framer Motion
- Previous/Next navigation buttons
- Solution counter (e.g., "Solution 1 of 3")
- Add solution button
- Delete solution with confirmation

**Tab Switching**:
```typescript
const handleNext = () => {
  const currentIndex = solutions.findIndex(s => s.id === activeSolutionId);
  if (currentIndex < solutions.length - 1) {
    onSelectSolution(solutions[currentIndex + 1].id);
  }
};
```

### 4. Problem List (`components/ProblemListNew.tsx`)

**Table Format**:
- Q.No | Title | Difficulty | Solutions | Tags | Actions
- Search across all problems
- Filter by difficulty
- Sort by question number

**Add Problem Modal**:
- Modal overlay with form
- Required fields: Q.No, Title, Difficulty, Description
- Optional: Example, Link, Tags
- Dynamic validation

**Features**:
- Hover actions (View, Delete)
- Animated rows with stagger effect
- Color-coded difficulty badges
- Tag display (first 2 tags + count)

## Data Flow Diagram

```
User Action
    ↓
Component Handler
    ↓
Storage Function (lib/storage.ts)
    ↓
localStorage API
    ↓
Persist/Retrieve Data
    ↓
Event Dispatch (for re-renders)
    ↓
State Update
    ↓
Re-render Component
```

## Key Implementation Details

### 1. Multiple Solutions System

Each problem can have multiple solutions with different approaches:

```typescript
// Problem with 3 solutions
{
  id: "123",
  title: "Two Sum",
  solutions: [
    { id: "s1", title: "Brute Force", code: "...", timeComplexity: "O(n²)" },
    { id: "s2", title: "Hash Map", code: "...", timeComplexity: "O(n)" },
    { id: "s3", title: "Two Pointers", code: "...", timeComplexity: "O(n log n)" }
  ]
}
```

### 2. Active Solution Tracking

Uses `activeSolutionId` state to track which solution is displayed:

```typescript
const [activeSolutionId, setActiveSolutionId] = useState(
  problem.solutions[0]?.id || ''
);
const activeSolution = problem.solutions.find(s => s.id === activeSolutionId);
```

### 3. Keyboard Navigation

Integrated keyboard shortcuts for arrow keys:

```typescript
if (e.key === 'ArrowRight' && currentIndex < problem.solutions.length - 1) {
  setActiveSolutionId(problem.solutions[currentIndex + 1].id);
}
```

### 4. Event-Driven Updates

Custom events for cross-component communication:

```typescript
// Adding a solution triggers an update
window.dispatchEvent(new CustomEvent('solutionAdded', { detail: { problemId } }));

// Listener in ProblemDetailWrapper
window.addEventListener('solutionAdded', handleUpdate);
```

## Styling Architecture

### Tailwind CSS Classes Used

**Layout**:
- `h-screen`, `min-h-screen`, `flex`, `grid`
- `overflow-hidden`, `overflow-y-auto`, `overflow-x-auto`

**Colors**:
- `bg-neutral-950` (darkest)
- `bg-neutral-900` (dark)
- `bg-neutral-800` (medium)
- `text-neutral-400` (muted text)
- `text-white` (main text)

**Interactive**:
- `hover:bg-neutral-800`, `hover:text-emerald-400`
- `transition`, `duration-300`
- `rounded`, `border`

**Difficulty Colors**:
```typescript
Easy: "bg-green-500/10 text-green-400"
Medium: "bg-yellow-500/10 text-yellow-400"
Hard: "bg-red-500/10 text-red-400"
```

## Animation Implementation

Using Framer Motion:

```typescript
// Fade in with slide
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  className="..."
/>

// Tab switching animation
<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
/>
```

## Complexity Analysis

### Time Complexities
- Load Problems: O(n) where n = number of problems
- Add Problem: O(1) for array push + O(n) for localStorage write
- Search: O(n) for filtering
- Find Problem: O(n) linear search

### Space Complexities
- Problems Array: O(n × m) where n = problems, m = avg solutions per problem
- localStorage: ~5-10MB limit depending on browser

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with localStorage)
- Mobile Browsers: Full support (responsive design)

## Sample Data Structure

Three problems come pre-loaded:

1. **Two Sum (Q.1, Easy)**
   - Brute Force: O(n²) time, O(1) space
   - Hash Map: O(n) time, O(n) space

2. **Reverse String (Q.2, Easy)**
   - Two Pointers: O(n) time, O(1) space

3. **Binary Search (Q.3, Medium)**
   - Iterative: O(log n) time, O(1) space
   - Recursive: O(log n) time, O(log n) space

## Development Tips

### Adding New Features

1. **New Component**:
   - Create in `src/components/`
   - Import in App.tsx
   - Add route if needed

2. **New Storage Function**:
   - Add to `lib/storage.ts`
   - Return data or void
   - Handle localStorage errors

3. **Styling New Element**:
   - Use existing Tailwind tokens
   - Match color scheme (emerald for active, neutral for background)
   - Add hover/transition states

### Debugging Tips

1. Check localStorage in DevTools:
   ```javascript
   console.log(JSON.parse(localStorage.getItem('dsa_viewer_problems')))
   ```

2. Log state changes:
   ```typescript
   useEffect(() => console.log(problem), [problem])
   ```

3. Test keyboard events:
   ```javascript
   window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
   ```

## Performance Optimizations

- **Lazy Loading**: Problems load on demand from localStorage
- **Memoization**: Problem viewer memoized to prevent unnecessary re-renders
- **Event Delegation**: Single event listener for multiple tabs
- **CSS-in-JS**: Minimal runtime CSS calculation with Tailwind

## Testing Scenarios

1. **Add Problem → Add Solution → View → Delete**
   - Verify data persists
   - Check UI updates correctly

2. **Keyboard Navigation**
   - Test Arrow Right/Left
   - Verify boundaries (first/last solution)

3. **Search & Filter**
   - Test case-insensitive search
   - Verify difficulty filter works
   - Combined search + filter

4. **Data Integrity**
   - Add > 100 problems
   - Check localStorage size
   - Verify performance

## Deployment Instructions

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
npm run build
# Deploy the dist/ folder
```

### Self-Hosted
```bash
npm run build
# Serve dist/ folder with any static web server
python -m http.server 8000  # from dist/ folder
```

## Future Enhancement Ideas

1. **Export/Import**: Save problems as JSON files
2. **Statistics**: Track problem attempts and success rates
3. **Spaced Repetition**: Recommend problems to review
4. **Syntax Highlighting**: Real code highlighting in display (not just editor)
5. **Collaboration**: Share problem sets with others
6. **Backend Sync**: Optional Firebase integration
7. **Problem Categories**: Organize by topics (Trees, Graphs, etc.)
8. **Discussion**: Comments and notes on solutions

## Conclusion

The DSA Viewer provides a complete, feature-rich solution for practicing Data Structures & Algorithms with a modern, responsive UI. All data is persisted locally, making it perfect for offline studying and quick iteration on multiple solution approaches.

The modular component structure makes it easy to extend and customize based on your needs!
