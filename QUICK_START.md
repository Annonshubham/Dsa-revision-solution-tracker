# DSA Viewer - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Navigate to Project
```bash
cd c:\Users\shubh\Downloads\dsa-revision-tracker
```

### Step 2: Install Dependencies (if not already done)
```bash
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```

### Step 4: Open in Browser
Visit: `http://localhost:5173`

## 📱 Using the App

### Home Screen
1. You'll see a list of 3 sample problems
2. Each has difficulty badges (Easy/Medium/Hard)
3. Shows number of solutions for each problem

### Adding Your First Problem
1. Click the **"+ Add Problem"** button
2. Fill in:
   - **Q.No**: e.g., `10`
   - **Title**: e.g., `Container With Most Water`
   - **Difficulty**: Choose from Easy/Medium/Hard
   - **Description**: Detailed problem statement
   - **Example**: Sample input/output (optional)
   - **Link**: LeetCode URL (optional)
   - **Tags**: e.g., `Array, Two Pointers`
3. Click **"Add Problem"**

### Viewing a Problem
1. Click the **"View"** button on any problem
2. You'll see split-screen layout:
   - **Left**: Problem description
   - **Right**: Solution display

### Adding Solutions
1. In the solution viewer, click the **"+"** button
2. Fill in solution details:
   - **Solution Name**: e.g., `Two Pointers`
   - **Code**: Paste your solution code
   - **Explanation**: How it works
   - **Time Complexity**: e.g., `O(n)`
   - **Space Complexity**: e.g., `O(1)`
3. Click **"Save Solution"**

### Switching Between Solutions
- Click on solution tabs at the top
- Or use **Arrow Keys**:
  - **→** (Right): Next solution
  - **← (Left)**: Previous solution

## 🎯 Key Features

### Search & Filter
- **Search Box**: Find by problem title or number
- **Difficulty Filter**: Show only Easy/Medium/Hard problems

### Problem Management
- **View**: Open problem in split-screen viewer
- **Delete**: Remove problem (appears on hover)
- **Add**: Create new problem

### Solution Management
- **Add**: Add new solution approach
- **Delete**: Remove solution (appears on tab hover)
- **Navigate**: Arrow keys between solutions
- **Next/Previous**: Buttons in tab bar

## 💾 Data Storage

All data is saved to **browser localStorage**:
- Data persists even after closing the browser
- Data is stored locally on your device
- Can be cleared by clearing browser cache

To view your data in browser:
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. Click **Local Storage**
4. Click your domain URL
5. Find `dsa_viewer_problems` key

## 📊 Sample Problems

Three problems are pre-loaded:

### 1. Two Sum (Easy)
- Brute Force approach
- Hash Map approach
- Learn both O(n²) and O(n) solutions

### 2. Reverse String (Easy)
- Two Pointers approach
- Master in-place algorithms

### 3. Binary Search (Medium)
- Iterative approach
- Recursive approach
- Understand different implementation styles

## ⚙️ Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# TypeScript lint
npm run lint
```

## 🐛 Troubleshooting

### Problem Not Saving
- Check browser developer console for errors
- Ensure localStorage is enabled
- Try clearing cache and reloading

### Can't Add Solution
- Fill all required fields
- Check console for error messages
- Verify problem exists

### Keyboard Shortcuts Not Working
- Make sure focus is on the page (not in input)
- Only works when viewing a problem
- Try clicking on the page first

### Data Disappeared
- Check if you cleared browser cache
- Visit the page again - sample data will reload
- Check localStorage capacity (5-10MB limit)

## 📚 Example Workflow

1. **Morning Review**:
   - Open DSA Viewer
   - Search for "Easy" problems
   - Click a problem
   - Use arrow keys to review all solutions
   - Focus on the "Optimal" solution

2. **Learning New Approach**:
   - Click "Add Problem" → Enter your problem
   - Click "View"
   - Click "+" in solutions
   - Enter "My Approach"
   - Write your code
   - Add explanation and complexities
   - Review later using arrow keys

3. **Practice Session**:
   - Filter by difficulty
   - Click through problems
   - Time yourself solving without looking at solutions
   - Review solutions after

## 🎓 Tips & Best Practices

1. **Use Consistent Names**: "Brute Force", "Optimal", "Two Pointers", etc.
2. **Document Complexity**: Always add Time and Space complexity
3. **Explain Well**: Write clear explanations for future reference
4. **Use Tags**: Tag problems consistently (Array, String, Tree, etc.)
5. **Review Often**: Use arrow keys to quickly switch between approaches
6. **Add Q.Numbers**: Maintain consistency with LeetCode numbers

## 🔗 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ← Arrow Left | Previous Solution |
| → Arrow Right | Next Solution |
| Click Tab | Jump to Solution |

## 📱 Responsive Design

Works on:
- Desktop (Full experience)
- Tablet (Optimized layout)
- Mobile (Single column fallback)

## 🔐 Privacy

- All data stored locally in your browser
- No data sent to servers
- No accounts required
- No tracking

## 💡 Ideas for Using DSA Viewer

- **Interview Prep**: Collect problems you practice
- **Study Group**: Export and share problems
- **Teaching**: Create problems with multiple solution approaches
- **Review**: Regularly revisit solutions to reinforce learning
- **Track Progress**: See how many problems you've mastered

## 🆘 Need Help?

1. Check the main `DSA_VIEWER_README.md` for detailed documentation
2. See `IMPLEMENTATION_GUIDE.md` for technical details
3. Review the sample problems for examples
4. Check browser console (F12) for error messages

## 🎉 You're Ready!

Start exploring, adding problems, and mastering DSA! Happy Coding! 🚀

---

**Next Steps**:
- [ ] Add your first problem
- [ ] Add 2 solutions to it
- [ ] Use arrow keys to navigate
- [ ] Add more problems from your practice list
- [ ] Review using the split-screen viewer
