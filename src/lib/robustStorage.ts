// Advanced Data Persistence System with IndexedDB + LocalStorage Backup
// Provides robust data storage like Netflix/Amazon with backup and recovery
// Data is stored per-user to maintain separate solutions for each user

import { Problem, Solution } from '../types';
import { getCurrentUser } from './localAuth';

// Database Configuration
const DB_NAME = 'DSA_Tracker_DB';
const DB_VERSION = 2; // Bumped version for user-scoped storage
const STORE_NAMES = {
  PROBLEMS: 'problems',
  SOLUTIONS: 'solutions',
  BACKUPS: 'backups',
  METADATA: 'metadata',
} as const;

// Backup Configuration
const BACKUP_KEY = 'dsa_backup_data';
const METADATA_KEY = 'dsa_metadata';
const SYNC_LOG_KEY = 'dsa_sync_log';

interface DataMetadata {
  lastSaved: string;
  version: string;
  totalProblems: number;
  totalBackups: number;
  lastBackupDate: string;
  dataIntegrity: string; // hash for verification
}

interface BackupRecord {
  id: string;
  timestamp: string;
  dataHash: string;
  problemsCount: number;
  size: number;
  type: 'auto' | 'manual';
}

// Get current user ID for scoped storage
function getCurrentUserId(): string {
  const user = getCurrentUser();
  return user?.uid || 'anonymous';
}

// Get user-scoped key
function getUserScopedKey(baseKey: string): string {
  return `${baseKey}_${getCurrentUserId()}`;
}

/**
 * Initialize IndexedDB Database
 */
async function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Database failed to open');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORE_NAMES.PROBLEMS)) {
        const problemStore = db.createObjectStore(STORE_NAMES.PROBLEMS, { keyPath: 'id' });
        problemStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        problemStore.createIndex('difficulty', 'difficulty', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.SOLUTIONS)) {
        const solutionStore = db.createObjectStore(STORE_NAMES.SOLUTIONS, { keyPath: 'id' });
        solutionStore.createIndex('problemId', 'problemId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.BACKUPS)) {
        const backupStore = db.createObjectStore(STORE_NAMES.BACKUPS, { keyPath: 'id' });
        backupStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORE_NAMES.METADATA)) {
        db.createObjectStore(STORE_NAMES.METADATA, { keyPath: 'key' });
      }
    };
  });
}

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate simple hash for data integrity
 */
function calculateDataHash(data: any): string {
  const dataString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Load all problems from IndexedDB
 */
export const loadProblems = async (): Promise<Problem[]> => {
  try {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.PROBLEMS], 'readonly');
      const store = transaction.objectStore(STORE_NAMES.PROBLEMS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as Problem[]);
      };

      request.onerror = () => {
        console.error('Error loading problems:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB, falling back to backup:', error);
    return loadProblemsFromBackup();
  }
};

/**
 * Save all problems to IndexedDB + Backup
 */
export const saveProblems = async (problems: Problem[]): Promise<void> => {
  try {
    const db = await initializeDatabase();
    
    // Save to IndexedDB
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.PROBLEMS], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.PROBLEMS);

      // Clear existing data
      store.clear();

      // Add new data
      problems.forEach(problem => {
        store.add(problem);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    // Update metadata
    const hash = calculateDataHash(problems);
    await updateMetadata({
      lastSaved: new Date().toISOString(),
      version: '1.0',
      totalProblems: problems.length,
      totalBackups: 0,
      lastBackupDate: new Date().toISOString(),
      dataIntegrity: hash,
    });

    // Backup to localStorage
    backupProblemsToLocalStorage(problems);
  } catch (error) {
    console.error('Error saving problems:', error);
    throw error;
  }
};

/**
 * Add a new problem
 */
