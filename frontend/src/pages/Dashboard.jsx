import { useState, useEffect } from 'react';
import { Container, Navbar, Button, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchDocuments, deleteDocument } from '../api/documents';

const STATUS_VARIANTS = {
  uploaded: 'secondary',
  processing: 'warning',
  ready: 'success',
  failed: 'danger',
};

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      setError('');
    } catch (err) {
      setError('Could not load documents. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);
  useEffect(() => {
  const hasProcessingDocs = documents.some(
    (doc) => doc.status === 'uploaded' || doc.status === 'processing'
  );

  if (!hasProcessingDocs) return;

  const intervalId = setInterval(() => {
    loadDocuments();
  }, 4000);

  return () => clearInterval(intervalId);
}, [documents]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleDelete = async (documentId, filename) => {
    const confirmed = window.confirm(`Delete "${filename}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (err) {
      alert('Failed to delete document. Please try again.');
    }
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3">
        <Navbar.Brand>AI Legal Document Analyzer</Navbar.Brand>
        <Button variant="outline-light" onClick={handleLogout} className="ms-auto">
          Logout
        </Button>
      </Navbar>

      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Your Documents</h3>
          <Button variant="primary">+ Upload Document</Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" />
          </div>
        ) : documents.length === 0 ? (
          <Alert variant="light" className="text-center border">
            No documents yet. Upload your first legal document to get started.
          </Alert>
        ) : (
          <Table hover responsive>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.filename}</td>
                  <td>
                    <Badge bg={STATUS_VARIANTS[doc.status] || 'secondary'}>
                      {doc.status}
                    </Badge>
                  </td>
                  <td>{new Date(doc.upload_date).toLocaleDateString()}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(doc.id, doc.filename)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
}

export default Dashboard;