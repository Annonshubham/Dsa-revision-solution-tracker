import { useEffect, useState } from 'react';
import { loadProblems } from '../lib/robustStorage';
import { Problem } from '../types';
import { motion } from 'motion/react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, CheckCircle2, Target } from 'lucide-react';

export default function Statistics() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadProblems();
        setProblems(data);
      } catch (error) {
        console.error('Error loading problems:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate statistics
  const totalProblems = problems.length;
  const solvedProblems = problems.filter(p => p.solvedDate).length;
  const easyCount = problems.filter(p => p.difficulty === 'Easy').length;
  const mediumCount = problems.filter(p => p.difficulty === 'Medium').length;
  const hardCount = problems.filter(p => p.difficulty === 'Hard').length;

  // Breakdown by difficulty
  const difficultyData = [
    { name: 'Easy', value: easyCount, color: '#4ade80' },
    { name: 'Medium', value: mediumCount, color: '#facc15' },
    { name: 'Hard', value: hardCount, color: '#f87171' },
  ].filter(item => item.value > 0);

  // Daily progress
  const dailyData: { [key: string]: number } = {};
  problems.forEach(problem => {
    if (problem.solvedDate) {
      const date = new Date(problem.solvedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      dailyData[date] = (dailyData[date] || 0) + 1;
    }
  });

  const chartData = Object.entries(dailyData)
    .map(([date, count]) => ({
      date,
      problems: count,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30); // Last 30 days

  // Platform breakdown
  const platformData: { [key: string]: number } = {};
  problems.forEach(problem => {
    const platform = problem.platform || 'Other';
    platformData[platform] = (platformData[platform] || 0) + 1;
  });

  const platformBreakdown = Object.entries(platformData).map(([platform, count]) => ({
    platform,
    count,
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Statistics & Progress</h1>
        <p className="text-neutral-400">Track your DSA learning journey</p>
      </motion.div>

      {/* Top Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        {/* Total Problems */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neutral-400 font-medium">Total Problems</h3>
            <Target size={24} className="text-emerald-500" />
          </div>
          <p className="text-4xl font-bold">{totalProblems}</p>
          <p className="text-sm text-neutral-500 mt-2">in your library</p>
        </motion.div>

        {/* Solved Problems */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neutral-400 font-medium">Solved</h3>
            <CheckCircle2 size={24} className="text-green-500" />
          </div>
          <p className="text-4xl font-bold">{solvedProblems}</p>
          <p className="text-sm text-neutral-500 mt-2">
            {totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0}% completion
          </p>
        </motion.div>

        {/* Easy Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neutral-400 font-medium">Easy</h3>
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p className="text-4xl font-bold">{easyCount}</p>
          <p className="text-sm text-neutral-500 mt-2">problems</p>
        </motion.div>

        {/* Medium & Hard Count */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-neutral-400 font-medium">Medium + Hard</h3>
            <TrendingUp size={24} className="text-orange-500" />
          </div>
          <p className="text-4xl font-bold">{mediumCount + hardCount}</p>
          <p className="text-sm text-neutral-500 mt-2">
            {mediumCount} Medium, {hardCount} Hard
          </p>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Difficulty Pie Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>Difficulty Distribution</span>
          </h2>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-500">
              No problems yet
            </div>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Problems by Platform</h2>
          {platformBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={platformBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="platform" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-500">
              No data available
            </div>
          )}
        </div>
      </motion.div>

      {/* Daily Progress Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Calendar size={24} />
          <span>Daily Progress (Last 30 Days)</span>
        </h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
                formatter={(value) => `${value} problem(s)`}
              />
              <Line
                type="monotone"
                dataKey="problems"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-neutral-500">
            No solved problems yet. Mark problems as solved to see your progress!
          </div>
        )}
      </motion.div>

      {/* Statistics Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-6"
      >
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="space-y-2 text-neutral-400">
          <p>
            📊 You have {totalProblems} problems in your library with {solvedProblems} marked as solved.
          </p>
          <p>
            🎯 Difficulty breakdown: <span className="text-green-400">{easyCount} Easy</span>,{' '}
            <span className="text-yellow-400">{mediumCount} Medium</span>,{' '}
            <span className="text-red-400">{hardCount} Hard</span>
          </p>
          <p>
            📚 Problems from {platformBreakdown.length} different platform{platformBreakdown.length !== 1 ? 's' : ''}.
          </p>
          <p>
            {solvedProblems === 0
              ? '✨ Start solving problems and marking them as done to track your progress!'
              : `✨ Great progress! Keep up the momentum and continue learning!`}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
