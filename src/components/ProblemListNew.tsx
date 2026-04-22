import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Problem, Difficulty, Platform } from '../types';
import { loadProblems, addProblem, deleteProblem, updateProblem, exportData, importData } from '../lib/robustStorage';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronRight, X, CheckCircle2, Circle, Download, Upload } from 'lucide-react';

export default function ProblemList() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'All'>('All');
  const [filterTag, setFilterTag] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'qno' | 'date' | 'difficulty'>('qno');
  const [currentPage, setCurrentPage] = useState(1);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 25;
  const [newProblem, setNewProblem] = useState({
    questionNumber: '',
    title: '',
    difficulty: 'Medium' as Difficulty,
    description: '',
    constraints: '',
    example: '',
    link: '',
    platform: 'LeetCode' as Platform,
    tags: '',
    solvedDate: '',
    notes: '',
  });

  useEffect(() => {
    loadProblems_();
  }, []);

  const loadProblems_ = async () => {
    try {
      setLoading(true);
      const data = await loadProblems();
      setProblems(data.sort((a, b) => a.questionNumber - b.questionNumber));
    } catch (error) {
      console.error('Error loading problems:', error);
      alert('Error loading problems. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProblem = async () => {
    if (!newProblem.questionNumber || !newProblem.title || !newProblem.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addProblem({
        questionNumber: parseInt(newProblem.questionNumber),
        title: newProblem.title,
        difficulty: newProblem.difficulty,
        description: newProblem.description,
        constraints: newProblem.constraints || undefined,
        example: newProblem.example || undefined,
        link: newProblem.link || undefined,
        platform: newProblem.platform,
        tags: newProblem.tags ? newProblem.tags.split(',').map(t => t.trim()) : [],
        solutions: [],
        solvedDate: newProblem.solvedDate ? new Date(newProblem.solvedDate).toISOString() : undefined,
        notes: newProblem.notes || undefined,
      });

      setNewProblem({
        questionNumber: '',
        title: '',
        difficulty: 'Medium',
        description: '',
        constraints: '',
        example: '',
        link: '',
        platform: 'LeetCode',
        tags: '',
        solvedDate: '',
        notes: '',
      });
      setIsAddModalOpen(false);
      await loadProblems_();
    } catch (error) {
      console.error('Error adding problem:', error);
      alert('Error adding problem. Please try again.');
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await deleteProblem(id);
        await loadProblems_();
      } catch (error) {
        console.error('Error deleting problem:', error);
        alert('Error deleting problem. Please try again.');
      }
    }
  };

  const handleToggleSolved = async (id: string, currentSolvedDate?: string) => {
    try {
      if (currentSolvedDate) {
        // Remove solved date
        await updateProblem(id, { solvedDate: undefined });
      } else {
        // Set solved date to today
        const today = new Date().toISOString().split('T')[0];
        await updateProblem(id, { solvedDate: new Date(today).toISOString() });
      }
      await loadProblems_();
    } catch (error) {
      console.error('Error updating problem:', error);
      alert('Error updating problem. Please try again.');
    }
  };

  // Get all unique tags
  const getAllTags = (): string[] => {
    const tagsSet = new Set<string>();
    problems.forEach(p => {
      p.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  };

  // Get filtered tags based on search term
  const getFilteredTags = (): string[] => {
    const allTags = getAllTags();
    if (!tagSearchTerm.trim()) return allTags;
    return allTags.filter(tag =>
      tag.toLowerCase().includes(tagSearchTerm.toLowerCase())
    );
  };

  // Export data as JSON
  const handleExportData = async () => {
    try {
      const jsonString = await exportData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dsa-problems-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      alert('✅ Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Import data from JSON
  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const success = await importData(content);
        
        if (success) {
          alert('✅ Data imported successfully!');
          await loadProblems_();
        } else {
          alert('❌ Error importing file. Make sure it\'s a valid backup JSON file.');
        }
      } catch (error) {
        alert('❌ Error importing file. Make sure it\'s a valid backup JSON file.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  const filteredProblems = problems
    .filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.questionNumber.toString().includes(searchTerm);
      const matchesDifficulty = filterDifficulty === 'All' || p.difficulty === filterDifficulty;
      const matchesTag = filterTag === 'All' || (p.tags && p.tags.includes(filterTag));
      return matchesSearch && matchesDifficulty && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'difficulty': {
          const diffOrder = { 'Easy': 0, 'Medium': 1, 'Hard': 2 };
          return diffOrder[a.difficulty as keyof typeof diffOrder] - diffOrder[b.difficulty as keyof typeof diffOrder];
        }
        case 'qno':
        default:
          return a.questionNumber - b.questionNumber;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'Hard':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-neutral-500/10 text-neutral-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-900 border-b border-neutral-800 p-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">DSA Viewer</h1>
              <p className="text-neutral-400">
                {problems.length} problems • {problems.filter(p => p.solvedDate).length} solved
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold text-sm"
                title="Export all problems as backup"
              >
                <Download size={18} /> Export
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold text-sm"
                title="Import problems from backup"
              >
                <Upload size={18} /> Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
              >
                <Plus size={20} /> Add Problem
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by title or Q.No..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-4 flex-wrap">
              <select
                value={filterDifficulty}
                onChange={e => {
                  setFilterDifficulty(e.target.value as Difficulty | 'All');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <div className="relative w-64">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Search tags..."
                  value={tagSearchTerm}
                  onChange={e => {
                    setTagSearchTerm(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
                {showTagSuggestions && getFilteredTags().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => {
                        setFilterTag('All');
                        setTagSearchTerm('');
                        setShowTagSuggestions(false);
                        setCurrentPage(1);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-700 transition border-b border-neutral-700"
                    >
                      ✕ Clear Filter
                    </button>
                    {getFilteredTags().map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setFilterTag(tag);
                          setTagSearchTerm('');
                          setShowTagSuggestions(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition ${
                          filterTag === tag
                            ? 'bg-emerald-600 text-white'
                            : 'text-neutral-300 hover:bg-neutral-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
                {showTagSuggestions && tagSearchTerm && getFilteredTags().length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-50 p-3">
                    <p className="text-xs text-neutral-500 italic">No tags found</p>
                  </div>
                )}
              </div>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'qno' | 'date' | 'difficulty')}
                className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="qno">Sort: Q.No</option>
                <option value="date">Sort: Recently Updated</option>
                <option value="difficulty">Sort: Difficulty</option>
              </select>
            </div>

            {/* Active Filters Display */}
            {filterTag !== 'All' && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg text-sm">
                <span className="text-emerald-400">🏷️ Filter:</span>
                <span className="font-medium text-emerald-300">{filterTag}</span>
                <button
                  onClick={() => {
                    setFilterTag('All');
                    setTagSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="ml-auto text-emerald-400 hover:text-emerald-200 transition text-lg leading-none"
                  title="Clear tag filter"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredProblems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-neutral-400 text-lg mb-4">
              {problems.length === 0 ? 'No problems yet. Create your first one!' : 'No problems match your search.'}
            </p>
            {problems.length === 0 && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
              >
                <Plus size={20} /> Add Your First Problem
              </button>
            )}
          </motion.div>
        ) : (
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="overflow-x-auto"
            >
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Q.No</th>
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Title</th>
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Difficulty</th>
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Solutions</th>
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Solved</th>
                  <th className="text-left px-4 py-4 text-neutral-400 font-semibold">Tags</th>
                  <th className="text-right px-4 py-4 text-neutral-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginatedProblems.map((problem, index) => (
                    <motion.tr
                      key={problem.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-neutral-800 hover:bg-neutral-900/50 transition group"
                    >
                      <td className="px-4 py-4">
                        <span className="text-neutral-400">{problem.questionNumber}</span>
                      </td>
                      <td className="px-4 py-4 font-medium">{problem.title}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-neutral-400">
                          {problem.solutions.length} solution{problem.solutions.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleSolved(problem.id, problem.solvedDate)}
                          className="flex items-center gap-2 px-3 py-1 rounded transition"
                        >
                          {problem.solvedDate ? (
                            <>
                              <CheckCircle2 size={16} className="text-green-500" />
                              <span className="text-sm text-green-400">
                                {new Date(problem.solvedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          ) : (
                            <>
                              <Circle size={16} className="text-neutral-600" />
                              <span className="text-sm text-neutral-500 hover:text-white">Mark</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        {problem.tags && problem.tags.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {problem.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {problem.tags.length > 2 && (
                              <span className="text-xs text-neutral-500">+{problem.tags.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
                          <Link
                            to={`/problem/${problem.id}`}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded transition text-sm"
                          >
                            View <ChevronRight size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteProblem(problem.id)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded transition text-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between mt-6 px-6 py-4 bg-neutral-900 border border-neutral-800 rounded-lg"
            >
              <p className="text-sm text-neutral-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProblems.length)} of {filteredProblems.length} problems
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const diff = Math.abs(page - currentPage);
                      return diff === 0 || diff === 1 || page === 1 || page === totalPages;
                    })
                    .map((page, idx, arr) => (
                      <div key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-neutral-600">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white'
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
          </div>
        )}
      </div>

      {/* Add Problem Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Problem</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-neutral-800 rounded transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Question Number *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 1"
                      value={newProblem.questionNumber}
                      onChange={e => setNewProblem({ ...newProblem, questionNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Difficulty *
                    </label>
                    <select
                      value={newProblem.difficulty}
                      onChange={e => setNewProblem({ ...newProblem, difficulty: e.target.value as Difficulty })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Two Sum"
                    value={newProblem.title}
                    onChange={e => setNewProblem({ ...newProblem, title: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    placeholder="Problem description..."
                    value={newProblem.description}
                    onChange={e => setNewProblem({ ...newProblem, description: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Constraints</label>
                  <textarea
                    placeholder="e.g., 1 <= n <= 10^5, constraints..."
                    value={newProblem.constraints}
                    onChange={e => setNewProblem({ ...newProblem, constraints: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-16 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Example</label>
                  <textarea
                    placeholder="Example input/output..."
                    value={newProblem.example}
                    onChange={e => setNewProblem({ ...newProblem, example: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Platform</label>
                    <select
                      value={newProblem.platform}
                      onChange={e => setNewProblem({ ...newProblem, platform: e.target.value as Platform })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="LeetCode">LeetCode</option>
                      <option value="CodeChef">CodeChef</option>
                      <option value="GeeksforGeeks">GeeksforGeeks</option>
                      <option value="HackerRank">HackerRank</option>
                      <option value="Codeforces">Codeforces</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Solved Date</label>
                    <input
                      type="date"
                      value={newProblem.solvedDate}
                      onChange={e => setNewProblem({ ...newProblem, solvedDate: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Problem Link</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newProblem.link}
                    onChange={e => setNewProblem({ ...newProblem, link: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g., Array, Hash Table, String (comma-separated)"
                    value={newProblem.tags}
                    onChange={e => setNewProblem({ ...newProblem, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Notes & Learning</label>
                  <textarea
                    placeholder="Write what you learned, mistakes you made, key insights, etc."
                    value={newProblem.notes}
                    onChange={e => setNewProblem({ ...newProblem, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleAddProblem}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition font-medium"
                  >
                    Add Problem
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
