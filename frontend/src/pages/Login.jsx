import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import apiClient from '../api/client';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      localStorage.setItem('access_token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Login failed. Please check your credentials.';

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
          <h1>AI Legal Document Analyzer</h1>
          <p>Sign in to analyze contracts with AI</p>
        </div>

        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label className="form-label-modern">
              Email
            </Form.Label>

            <Form.Control
              className="form-control-modern"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="mb-4">
            <Form.Label className="form-label-modern">
              Password
            </Form.Label>

            <div style={{ position: 'relative' }}>

              <Form.Control
                className="form-control-modern"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '50px' }}
              />

              {/* Eye / Eye-off button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? 'Hide password' : 'Show password'
                }
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  /* Eye open */
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  /* Eye with slash */
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.5 10.5 0 0 1 12 4c7 0 10 8 10 8a17.8 17.8 0 0 1-3.1 4.4" />
                    <path d="M6.6 6.6C3.8 8.4 2 12 2 12s3.5 8 10 8a9.7 9.7 0 0 0 4.1-.9" />
                  </svg>
                )}
              </button>

            </div>
          </Form.Group>
          <div
  style={{
    textAlign: 'right',
    marginTop: '-15px',
    marginBottom: '20px',
  }}
>
  <Link
    to="/forgot-password"
    style={{
      fontSize: '0.85rem',
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '500',
    }}
  >
    Forgot Password?
  </Link>
</div>

          {/* Login button */}
          <Button
            type="submit"
            className="btn-primary-modern w-100"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Log In'}
          </Button>

        </Form>

        {/* Register link */}
        <div className="auth-footer-link">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;