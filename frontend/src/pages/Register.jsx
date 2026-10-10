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
      const detail =
        err.response?.data?.detail ||
        'Registration failed. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-page-light"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box',
        background: '#EAF6FB',
      }}
    >
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <span
            className="brand-icon"
            style={{
              background: '#0EA5A8',
              color: '#FFFFFF',
            }}
          >
            ⚖️
          </span>

          <h1
            style={{
              color: '#163E49',
            }}
          >
            Create Your Account
          </h1>

          <p
            style={{
              color: '#526A73',
            }}
          >
            Start analyzing legal documents with AI
          </p>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label
              className="form-label-modern"
              style={{
                color: '#163E49',
              }}
            >
              Email
            </Form.Label>

            <Form.Control
              className="form-control-modern"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                color: '#163E49',
                borderColor: '#D5E5EA',
              }}
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-2">
            <Form.Label
              className="form-label-modern"
              style={{
                color: '#163E49',
              }}
            >
              Password
            </Form.Label>

            <Form.Control
              className="form-control-modern"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              style={{
                color: '#163E49',
                borderColor: '#D5E5EA',
              }}
            />
          </Form.Group>

          {/* Password hint */}
          <p
            className="mb-4"
            style={{
              fontSize: '0.76rem',
              color: '#526A73',
            }}
          >
            Use 8+ characters. Avoid reusing passwords from other sites.
          </p>

          {/* Register button */}
          <Button
            type="submit"
            className="btn-primary-modern w-100"
            disabled={loading}
            style={{
              background: '#0EA5A8',
              borderColor: '#0EA5A8',
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>

        </Form>

        {/* Login link */}
        <div
          className="auth-footer-link"
          style={{
            color: '#526A73',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#0EA5A8',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Register;