import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, X, Save, FileText, Clock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { SimpleNote, loadSimpleNotes, addSimpleNote, updateSimpleNote, deleteSimpleNote } from '../lib/userStorage';

export default function SimpleNotes() {
  const { user } = useUser();
  const [notes, setNotes] = useState<SimpleNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    if (!user) return;
    setLoading(true);
    const data = await loadSimpleNotes(user.uid);
    setNotes(data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!user || !newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    const note = await addSimpleNote(user.uid, {
      title: newNote.title,
      content: newNote.content,
    });

    if (note) {
      setNewNote({ title: '', content: '' });
      setIsAddingNote(false);
      loadNotes();
    }
  };

  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setNewNote({ title: note.title, content: note.content });
      setEditingId(id);
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !editingId || !newNote.title.trim() || !newNote.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    await updateSimpleNote(user.uid, editingId, {
      title: newNote.title,
      content: newNote.content,
    });

    setNewNote({ title: '', content: '' });
    setEditingId(null);
    loadNotes();
  };

  const handleDeleteNote = async (id: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this note?')) return;
    await deleteSimpleNote(user.uid, id);
    loadNotes();
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <FileText size={32} className="text-emerald-500" />
              <div>
                <h1 className="text-4xl font-bold text-white">📝 Simple Notes</h1>
                <p className="text-neutral-400">Write your thoughts, ideas, and quick notes</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsAddingNote(true);
                setEditingId(null);
                setNewNote({ title: '', content: '' });
              }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition font-semibold"
            >
              <Plus size={20} /> New Note
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
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
                    setNewNote({ title: '', content: '' });
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
                    placeholder="e.g., Meeting notes, Ideas, Reminders"
                    value={newNote.title}
                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Content *</label>
                  <textarea
                    placeholder="Write your notes here... just like you would in a notebook!"
                    value={newNote.content}
                    onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 h-64 resize-none"
                  />
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
                      setNewNote({ title: '', content: '' });
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

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText size={48} className="mx-auto text-neutral-600 mb-4" />
            <p className="text-neutral-400 text-lg mb-4">
              {notes.length === 0
                ? 'No notes yet. Create your first one!'
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
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition group flex flex-col"
                >
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 flex-shrink-0">
                    {note.title}
                  </h3>

                  {/* Content Preview */}
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-5 leading-relaxed flex-grow">
                    {note.content}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-xs text-neutral-600 mb-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      {new Date(note.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
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
            <h3 className="text-lg font-semibold text-white mb-4">📊 Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{notes.length}</p>
                <p className="text-sm text-neutral-500">Total Notes</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(notes.reduce((sum, n) => sum + n.content.length, 0) / 1000)}K
                </p>
                <p className="text-sm text-neutral-500">Characters</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {notes.reduce((sum, n) => sum + n.content.split(/\s+/).length, 0)}
                </p>
                <p className="text-sm text-neutral-500">Words</p>
              </div>
              <div className="bg-neutral-800/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-pink-400">
                  {new Date(notes[0].updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-neutral-500">Last Updated</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
