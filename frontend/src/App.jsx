import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import LessonPlayer from './components/LessonPlayer';
import Analytics from './pages/Analytics';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// A layout wrapper to conditionally render Navbar
function Layout() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {showNavbar && <Navbar />}
      <div className="flex-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/subject/:id" element={<ProtectedRoute><SubjectDetail /></ProtectedRoute>} />
            <Route path="/analytics/:lesson_id" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            
            <Route
              path="/lesson/:id"
              element={
                <ProtectedRoute>
                  <LessonPlayer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ErrorBoundary>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  );
}

export default App;
