import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Problem, Solution } from './types';
import { loadProblems, addSolution, deleteSolution, initializeSampleData } from './lib/robustStorage';
import { UserProvider, useUser } from './context/UserContext';

// Components
import NavbarTop from './components/NavbarTop';
import ProblemListNew from './components/ProblemListNew';
import ProblemViewer from './components/ProblemViewer';
import Statistics from './components/Statistics';
import DataManagement from './components/DataManagement';
import StudyNotes from './components/StudyNotes';
import SimpleNotes from './components/SimpleNotes';
import Login from './components/Login';
import Signup from './components/Signup';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData().catch(err => console.error('Failed to initialize data:', err));
  }, []);

  const { user } = useUser();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <NavbarTop />
      <Routes>
        <Route path="/" element={<ProtectedRoute><ProblemListNew /></ProtectedRoute>} />
        <Route path="/problem/:id" element={<ProtectedRoute><ProblemDetailWrapper /></ProtectedRoute>} />
        <Route path="/study-notes" element={<ProtectedRoute><StudyNotes /></ProtectedRoute>} />
        <Route path="/simple-notes" element={<ProtectedRoute><SimpleNotes /></ProtectedRoute>} />
        <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
        <Route path="/data-management" element={<ProtectedRoute><DataManagement /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

function ProblemDetailWrapper() {
  const { user } = useUser();
  const { id } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProblem();

    const handleUpdate = (e: any) => {
      if (e.detail?.problemId === id) {
        loadProblem();
      }
    };

    window.addEventListener('solutionAdded', handleUpdate);
    window.addEventListener('solutionDeleted', handleUpdate);

    return () => {
      window.removeEventListener('solutionAdded', handleUpdate);
      window.removeEventListener('solutionDeleted', handleUpdate);
    };
  }, [id]);

  const loadProblem = async () => {
    try {
      const problems = await loadProblems();
      const p = problems.find(prob => prob.id === id);
      setProblem(p || null);
    } catch (error) {
      console.error('Error loading problem:', error);
      setProblem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSolution = async (solution: Omit<Solution, 'id'>) => {
    if (!problem) return;
    try {
      await addSolution(problem.id, solution);
      window.dispatchEvent(new CustomEvent('solutionAdded', { detail: { problemId: problem.id } }));
    } catch (error) {
      console.error('Error adding solution:', error);
    }
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!problem) return;
    if (window.confirm('Are you sure you want to delete this solution?')) {
      try {
        await deleteSolution(problem.id, solutionId);
        window.dispatchEvent(new CustomEvent('solutionDeleted', { detail: { problemId: problem.id, solutionId } }));
      } catch (error) {
        console.error('Error deleting solution:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 text-lg">Problem not found</p>
        </div>
      </div>
    );
  }

  return (
    <ProblemViewer
      problem={problem}
      onAddSolution={handleAddSolution}
      onDeleteSolution={handleDeleteSolution}
    />
  );
}
