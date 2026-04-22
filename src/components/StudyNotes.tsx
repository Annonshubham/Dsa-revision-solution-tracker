import { useEffect, useState } from 'react';
import { StudyNote } from '../lib/studyNotes';
import { loadStudyNotes, addStudyNote, updateStudyNote, deleteStudyNote, togglePinNote } from '../lib/studyNotes';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, X, Save, BookOpen, Pin, PinOff, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const CATEGORIES = ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Greedy', 'Design', 'Other'] as const;
const PRIORITY_LEVELS = ['Low', 'Medium', 'High'] as const;

const categoryColors: Record<string, string> = {
  Arrays: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  Strings: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Trees: 'bg-green-500/10 text-green-400 border-green-500/30',
  Graphs: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  DP: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  Greedy: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  Design: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  Other: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30',
};

const priorityColors: Record<string, string> = {
  Low: 'bg-blue-500/10 text-blue-400',
  Medium: 'bg-yellow-500/10 text-yellow-400',
  High: 'bg-red-500/10 text-red-400',
};

const priorityBorderColors: Record<string, string> = {
  Low: 'border-l-4 border-l-blue-400',
  Medium: 'border-l-4 border-l-yellow-400',
  High: 'border-l-4 border-l-red-400',
};

const getReadingTime = (text: string): number => {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export default function StudyNotes() {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'Arrays' as typeof CATEGORIES[number],
    priority: 'Medium' as typeof PRIORITY_LEVELS[number],
    tags: [] as string[],
    tagInput: '',
    isPinned: false,
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    setLoading(true);
    const data = loadStudyNotes();
    // Sort: pinned first, then by priority (High -> Medium -> Low), then by date
    const sorted = data.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1;
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    setNotes(sorted);
    setLoading(false);
  };

  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    addStudyNote({
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      priority: newNote.priority,
      tags: newNote.tags,
      isPinned: newNote.isPinned,
    });

    setNewNote({ 
      title: '', 
      content: '', 
      category: 'Arrays', 
      priority: 'Medium',
      tags: [],
      tagInput: '',
      isPinned: false,
    });
    setIsAddingNote(false);
    loadNotes();
  };

  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setNewNote({ 
        title: note.title, 
        content: note.content, 
        category: note.category,
        priority: note.priority,
        tags: note.tags,
        tagInput: '',
        isPinned: note.isPinned,
      });
      setEditingId(id);
    }
  };

  const handleSaveEdit = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    updateStudyNote(editingId!, {
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      priority: newNote.priority,
      tags: newNote.tags,
      isPinned: newNote.isPinned,
    });

    setNewNote({ 
      title: '', 
      content: '', 
      category: 'Arrays',
      priority: 'Medium',
      tags: [],
      tagInput: '',
      isPinned: false,
    });
    setEditingId(null);
    loadNotes();
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteStudyNote(id);
      loadNotes();
    }
  };

  const handleTogglePin = (id: string) => {
    togglePinNote(id);
    loadNotes();
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || note.category === filterCategory;
    const matchesPriority = filterPriority === 'All' || note.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-emerald-500" />
              <div>
                <h1 className="text-4xl font-bold text-white">📚 Study Notes</h1>
                <p className="text-neutral-400">Prepare for placements with organized study material</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAddingNote(true);
                setEditingId(null);
                setNewNote({ 
                  title: '', 
                  content: '', 
                  category: 'Arrays' as typeof CATEGORIES[number],
                  priority: 'Medium' as typeof PRIORITY_LEVELS[number],
                  tags: [],
                  tagInput: '',
                  isPinned: false,
                });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
            >
              <Plus size={20} /> Add Note
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Search notes, tags..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_LEVELS.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Add/Edit Note Form */}
        <AnimatePresence>
          {(isAddingNote || editingId) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {editingId ? '✏️ Edit Note' : '📝 New Note'}
                </h2>
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setEditingId(null);
                    setNewNote({ 
                      title: '', 
                      content: '', 
                      category: 'Arrays' as typeof CATEGORIES[number],
                      priority: 'Medium' as typeof PRIORITY_LEVELS[number],
                      tags: [],
                      tagInput: '',
                      isPinned: false,
                    });
                  }}
                  className="p-2 hover:bg-neutral-800 rounded transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="e.g., Two Pointer Technique"
                    value={newNote.title}
                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Category *</label>
                    <select
                      value={newNote.category}
                      onChange={e => setNewNote({ ...newNote, category: e.target.value as typeof CATEGORIES[number] })}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Priority</label>
                    <select
                      value={newNote.priority}
                      onChange={e => setNewNote({ ...newNote, priority: e.target.value as typeof PRIORITY_LEVELS[number] })}
                      className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      {PRIORITY_LEVELS.map(pri => (
                        <option key={pri} value={pri}>{pri}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setNewNote({ ...newNote, isPinned: !newNote.isPinned })}
                      className={`w-full px-4 py-2 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
                        newNote.isPinned
                          ? 'bg-emerald-600 text-white'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                      }`}
                    >
                      {newNote.isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                      {newNote.isPinned ? 'Pinned' : 'Pin'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g., important, interview, tips"
                      value={newNote.tagInput}
                      onChange={e => setNewNote({ ...newNote, tagInput: e.target.value })}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && newNote.tagInput.trim()) {
                          e.preventDefault();
                          const tag = newNote.tagInput.trim();
                          if (!newNote.tags.includes(tag)) {
                            setNewNote({ 
                              ...newNote, 
                              tags: [...newNote.tags, tag],
                              tagInput: '' 
                            });
                          } else {
                            setNewNote({ ...newNote, tagInput: '' });
                          }
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const tag = newNote.tagInput.trim();
                        if (tag && !newNote.tags.includes(tag)) {
                          setNewNote({ 
                            ...newNote, 
                            tags: [...newNote.tags, tag],
                            tagInput: '' 
                          });
                        }
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {newNote.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newNote.tags.map(tag => (
                        <div
                          key={tag}
                          className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm flex items-center gap-2"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setNewNote({ 
                              ...newNote, 
                              tags: newNote.tags.filter(t => t !== tag) 
                            })}
                            className="hover:text-emerald-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Content * (Markdown supported)</label>
                  <textarea
                    placeholder="Write your study notes with markdown formatting (e.g., **bold**, *italic*, `code`, ## heading)"
                    value={newNote.content}
                    onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-48 resize-none font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    💡 Tip: Use markdown formatting for better presentation (headings, lists, code blocks, etc.)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={editingId ? handleSaveEdit : handleAddNote}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
                  >
                    <Save size={20} />
                    {editingId ? 'Update Note' : 'Save Note'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingNote(false);
                      setEditingId(null);
                      setNewNote({ 
                        title: '', 
                        content: '', 
                        category: 'Arrays',
                        priority: 'Medium',
                        tags: [],
                        tagInput: '',
                        isPinned: false,
                      });
                    }}
                    className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen size={48} className="mx-auto text-neutral-600 mb-4" />
            <p className="text-neutral-400 text-lg mb-4">
              {notes.length === 0
                ? 'No study notes yet. Start by creating your first one!'
                : 'No notes match your search.'}
            </p>
            {notes.length === 0 && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
              >
                <Plus size={20} /> Create First Note
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition group relative ${priorityBorderColors[note.priority]}`}
                >
                  {/* Pinned indicator */}
                  {note.isPinned && (
                    <div className="absolute top-4 right-4 text-yellow-400">
                      <Pin size={18} />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="mb-3 flex flex-wrap gap-2 items-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[note.category]}`}>
                      {note.category}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${priorityColors[note.priority]}`}>
                      {note.priority} Priority
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-3 pr-6 line-clamp-2">{note.title}</h3>

                  {/* Content Preview with markdown rendering */}
                  <div className="text-neutral-400 text-sm mb-4 line-clamp-4 prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => <p className="line-clamp-2" {...props} />,
                        h1: ({ node, ...props }) => <h1 className="text-lg font-bold" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-base font-bold" {...props} />,
                        h3: ({ node, ...props }) => <h3 className="text-sm font-bold" {...props} />,
                        code: ({ node, ...props }) => <code className="bg-neutral-800 px-2 py-1 rounded text-xs" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc list-inside" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal list-inside" {...props} />,
                      }}
                    >
                      {note.content.substring(0, 150)}...
                    </ReactMarkdown>
                  </div>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {note.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded-full text-xs">
                          +{note.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex justify-between items-center text-xs text-neutral-600 mb-4">
                    <span>{note.content.split(/\s+/).length} words • {getReadingTime(note.content)} min read</span>
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setViewingId(note.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded transition text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`flex items-center justify-center px-3 py-2 rounded transition text-sm font-medium ${
                        note.isPinned
                          ? 'bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white'
                          : 'bg-neutral-700/20 hover:bg-neutral-600 text-neutral-400 hover:text-white'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      {note.isPinned ? <Pin size={16} /> : <PinOff size={16} />}
                    </button>
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded transition text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded transition text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Stats */}
        {notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 bg-neutral-900 border border-neutral-800 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">📊 Study Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center border-l-4 border-l-emerald-400">
                <p className="text-2xl font-bold text-emerald-400">{notes.length}</p>
                <p className="text-sm text-neutral-500">Total Notes</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center border-l-4 border-l-red-400">
                <p className="text-2xl font-bold text-red-400">{notes.filter(n => n.priority === 'High').length}</p>
                <p className="text-sm text-neutral-500">High Priority</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center border-l-4 border-l-yellow-400">
                <p className="text-2xl font-bold text-yellow-400">{notes.filter(n => n.isPinned).length}</p>
                <p className="text-sm text-neutral-500">Pinned</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center border-l-4 border-l-blue-400">
                <p className="text-2xl font-bold text-blue-400">{Math.ceil(notes.reduce((sum, n) => sum + getReadingTime(n.content), 0) / notes.length)}</p>
                <p className="text-sm text-neutral-500">Avg Read Time</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center border-l-4 border-l-purple-400">
                <p className="text-2xl font-bold text-purple-400">{new Set(notes.flatMap(n => n.tags)).size}</p>
                <p className="text-sm text-neutral-500">Unique Tags</p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIES.map(cat => {
                const count = notes.filter(n => n.category === cat).length;
                return count > 0 ? (
                  <div key={cat} className={`rounded-lg p-3 text-center border ${categoryColors[cat]}`}>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs">{cat}</p>
                  </div>
                ) : null;
              })}
            </div>
          </motion.div>
        )}

        {/* Note Detail View Modal */}
        <AnimatePresence>
          {viewingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setViewingId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                {notes.find(n => n.id === viewingId) && (() => {
                  const note = notes.find(n => n.id === viewingId)!;
                  return (
                    <>
                      <div className="bg-neutral-800/50 border-b border-neutral-700 p-6 sticky top-0 z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h2 className="text-3xl font-bold text-white mb-3">{note.title}</h2>
                            <div className="flex flex-wrap gap-3 items-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[note.category]}`}>
                                {note.category}
                              </span>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${priorityColors[note.priority]}`}>
                                {note.priority} Priority
                              </span>
                              {note.isPinned && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs">
                                  <Pin size={14} /> Pinned
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => setViewingId(null)}
                            className="p-2 hover:bg-neutral-700 rounded transition"
                          >
                            <X size={24} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                          <span>{note.content.split(/\s+/).length} words</span>
                          <span>{getReadingTime(note.content)} min read</span>
                          <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Tags */}
                        {note.tags.length > 0 && (
                          <div className="mb-6 flex flex-wrap gap-2">
                            {note.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-sm hover:bg-neutral-700 transition"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Content with full markdown rendering */}
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-white" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 text-white" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-4 text-neutral-300 leading-relaxed" {...props} />,
                              code: ({ node, inline, ...props }) => 
                                inline ? (
                                  <code className="bg-neutral-800 px-2 py-1 rounded text-sm text-emerald-400 font-mono" {...props} />
                                ) : (
                                  <code className="block bg-neutral-800 p-4 rounded-lg mb-4 text-sm text-emerald-400 font-mono overflow-x-auto" {...props} />
                                ),
                              pre: ({ node, ...props }) => <pre className="bg-neutral-800 p-4 rounded-lg mb-4 overflow-x-auto" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 text-neutral-300" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-neutral-300" {...props} />,
                              li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                              blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-emerald-500 pl-4 italic text-neutral-400 my-4" {...props} />,
                              a: ({ node, ...props }) => <a className="text-emerald-400 hover:text-emerald-300 underline" {...props} />,
                            }}
                          >
                            {note.content}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800 p-6 flex gap-3 sticky bottom-0 bg-neutral-900">
                        <button
                          onClick={() => {
                            handleEditNote(note.id);
                            setViewingId(null);
                            setIsAddingNote(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
                        >
                          <Edit2 size={20} />
                          Edit Note
                        </button>
                        <button
                          onClick={() => setViewingId(null)}
                          className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition font-semibold"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