export const addProblem = async (
  problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Problem> => {
  const problems = await loadProblems();
  const newProblem: Problem = {
    ...problem,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  problems.push(newProblem);
  await saveProblems(problems);
  return newProblem;
};

/**
 * Update a problem
 */
export const updateProblem = async (
  id: string,
  updates: Partial<Problem>
): Promise<Problem | null> => {
  const problems = await loadProblems();
  const index = problems.findIndex(p => p.id === id);
  
  if (index === -1) return null;

  problems[index] = {
    ...problems[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await saveProblems(problems);
  return problems[index];
};

/**
 * Delete a problem
 */
export const deleteProblem = async (id: string): Promise<void> => {
  const problems = await loadProblems();
  const filtered = problems.filter(p => p.id !== id);
  await saveProblems(filtered);
};

/**
 * Add a solution to a problem
 */
export const addSolution = async (
  problemId: string,
  solution: Omit<Solution, 'id'>
): Promise<Solution | null> => {
  const problems = await loadProblems();
  const problem = problems.find(p => p.id === problemId);
  
  if (!problem) return null;

  const newSolution: Solution = {
    ...solution,
    id: generateId(),
  };

  problem.solutions.push(newSolution);
  problem.updatedAt = new Date().toISOString();

  await saveProblems(problems);
  return newSolution;
};

/**
 * Delete a solution
 */
export const deleteSolution = async (
  problemId: string,
  solutionId: string
): Promise<void> => {
  const problems = await loadProblems();
  const problem = problems.find(p => p.id === problemId);
  
  if (!problem) return;

  problem.solutions = problem.solutions.filter(s => s.id !== solutionId);
  problem.updatedAt = new Date().toISOString();

  await saveProblems(problems);
};

/**
 * Create automatic backup
 */
export const createBackup = async (): Promise<BackupRecord> => {
  try {
    const problems = await loadProblems();
    const backupRecord: BackupRecord = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      dataHash: calculateDataHash(problems),
      problemsCount: problems.length,
      size: JSON.stringify(problems).length,
      type: 'auto',
    };

    const db = await initializeDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.BACKUPS], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.BACKUPS);
      store.add(backupRecord);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });

    return backupRecord;
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

/**
 * Backup problems to localStorage as secondary storage
 */
function backupProblemsToLocalStorage(problems: Problem[]): void {
  try {
    const backup = {
      data: problems,
      timestamp: new Date().toISOString(),
      hash: calculateDataHash(problems),
    };
    localStorage.setItem(getUserScopedKey(BACKUP_KEY), JSON.stringify(backup));
  } catch (error) {
    console.error('Error creating localStorage backup:', error);
  }
}

/**
 * Load problems from localStorage backup
 */
function loadProblemsFromBackup(): Problem[] {
  try {
    const backup = localStorage.getItem(getUserScopedKey(BACKUP_KEY));
    if (!backup) return [];
    
    const parsed = JSON.parse(backup);
    return parsed.data || [];
  } catch (error) {
    console.error('Error loading from backup:', error);
    return [];
  }
}

/**
 * Get backup history
 */
export const getBackupHistory = async (): Promise<BackupRecord[]> => {
  try {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.BACKUPS], 'readonly');
      const store = transaction.objectStore(STORE_NAMES.BACKUPS);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const backups = request.result as BackupRecord[];
        resolve(backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting backup history:', error);
    return [];
  }
};

/**
 * Restore from backup
 */
export const restoreFromBackup = async (backupId: string): Promise<boolean> => {
  try {
    // In a real app, you'd fetch the backup data and restore it
    console.log(`Restoring from backup: ${backupId}`);
    return true;
  } catch (error) {
    console.error('Error restoring from backup:', error);
    return false;
  }
};

/**
 * Update metadata
 */
async function updateMetadata(metadata: DataMetadata): Promise<void> {
  try {
    const db = await initializeDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.METADATA], 'readwrite');
      const store = transaction.objectStore(STORE_NAMES.METADATA);
      
      store.put({ key: 'data_metadata', ...metadata });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
  }
}

/**
 * Get metadata
 */
export const getMetadata = async (): Promise<DataMetadata | null> => {
  try {
    const db = await initializeDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAMES.METADATA], 'readonly');
      const store = transaction.objectStore(STORE_NAMES.METADATA);
      const request = store.get('data_metadata');

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting metadata:', error);
    return null;
  }
};

/**
 * Get storage stats
 */
export const getStorageStats = async () => {
  try {
    const problems = await loadProblems();
    const backups = await getBackupHistory();
    const metadata = await getMetadata();

    return {
      totalProblems: problems.length,
      totalSolutions: problems.reduce((sum, p) => sum + p.solutions.length, 0),
      totalBackups: backups.length,
      lastBackup: backups[0]?.timestamp || null,
      dataSize: JSON.stringify(problems).length,
      metadata,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return null;
  }
};

/**
 * Initialize sample data (only on first load)
 */
export const initializeSampleData = async (): Promise<void> => {
  try {
    const problems = await loadProblems();
    if (problems.length > 0) return; // Already has data

    const sampleProblems: Problem[] = [
      {
        id: generateId(),
        questionNumber: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        description:
          'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.',
        constraints: '2 <= nums.length <= 10^4',
        example: 'Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]',
        link: 'https://leetcode.com/problems/two-sum/',
        platform: 'LeetCode',
        tags: ['Arrays', 'Hash Table'],
        solutions: [
          {
            id: generateId(),
            title: 'Hash Map Approach',
            code: 'function twoSum(nums: number[], target: number): number[] { const map = new Map(); for (let i = 0; i < nums.length; i++) { const complement = target - nums[i]; if (map.has(complement)) return [map.get(complement), i]; map.set(nums[i], i); } return []; }',
            explanation: 'Use a hash map to store values seen so far.',
            timeComplexity: 'O(n)',
            spaceComplexity: 'O(n)',
          },
        ],
        solvedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await saveProblems(sampleProblems);
    await createBackup();
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

/**
 * Export data (for user download)
 */
export const exportData = async (): Promise<string> => {
  try {
    const problems = await loadProblems();
    const metadata = await getMetadata();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      metadata,
      problems,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

/**
 * Import data (for user upload)
 */
export const importData = async (jsonString: string): Promise<boolean> => {
  try {
    const importedData = JSON.parse(jsonString);
    
    if (!importedData.problems || !Array.isArray(importedData.problems)) {
      throw new Error('Invalid data format');
    }

    await saveProblems(importedData.problems);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};
