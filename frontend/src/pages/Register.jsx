import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import apiClient from '../api/client';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', { email, password });
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-icon">⚖️</span>
          <h1>Create Your Account</h1>
          <p>Start analyzing legal documents with AI</p>
        </div>

        {error && <Alert variant="danger" className="py-2">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="form-label-modern">Email</Form.Label>
            <Form.Control
              className="form-control-modern"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="form-label-modern">Password</Form.Label>
            <Form.Control
              className="form-control-modern"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </Form.Group>
          <p className="text-muted mb-4" style={{ fontSize: '0.76rem' }}>
            Use 8+ characters. Avoid reusing passwords from other sites.
          </p>

          <Button type="submit" className="btn-primary-modern w-100" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </Form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;