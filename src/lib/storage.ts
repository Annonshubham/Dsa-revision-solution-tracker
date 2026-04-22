import { Problem, Solution } from '../types';

const STORAGE_KEY = 'dsa_viewer_problems';
const SAMPLE_DATA_KEY = 'dsa_viewer_sample_loaded';

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Load all problems from localStorage
export const loadProblems = (): Problem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading problems from localStorage:', error);
    return [];
  }
};

// Save all problems to localStorage
export const saveProblems = (problems: Problem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
  } catch (error) {
    console.error('Error saving problems to localStorage:', error);
  }
};

// Add a new problem
export const addProblem = (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>): Problem => {
  const problems = loadProblems();
  const newProblem: Problem = {
    ...problem,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  problems.push(newProblem);
  saveProblems(problems);
  return newProblem;
};

// Delete a problem
export const deleteProblem = (id: string): void => {
  const problems = loadProblems();
  const filtered = problems.filter(p => p.id !== id);
  saveProblems(filtered);
};

// Update a problem
export const updateProblem = (id: string, updates: Partial<Problem>): Problem | null => {
  const problems = loadProblems();
  const index = problems.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  problems[index] = {
    ...problems[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveProblems(problems);
  return problems[index];
};

// Add a solution to a problem
export const addSolution = (problemId: string, solution: Omit<Solution, 'id'>): Solution | null => {
  const problems = loadProblems();
  const problem = problems.find(p => p.id === problemId);
  if (!problem) return null;

  const newSolution: Solution = {
    ...solution,
    id: generateId(),
  };
  
  problem.solutions.push(newSolution);
  problem.updatedAt = new Date().toISOString();
  
  saveProblems(problems);
  return newSolution;
};

// Delete a solution from a problem
export const deleteSolution = (problemId: string, solutionId: string): void => {
  const problems = loadProblems();
  const problem = problems.find(p => p.id === problemId);
  if (!problem) return;

  problem.solutions = problem.solutions.filter(s => s.id !== solutionId);
  problem.updatedAt = new Date().toISOString();
  saveProblems(problems);
};

// Load sample data if not already loaded
export const initializeSampleData = (): void => {
  const alreadyLoaded = localStorage.getItem(SAMPLE_DATA_KEY);
  if (alreadyLoaded) return;

  const sampleProblems: Problem[] = [
    {
      id: generateId(),
      questionNumber: 1,
      title: 'Two Sum',
      difficulty: 'Easy',
      description: 'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
      example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].',
      link: 'https://leetcode.com/problems/two-sum/',
      platform: 'LeetCode',
      tags: ['Arrays', 'Hash Table'],
      solutions: [
        {
          id: generateId(),
          title: 'Brute Force',
          code: `function twoSum(nums: number[], target: number): number[] {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`,
          explanation: 'Iterate through every pair of numbers and check if their sum equals the target.',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)',
        },
        {
          id: generateId(),
          title: 'Hash Map',
          code: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`,
          explanation: 'Use a hash map to store values we have seen. For each number, check if its complement (target - num) exists in the map.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
        },
      ],
      solvedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      questionNumber: 2,
      title: 'Reverse String',
      difficulty: 'Easy',
      description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must do this by modifying the input array in-place with O(1) extra memory.',
      constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
      example: 'Input: s = ["h","e","l","l","o"]\nOutput: ["o","l","l","e","h"]',
      link: 'https://leetcode.com/problems/reverse-string/',
      platform: 'LeetCode',
      tags: ['String', 'Two Pointers'],
      solutions: [
        {
          id: generateId(),
          title: 'Two Pointers',
          code: `function reverseString(s: string[]): void {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        [s[left], s[right]] = [s[right], s[left]];
        left++;
        right--;
    }
}`,
          explanation: 'Use two pointers from both ends and swap characters moving towards the center.',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
        },
      ],
      solvedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      questionNumber: 3,
      title: 'Binary Search',
      difficulty: 'Medium',
      description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.',
      constraints: '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.',
      example: 'Input: nums = [-1,0,3,5,9,12], target = 9\nOutput: 4\nExplanation: 9 exists in nums and its index is 4.',
      link: 'https://leetcode.com/problems/binary-search/',
      platform: 'LeetCode',
      tags: ['Array', 'Binary Search'],
      solutions: [
        {
          id: generateId(),
          title: 'Binary Search (Iterative)',
          code: `function search(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;
    
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
}`,
          explanation: 'Use binary search to find the target in O(log n) time by repeatedly dividing the search space in half.',
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(1)',
        },
        {
          id: generateId(),
          title: 'Binary Search (Recursive)',
          code: `function search(nums: number[], target: number, left = 0, right = nums.length - 1): number {
    if (left > right) return -1;
    
    const mid = Math.floor((left + right) / 2);
    
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) return search(nums, target, mid + 1, right);
    return search(nums, target, left, mid - 1);
}`,
          explanation: 'Recursive implementation of binary search using the same logic but with function calls.',
          timeComplexity: 'O(log n)',
          spaceComplexity: 'O(log n) due to call stack',
        },
      ],
      solvedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  saveProblems(sampleProblems);
  localStorage.setItem(SAMPLE_DATA_KEY, 'true');
};
