import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import apiClient from '../api/client';

function Login() {

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

      const formData = new URLSearchParams();

      formData.append('username', email);
      formData.append('password', password);


      const response = await apiClient.post(
        '/auth/login',
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );


      localStorage.setItem(
        'access_token',
        response.data.access_token
      );


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

    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >

      <Card
        style={{ width: '400px' }}
        className="p-4 shadow-sm"
      >

        <Card.Body>

          <h3 className="text-center mb-4">
            Log In
          </h3>


          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}


          <Form onSubmit={handleSubmit}>


            <Form.Group className="mb-3">

              <Form.Label>
                Email
              </Form.Label>

              <Form.Control
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />

            </Form.Group>



            <Form.Group className="mb-4">

              <Form.Label>
                Password
              </Form.Label>

              <Form.Control
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />

            </Form.Group>



            <Button
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading}
            >

              {loading ? 'Logging in...' : 'Log In'}

            </Button>


          </Form>



          <div className="text-center mt-3">

            Don't have an account?{' '}

            <Link to="/register">
              Register
            </Link>

          </div>


        </Card.Body>

      </Card>

    </Container>

  );

}


export default Login;