import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, BookOpen, FileText, LogOut, User, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { useUser } from '../context/UserContext';
import { logout } from '../lib/localAuth';

export default function NavbarTop() {
  const location = useLocation();
  const { user } = useUser();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-white hover:text-emerald-400 transition">
          📊 DSA Tracker
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive('/')
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Home size={20} />
            <span>Problems</span>
          </Link>

          <Link
            to="/study-notes"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive('/study-notes')
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BookOpen size={20} />
            <span>Study Notes</span>
          </Link>

          <Link
            to="/simple-notes"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive('/simple-notes')
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <FileText size={20} />
            <span>Notes</span>
          </Link>

          <Link
            to="/statistics"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive('/statistics')
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <BarChart3 size={20} />
            <span>Statistics</span>
          </Link>

          <Link
            to="/data-management"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isActive('/data-management')
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Database size={20} />
            <span className="hidden sm:inline">Data</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-6 bg-neutral-700 mx-2" />

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 text-neutral-400">
              <User size={18} />
              <span className="text-sm truncate max-w-[150px]">{user?.displayName || user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </motion.div>
  );
}
