import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage(
      'If an account exists with this email, password reset instructions will be sent.'
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-brand">
          <span className="brand-icon">⚖️</span>
          <h1>Forgot Password?</h1>
          <p>Enter your email to reset your password</p>
        </div>

        {message && (
          <Alert variant="success" className="py-2">
            {message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
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

          <Button
            type="submit"
            className="btn-primary-modern w-100"
          >
            Send Reset Link
          </Button>
        </Form>

        <div className="auth-footer-link">
          Remember your password?{' '}
          <Link to="/login">Back to Login</Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;