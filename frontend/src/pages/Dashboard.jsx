import { useState, useEffect } from 'react';
import {
  Container,
  Navbar,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { fetchDocuments, deleteDocument } from '../api/documents';
import UploadModal from '../components/UploadModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastProvider';

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const navigate = useNavigate();
  const showToast = useToast();

  const loadDocuments = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data);
      setError('');
    } catch (err) {
      setError(
        'Could not load documents. Please try refreshing the page.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    const hasProcessingDocs = documents.some(
      (doc) =>
        doc.status === 'uploaded' ||
        doc.status === 'processing'
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

  const handleDelete = (documentId, filename) => {
  setConfirmTarget({
    id: documentId,
    filename,
  });
};

const confirmDelete = async () => {
  if (!confirmTarget) return;

  try {
    await deleteDocument(confirmTarget.id);

    setDocuments((prev) =>
      prev.filter((doc) => doc.id !== confirmTarget.id)
    );

    showToast(
      'Document deleted successfully.',
      'success'
    );
  } catch (err) {
    showToast(
      'Failed to delete document. Please try again.',
      'danger'
    );
  } finally {
    setConfirmTarget(null);
  }
};

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3">
        <Navbar.Brand>
          AI Legal Document Analyzer
        </Navbar.Brand>

        <Button
          variant="outline-light"
          onClick={handleLogout}
          className="ms-auto"
        >
          Logout
        </Button>
      </Navbar>

      <Container className="mt-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Your Documents</h3>

          <Button
            variant="primary"
            onClick={() => setShowUploadModal(true)}
          >
            + Upload Document
          </Button>
        </div>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" />
          </div>
        ) : documents.length === 0 ? (
          <Alert
            variant="light"
            className="text-center border"
          >
            No documents yet. Upload your first legal document
            to get started.
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

                  <td
                    onClick={() =>
                      navigate(`/documents/${doc.id}`)
                    }
                    style={{ cursor: 'pointer' }}
                    className="text-primary"
                  >
                    {doc.filename}
                  </td>

                  <td>
                    <Badge
                      bg={
                        STATUS_VARIANTS[doc.status] ||
                        'secondary'
                      }
                    >
                      {doc.status}
                    </Badge>
                  </td>

                  <td>
                    {new Date(
                      doc.upload_date
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() =>
                        handleDelete(
                          doc.id,
                          doc.filename
                        )
                      }
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

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={loadDocuments}
      />
      <ConfirmModal
  show={confirmTarget !== null}
  title="Delete Document"
  message={
    confirmTarget
      ? `Delete "${confirmTarget.filename}"? This cannot be undone.`
      : ''
  }
  onConfirm={confirmDelete}
  onCancel={() => setConfirmTarget(null)}
/>
    </>
  );
}

export default Dashboard;