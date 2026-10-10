import { useState, useEffect } from 'react';
import {
  Container,
  Navbar,
  Button,
  Table,
  Spinner,
  Alert,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDocuments, deleteDocument } from '../api/documents';
import UploadModal from '../components/UploadModal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastProvider';
import Brand from '../components/Brand';
import {
  FeatureCardsSection,
  HowItWorksSection,
} from '../components/FeatureSections';

const STATUS_LABELS = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};

function StatusBadge({ status }) {
  return (
    <span className={`badge-status badge-status-${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Auto-refresh while anything is still processing
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

  // Client-side filtering only
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const readyCount = documents.filter(
    (d) => d.status === 'ready'
  ).length;

  const inProgressCount = documents.filter(
    (d) =>
      d.status === 'uploaded' ||
      d.status === 'processing'
  ).length;

  const failedCount = documents.filter(
    (d) => d.status === 'failed'
  ).length;

  return (
    <>
      {/* =====================================================
          NAVBAR
          ===================================================== */}
      <Navbar
        className="app-navbar"
        variant="dark"
        style={{
          background: '#163E49',
        }}
      >
        <Container fluid className="px-0">
          <Navbar.Brand
            as={Link}
            to="/dashboard"
          >
            <Brand />
          </Navbar.Brand>

          <div className="ms-auto d-flex gap-2">
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              Profile
            </Button>

            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* =====================================================
          MAIN DASHBOARD
          ===================================================== */}
      <Container className="mt-4 mb-5">

        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h3
              style={{
                color: '#163E49',
              }}
            >
              Your Documents
            </h3>

            <div
              className="subtitle"
              style={{
                color: '#526A73',
              }}
            >
              Upload, analyze, and chat with your legal documents
            </div>
          </div>

          <Button
            className="btn-primary-modern"
            onClick={() => setShowUploadModal(true)}
            style={{
              background: '#0EA5A8',
              borderColor: '#0EA5A8',
            }}
          >
            + Upload Document
          </Button>
        </div>

        {/* =====================================================
            STATS
            ===================================================== */}
        {!loading && documents.length > 0 && (
          <div className="stat-row">

            <div
              className="stat-pill"
              style={{
                borderColor: '#D5E5EA',
              }}
            >
              <div
                className="stat-value"
                style={{
                  color: '#163E49',
                }}
              >
                {documents.length}
              </div>

              <div
                className="stat-label"
                style={{
                  color: '#526A73',
                }}
              >
                Total Documents
              </div>
            </div>

            <div
              className="stat-pill"
              style={{
                borderColor: '#D5E5EA',
              }}
            >
              <div
                className="stat-value"
                style={{
                  color: '#0EA5A8',
                }}
              >
                {readyCount}
              </div>

              <div
                className="stat-label"
                style={{
                  color: '#526A73',
                }}
              >
                Ready
              </div>
            </div>

            <div
              className="stat-pill"
              style={{
                borderColor: '#D5E5EA',
              }}
            >
              <div
                className="stat-value"
                style={{
                  color: '#D97706',
                }}
              >
                {inProgressCount}
              </div>

              <div
                className="stat-label"
                style={{
                  color: '#526A73',
                }}
              >
                Processing
              </div>
            </div>

            <div
              className="stat-pill"
              style={{
                borderColor: '#D5E5EA',
              }}
            >
              <div
                className="stat-value"
                style={{
                  color: '#DC2626',
                }}
              >
                {failedCount}
              </div>

              <div
                className="stat-label"
                style={{
                  color: '#526A73',
                }}
              >
                Failed
              </div>
            </div>

          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center mt-5">
            <Spinner
              animation="border"
              style={{
                color: '#0EA5A8',
              }}
            />
          </div>

        ) : documents.length === 0 ? (

          /* Empty state */
          <div
            className="empty-state"
            style={{
              borderColor: '#D5E5EA',
              color: '#526A73',
            }}
          >
            <p className="mb-1">
              No documents yet.
            </p>

            <p
              className="mb-0"
              style={{
                fontSize: '0.85rem',
                color: '#526A73',
              }}
            >
              Upload your first legal document to get started.
            </p>
          </div>

        ) : (

          <>
            {/* =================================================
                SEARCH + FILTER
                ================================================= */}
            <div className="toolbar-row">

              <InputGroup
                style={{
                  maxWidth: '320px',
                }}
              >
                <Form.Control
                  className="form-control-modern"
                  placeholder="Search by filename..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  style={{
                    color: '#163E49',
                    borderColor: '#D5E5EA',
                  }}
                />
              </InputGroup>

              <Form.Select
                className="form-control-modern"
                style={{
                  maxWidth: '180px',
                  color: '#163E49',
                  borderColor: '#D5E5EA',
                }}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="all">
                  All statuses
                </option>

                <option value="ready">
                  Ready
                </option>

                <option value="processing">
                  Processing
                </option>

                <option value="uploaded">
                  Uploaded
                </option>

                <option value="failed">
                  Failed
                </option>
              </Form.Select>

            </div>

            {/* =================================================
                NO SEARCH RESULTS
                ================================================= */}
            {filteredDocuments.length === 0 ? (

              <div
                className="empty-state"
                style={{
                  borderColor: '#D5E5EA',
                  color: '#526A73',
                }}
              >
                <p className="mb-0">
                  No documents match your search or filter.
                </p>
              </div>

            ) : (

              /* =================================================
                 DOCUMENT TABLE
                 ================================================= */
              <div
                className="surface-card p-3"
                style={{
                  borderColor: '#D5E5EA',
                }}
              >
                <Table
                  hover
                  responsive
                  className="doc-table mb-0"
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          color: '#526A73',
                        }}
                      >
                        Filename
                      </th>

                      <th
                        style={{
                          color: '#526A73',
                        }}
                      >
                        Status
                      </th>

                      <th
                        style={{
                          color: '#526A73',
                        }}
                      >
                        Uploaded
                      </th>

                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id}>

                        <td
                          onClick={() =>
                            navigate(
                              `/documents/${doc.id}`
                            )
                          }
                          className="doc-filename-link"
                          style={{
                            color: '#163E49',
                          }}
                        >
                          {doc.filename}
                        </td>

                        <td>
                          <StatusBadge
                            status={doc.status}
                          />
                        </td>

                        <td
                          className="text-muted"
                          style={{
                            fontSize: '0.85rem',
                            color: '#526A73',
                          }}
                        >
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
              </div>
            )}
          </>
        )}

        {/* =====================================================
            FEATURE SECTIONS
            ===================================================== */}
        <FeatureCardsSection />
        <HowItWorksSection />

      </Container>

      {/* =====================================================
          UPLOAD MODAL
          ===================================================== */}
      <UploadModal
        show={showUploadModal}
        onClose={() =>
          setShowUploadModal(false)
        }
        onUploadSuccess={loadDocuments}
      />

      {/* =====================================================
          DELETE CONFIRMATION
          ===================================================== */}
      <ConfirmModal
        show={confirmTarget !== null}
        title="Delete Document"
        message={
          confirmTarget
            ? `Delete "${confirmTarget.filename}"? This cannot be undone.`
            : ''
        }
        onConfirm={confirmDelete}
        onCancel={() =>
          setConfirmTarget(null)
        }
      />
    </>
  );
}

export default Dashboard;