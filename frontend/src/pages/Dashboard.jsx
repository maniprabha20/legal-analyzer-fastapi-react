import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3">
        <Navbar.Brand>AI Legal Document Analyzer</Navbar.Brand>

        <Button
          variant="outline-light"
          onClick={handleLogout}
          className="ms-auto"
        >
          Logout
        </Button>
      </Navbar>

      <Container className="mt-4">
        <h3>Dashboard</h3>
        <p>Document list and upload will go here (Day 31).</p>
      </Container>
    </>
  );
}

export default Dashboard;