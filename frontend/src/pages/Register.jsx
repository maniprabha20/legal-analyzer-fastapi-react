import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
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
      await apiClient.post('/auth/register', {
        email,
        password
      });

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
    <Container className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}>

      <Card style={{ width: '400px' }} className="p-4 shadow-sm">

        <Card.Body>

          <h3 className="text-center mb-4">
            Create Account
          </h3>


          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}


          <Form onSubmit={handleSubmit}>

            <Form.Group className="mb-3">

              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />

            </Form.Group>


            <Form.Group className="mb-4">

              <Form.Label>Password</Form.Label>

              <Form.Control
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                minLength={8}
              />

            </Form.Group>


            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </Button>


          </Form>


          <div className="text-center mt-3">

            Already have an account?{' '}

            <Link to="/login">
              Log in
            </Link>

          </div>


        </Card.Body>

      </Card>

    </Container>
  );
}


export default Register;