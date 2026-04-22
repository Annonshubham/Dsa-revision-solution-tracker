import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { getStorageStats, getBackupHistory, createBackup } from '../lib/robustStorage';
import { Database, Download, RefreshCw, HardDrive, Shield, Check } from 'lucide-react';

interface StorageStats {
  totalProblems: number;
  totalSolutions: number;
  totalBackups: number;
  lastBackup: string | null;
  dataSize: number;
  metadata: any;
}

export default function DataManagement() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [backupHistory, setBackupHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, backups] = await Promise.all([
        getStorageStats(),
        getBackupHistory(),
      ]);
      setStats(statsData);
      setBackupHistory(backups);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true);
      await createBackup();
      alert('✅ Backup created successfully!');
      await loadData();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup. Please try again.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-emerald-500" />
            <h1 className="text-4xl font-bold text-white">Data Management</h1>
          </div>
          <p className="text-neutral-400">View your data storage and backup information</p>
        </motion.div>

        {/* Storage Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Problems */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-400 text-sm">Total Problems</p>
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalProblems || 0}</p>
            <p className="text-neutral-500 text-xs mt-2">Data securely stored</p>
          </motion.div>

          {/* Total Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-400 text-sm">Solutions</p>
              <Check className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalSolutions || 0}</p>
            <p className="text-neutral-500 text-xs mt-2">Multiple solutions tracked</p>
          </motion.div>

          {/* Data Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-400 text-sm">Data Size</p>
              <HardDrive className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-white">{formatBytes(stats?.dataSize || 0)}</p>
            <p className="text-neutral-500 text-xs mt-2">Optimized storage</p>
          </motion.div>

          {/* Total Backups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-neutral-400 text-sm">Backups</p>
              <Download className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalBackups || 0}</p>
            <p className="text-neutral-500 text-xs mt-2">Automatic backups enabled</p>
          </motion.div>
        </div>

        {/* Backup Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-500" />
            Backup Actions
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {creatingBackup ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Create Backup Now
                </>
              )}
            </button>

            <div className="flex-1 bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <p className="text-sm text-neutral-400">
                <span className="font-semibold text-neutral-300">Last Backup: </span>
                {formatDate(stats?.lastBackup)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Your data is automatically backed up after each change. Manual backups available anytime.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Storage Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* IndexedDB Storage */}
          <div className="bg-neutral-900 border border-emerald-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-white">IndexedDB Storage</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Large storage capacity (50MB+)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Won't be cleared by browser cache
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Structured data format
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Multi-tab support
              </li>
            </ul>
          </div>

          {/* Automatic Backups */}
          <div className="bg-neutral-900 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white">Automatic Backups</h3>
            </div>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                Auto-backup after every change
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                LocalStorage fallback backup
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                Data integrity verification
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-500" />
                Version history tracking
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Backup History */}
        {backupHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Recent Backups</h2>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {backupHistory.slice(0, 10).map((backup, index) => (
                <div key={backup.id} className="flex items-center justify-between bg-neutral-800 rounded-lg p-4 border border-neutral-700 hover:border-neutral-600 transition">
                  <div className="flex-1">
                    <p className="text-white font-medium">Backup #{backupHistory.length - index}</p>
                    <p className="text-sm text-neutral-400 flex items-center gap-2">
                      <span>{formatDate(backup.timestamp)}</span>
                      <span>•</span>
                      <span>{backup.problemsCount} problems</span>
                      <span>•</span>
                      <span>{formatBytes(backup.size)}</span>
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400 font-medium">
                    {backup.type === 'auto' ? 'Auto' : 'Manual'}
                  </div>
                </div>
              ))}
            </div>

            {backupHistory.length === 0 && (
              <p className="text-neutral-400 text-center py-8">No backups yet. They will appear here automatically.</p>
            )}
          </motion.div>
        )}

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-white mb-2">🔒 Your Data is Protected</h3>
              <p className="text-sm text-neutral-300">
                Your DSA problems, solutions, and notes are stored securely using IndexedDB with automatic backups. 
                Unlike simple web apps, your data won't be easily erased and is backed up multiple times. 
                Think of it like Netflix keeping your watch history - your progress is always safe and persistent.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
