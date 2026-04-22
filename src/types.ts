export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Platform = 'LeetCode' | 'CodeChef' | 'GeeksforGeeks' | 'HackerRank' | 'Codeforces' | 'Other';

export interface Solution {
  id: string;
  title: string;
  code: string;
  explanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  category: 'Arrays' | 'Strings' | 'Trees' | 'Graphs' | 'DP' | 'Greedy' | 'Design' | 'Other';
  tags: string[];
  priority: 'Low' | 'Medium' | 'High';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Problem {
  id: string;
  questionNumber: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  constraints?: string;
  example?: string;
  link?: string;
  platform?: Platform;
  tags?: string[];
  solutions: Solution[];
  solvedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppContextType {
  problems: Problem[];
  addProblem: (problem: Omit<Problem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteProblem: (id: string) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  addSolution: (problemId: string, solution: Omit<Solution, 'id'>) => void;
  deleteSolution: (problemId: string, solutionId: string) => void;
}
