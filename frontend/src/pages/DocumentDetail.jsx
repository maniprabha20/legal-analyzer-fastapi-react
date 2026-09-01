import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import {
  Container,
  Navbar,
  Button,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Tabs,
  Tab,
} from 'react-bootstrap';

import ChatPanel from '../components/ChatPanel';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetchDocument } from '../api/documents';
import apiClient from '../api/client';
import AnalysisPanel from '../components/AnalysisPanel';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const STATUS_VARIANTS = {
  uploaded: 'secondary',
  processing: 'warning',
  ready: 'success',
  failed: 'danger',
};

function DocumentDetail() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let blobUrl = null;

    async function loadDocumentAndFile() {
      try {
        setLoading(true);
        setError('');

        const doc = await fetchDocument(documentId);
        setDocument(doc);

        const response = await apiClient.get(
          `/documents/${documentId}/download`,
          {
            responseType: 'blob',
          }
        );

        blobUrl = URL.createObjectURL(response.data);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.error('DOCUMENT LOAD ERROR:', err);
        setError('Could not load this document.');
      } finally {
        setLoading(false);
      }
    }

    loadDocumentAndFile();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [documentId]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handlePdfLoadSuccess = ({ numPages }) => {
    console.log('PDF loaded. Total pages:', numPages);

    setNumPages(numPages);
    setPageNumber(1);
  };

  const handlePdfLoadError = (err) => {
    console.error('PDF LOAD ERROR:', err);
    setError('Failed to load PDF file.');
  };

  const goToPage = (page) => {
    const targetPage = Number(page);

    if (!Number.isInteger(targetPage)) return;
    if (targetPage < 1) return;
    if (targetPage > numPages) return;

    setPageNumber(targetPage);
  };

  const handlePrevious = () => {
    setPageNumber((currentPage) => {
      if (currentPage <= 1) {
        return 1;
      }

      return currentPage - 1;
    });
  };

  const handleNext = () => {
    setPageNumber((currentPage) => {
      if (currentPage >= numPages) {
        return numPages;
      }

      return currentPage + 1;
    });
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-3">
        <Navbar.Brand
          as={Link}
          to="/dashboard"
          className="text-white text-decoration-none"
        >
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
        <Button
          variant="link"
          className="ps-0 mb-2"
          onClick={() => navigate('/dashboard')}
        >
          &larr; Back to Dashboard
        </Button>

        {loading && (
          <div className="text-center mt-5">
            <Spinner animation="border" />
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && document && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="mb-0">{document.filename}</h4>

              <Badge
                bg={STATUS_VARIANTS[document.status] || 'secondary'}
              >
                {document.status}
              </Badge>
            </div>

            <Row>
              <Col md={7}>
                {pdfBlobUrl && (
                  <div className="border rounded p-2 bg-light text-center">
                    <Document
                      file={pdfBlobUrl}
                      onLoadSuccess={handlePdfLoadSuccess}
                      onLoadError={handlePdfLoadError}
                      loading={
                        <Spinner animation="border" size="sm" />
                      }
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={480}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </Document>

                    {numPages > 0 && (
                      <div className="d-flex justify-content-center align-items-center gap-3 mt-3">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={handlePrevious}
                          disabled={pageNumber <= 1}
                        >
                          Previous
                        </Button>

                        <span>
                          Page <strong>{pageNumber}</strong> of{' '}
                          <strong>{numPages}</strong>
                        </span>

                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={handleNext}
                          disabled={pageNumber >= numPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Col>

              <Col md={5}>
                <Tabs defaultActiveKey="analysis" className="mb-3">
                  <Tab eventKey="analysis" title="Analysis">
                    <AnalysisPanel
                      documentId={documentId}
                      documentStatus={document?.status}
                      onJumpToPage={goToPage}
                    />
                  </Tab>

                  <Tab eventKey="chat" title="Chat">
                    <ChatPanel
                      documentId={documentId}
                      documentStatus={document?.status}
                      onJumpToPage={goToPage}
                    />
                  </Tab>
                </Tabs>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </>
  );
}

export default DocumentDetail;