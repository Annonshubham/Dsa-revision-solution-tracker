import { Solution } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface SolutionTabsProps {
  solutions: Solution[];
  activeSolutionId: string;
  onSelectSolution: (solutionId: string) => void;
  onAddSolution?: () => void;
  onDeleteSolution?: (solutionId: string) => void;
}

export default function SolutionTabs({
  solutions,
  activeSolutionId,
  onSelectSolution,
  onAddSolution,
  onDeleteSolution,
}: SolutionTabsProps) {
  if (solutions.length === 0) {
    return (
      <div className="bg-neutral-900 border-b border-neutral-800 p-4">
        <div className="flex items-center justify-center gap-2 text-neutral-400 min-h-[60px]">
          <span>No solutions yet</span>
          {onAddSolution && (
            <button
              onClick={onAddSolution}
              className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm transition"
            >
              <Plus size={16} /> Add Solution
            </button>
          )}
        </div>
      </div>
    );
  }

  const activeSolution = solutions.find(s => s.id === activeSolutionId);
  const isFirstSolution = solutions[0].id === activeSolutionId;
  const isLastSolution = solutions[solutions.length - 1].id === activeSolutionId;

  const handlePrevious = () => {
    const currentIndex = solutions.findIndex(s => s.id === activeSolutionId);
    if (currentIndex > 0) {
      onSelectSolution(solutions[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    const currentIndex = solutions.findIndex(s => s.id === activeSolutionId);
    if (currentIndex < solutions.length - 1) {
      onSelectSolution(solutions[currentIndex + 1].id);
    }
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 p-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={isFirstSolution}
          className="flex-shrink-0 p-2 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Previous solution"
        >
          <ChevronLeft size={20} className="text-neutral-400" />
        </button>

        {/* Solution tabs */}
        <div className="flex gap-2 flex-1 overflow-x-auto">
          <AnimatePresence mode="popLayout">
            {solutions.map((solution) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <div
                  className={`relative px-4 py-2 rounded cursor-pointer transition-all duration-300 flex items-center gap-2 group ${
                    activeSolutionId === solution.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  onClick={() => onSelectSolution(solution.id)}
                >
                  <span className="font-medium text-sm whitespace-nowrap">{solution.title}</span>
                  
                  {onDeleteSolution && solutions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSolution(solution.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/20 rounded"
                      aria-label="Delete solution"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  {activeSolutionId === solution.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded bg-emerald-600 -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={isLastSolution}
          className="flex-shrink-0 p-2 rounded hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
          aria-label="Next solution"
        >
          <ChevronRight size={20} className="text-neutral-400" />
        </button>

        {/* Add button */}
        {onAddSolution && (
          <button
            onClick={onAddSolution}
            className="flex-shrink-0 p-2 rounded hover:bg-neutral-800 text-neutral-400 hover:text-emerald-400 transition"
            aria-label="Add solution"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      {/* Solution counter */}
      {solutions.length > 0 && (
        <div className="text-xs text-neutral-500 mt-2">
          Solution {solutions.findIndex(s => s.id === activeSolutionId) + 1} of {solutions.length}
        </div>
      )}
    </div>
  );
}
