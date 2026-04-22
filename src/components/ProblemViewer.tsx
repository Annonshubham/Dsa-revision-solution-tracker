import { useEffect, useRef, useState } from 'react';
import { Problem, Solution } from '../types';
import { motion } from 'motion/react';
import { ArrowLeft, Tag, ExternalLink, Plus, Save, X, Edit2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import SolutionTabs from './SolutionTabs';
import Editor from '@monaco-editor/react';
import { updateProblem } from '../lib/robustStorage';

interface ProblemViewerProps {
  problem: Problem;
  onAddSolution: (solution: Omit<Solution, 'id'>) => void;
  onDeleteSolution: (solutionId: string) => void;
}

export default function ProblemViewer({
  problem,
  onAddSolution,
  onDeleteSolution,
}: ProblemViewerProps) {
  const [activeSolutionId, setActiveSolutionId] = useState(
    problem.solutions[0]?.id || ''
  );
  const [isAddingSolution, setIsAddingSolution] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(problem.notes || '');
  const [newSolution, setNewSolution] = useState({
    title: '',
    code: '',
    explanation: '',
    timeComplexity: '',
    spaceComplexity: '',
  });

  const activeSolution = problem.solutions.find(s => s.id === activeSolutionId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isAddingSolution) return; // Don't trigger shortcuts when adding solution

      const currentIndex = problem.solutions.findIndex(s => s.id === activeSolutionId);
      
      if (e.key === 'ArrowRight' && currentIndex < problem.solutions.length - 1) {
        setActiveSolutionId(problem.solutions[currentIndex + 1].id);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveSolutionId(problem.solutions[currentIndex - 1].id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSolutionId, problem.solutions, isAddingSolution]);

  const handleAddSolution = () => {
    if (newSolution.title.trim() && newSolution.code.trim()) {
      onAddSolution(newSolution);
      setNewSolution({
        title: '',
        code: '',
        explanation: '',
        timeComplexity: '',
        spaceComplexity: '',
      });
      setIsAddingSolution(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateProblem(problem.id, { notes: editedNotes || undefined });
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error saving notes. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Hard':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-neutral-800 rounded transition">
            <ArrowLeft size={20} className="text-neutral-400" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                Q.{problem.questionNumber}: {problem.title}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(
                  problem.difficulty
                )}`}
              >
                {problem.difficulty}
              </span>
            </div>
            {problem.tags && problem.tags.length > 0 && (
              <div className="flex gap-2 mt-2">
                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded"
                  >
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {problem.link && (
          <a
            href={problem.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
          >
            <ExternalLink size={18} />
            {problem.platform || 'View Problem'}
          </a>
        )}
      </motion.div>

      {/* Split Screen Layout */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Problem */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 flex flex-col overflow-hidden border-r border-neutral-800 bg-neutral-950"
        >
          {/* Problem content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
              <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {problem.description}
              </p>
            </div>

            {/* Constraints */}
            {problem.constraints && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Constraints</h2>
                <pre className="bg-neutral-900 p-4 rounded border border-neutral-800 text-neutral-300 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                  {problem.constraints}
                </pre>
              </div>
            )}

            {/* Example */}
            {problem.example && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Example</h2>
                <pre className="bg-neutral-900 p-4 rounded border border-neutral-800 text-neutral-300 text-sm overflow-x-auto whitespace-pre-wrap break-words">
                  {problem.example}
                </pre>
              </div>
            )}

            {/* Notes Section */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">📝 My Notes & Learning</h2>
                </div>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="p-2 hover:bg-neutral-800 rounded transition text-neutral-400 hover:text-emerald-400"
                    title="Edit notes"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={editedNotes}
                    onChange={e => setEditedNotes(e.target.value)}
                    placeholder="Write what you learned, mistakes you made, key insights, approach explanation, etc."
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-32 resize-none focus:ring-1 focus:ring-emerald-500/50"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition font-medium text-sm"
                    >
                      <CheckCircle2 size={16} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingNotes(false);
                        setEditedNotes(problem.notes || '');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition text-sm"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="min-h-20 max-h-40 overflow-y-auto">
                  {editedNotes ? (
                    <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap text-sm">
                      {editedNotes}
                    </p>
                  ) : (
                    <p className="text-neutral-500 italic text-sm">
                      No notes yet. Click the edit button to add what you learned from this problem.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Solution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-1/2 flex flex-col overflow-hidden bg-neutral-950"
        >
          {/* Solution Tabs */}
          <SolutionTabs
            solutions={problem.solutions}
            activeSolutionId={activeSolutionId}
            onSelectSolution={setActiveSolutionId}
            onAddSolution={() => setIsAddingSolution(true)}
            onDeleteSolution={onDeleteSolution}
          />

          {/* Solution Content */}
          {isAddingSolution ? (
            // Add Solution Form
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Add New Solution</h3>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Solution Name (e.g., Brute Force, Optimal)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Brute Force"
                  value={newSolution.title}
                  onChange={e => setNewSolution({ ...newSolution, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Code</label>
                <div className="border border-neutral-700 rounded overflow-hidden h-48">
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    theme="vs-dark"
                    value={newSolution.code}
                    onChange={value => setNewSolution({ ...newSolution, code: value || '' })}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Explanation
                </label>
                <textarea
                  placeholder="Explain your solution..."
                  value={newSolution.explanation}
                  onChange={e => setNewSolution({ ...newSolution, explanation: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Time Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., O(n)"
                    value={newSolution.timeComplexity}
                    onChange={e => setNewSolution({ ...newSolution, timeComplexity: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Space Complexity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., O(n)"
                    value={newSolution.spaceComplexity}
                    onChange={e => setNewSolution({ ...newSolution, spaceComplexity: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddSolution}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition font-medium"
                >
                  <Save size={18} /> Save Solution
                </button>
                <button
                  onClick={() => setIsAddingSolution(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          ) : activeSolution ? (
            // Display Solution
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Code */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Code</h3>
                <div className="bg-neutral-900 rounded border border-neutral-800 overflow-hidden">
                  <pre className="p-4 text-neutral-300 text-sm overflow-x-auto whitespace-pre-wrap break-words font-mono">
                    <code>{activeSolution.code}</code>
                  </pre>
                </div>
              </div>

              {/* Complexities */}
              {(activeSolution.timeComplexity || activeSolution.spaceComplexity) && (
                <div className="grid grid-cols-2 gap-4">
                  {activeSolution.timeComplexity && (
                    <div className="bg-neutral-900 p-4 rounded border border-neutral-800">
                      <h4 className="text-sm font-semibold text-neutral-400 mb-2">Time Complexity</h4>
                      <p className="text-xl font-bold text-emerald-400">
                        {activeSolution.timeComplexity}
                      </p>
                    </div>
                  )}
                  {activeSolution.spaceComplexity && (
                    <div className="bg-neutral-900 p-4 rounded border border-neutral-800">
                      <h4 className="text-sm font-semibold text-neutral-400 mb-2">Space Complexity</h4>
                      <p className="text-xl font-bold text-emerald-400">
                        {activeSolution.spaceComplexity}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {activeSolution.explanation && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Explanation</h3>
                  <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {activeSolution.explanation}
                  </p>
                </div>
              )}

              {/* Keyboard hints */}
              <div className="bg-neutral-900 border border-neutral-800 p-3 rounded text-xs text-neutral-500">
                💡 Use arrow keys (← →) to navigate between solutions
              </div>
            </div>
          ) : (
            // No solution
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-neutral-400 mb-4">No solution yet</p>
                <button
                  onClick={() => setIsAddingSolution(true)}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition"
                >
                  <Plus size={18} /> Add Solution
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
