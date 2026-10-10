import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DocumentDetail from './pages/DocumentDetail';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
        <Route
  path="/documents/:documentId"
  element={
    <ProtectedRoute>
      <DocumentDetail />
    </ProtectedRoute>
  }
/>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
  path="/"
  element={<LandingPage />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;