import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import {
  Container,
  Navbar,
  Button,
  Spinner,
  Alert,
  Badge,
  Tabs,
  Tab,
} from 'react-bootstrap';

import ChatPanel from '../components/ChatPanel';
import { Document, Page, pdfjs } from 'react-pdf';
import { fetchDocument } from '../api/documents';
import apiClient from '../api/client';
import AnalysisPanel from '../components/AnalysisPanel';
import AppFooter from '../components/AppFooter';

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
      {/* =====================================================
    NAVBAR
    ===================================================== */}
<Navbar
  className="px-3"
  variant="dark"
  style={{
    background: '#163E49',
  }}
>
  <Navbar.Brand
    as={Link}
    to="/dashboard"
    className="text-decoration-none"
    style={{
      color: '#FFFFFF',
      fontWeight: '700',
    }}
  >
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
      }}
    >
      <span
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0EA5A8',
          color: '#FFFFFF',
          fontSize: '1.1rem',
        }}
      >
        ⚖️
      </span>

      <span
        style={{
          color: '#FFFFFF',
          fontWeight: '700',
          fontSize: '0.98rem',
          lineHeight: '1.2',
        }}
      >
        AI Legal Document Analyzer
      </span>
    </span>
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

        {/* Back to Dashboard */}
        <Button
          variant="link"
          className="ps-0 mb-2"
          onClick={() => navigate('/dashboard')}
          style={{
            color: '#0EA5A8',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          &larr; Back to Dashboard
        </Button>

        {/* Loading */}
        {loading && (
          <div className="text-center mt-5">
            <Spinner
              animation="border"
              style={{
                color: '#0EA5A8',
              }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {!loading && document && (
          <>
            {/* =================================================
                DOCUMENT HEADER
                ================================================= */}
            <div className="detail-header">
              <h4
                style={{
                  color: '#163E49',
                }}
              >
                {document.filename}
              </h4>

              <Badge
                bg={STATUS_VARIANTS[document.status] || 'secondary'}
              >
                {document.status}
              </Badge>
            </div>

            {/* =================================================
                PDF VIEWER
                ================================================= */}
            <div className="mb-4">
              {pdfBlobUrl && (
                <div
                  className="border rounded p-3 text-center"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#D5E5EA',
                    boxShadow:
                      '0 4px 14px rgba(22, 62, 73, 0.08)',
                  }}
                >
                  <Document
                    file={pdfBlobUrl}
                    onLoadSuccess={handlePdfLoadSuccess}
                    onLoadError={handlePdfLoadError}
                    loading={
                      <Spinner
                        animation="border"
                        size="sm"
                        style={{
                          color: '#0EA5A8',
                        }}
                      />
                    }
                  >
                    {/* Center PDF Page */}
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={1100}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  </Document>

                  {/* =================================================
                      PDF PAGE NAVIGATION
                      ================================================= */}
                  {numPages > 0 && (
                    <div
                      className="d-flex justify-content-center align-items-center gap-3 mt-3"
                      style={{
                        color: '#526A73',
                      }}
                    >
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={handlePrevious}
                        disabled={pageNumber <= 1}
                        style={{
                          borderColor: '#D5E5EA',
                          color: '#163E49',
                        }}
                      >
                        Previous
                      </Button>

                      <span>
                        Page{' '}
                        <strong
                          style={{
                            color: '#0EA5A8',
                          }}
                        >
                          {pageNumber}
                        </strong>{' '}
                        of{' '}
                        <strong
                          style={{
                            color: '#163E49',
                          }}
                        >
                          {numPages}
                        </strong>
                      </span>

                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={handleNext}
                        disabled={pageNumber >= numPages}
                        style={{
                          borderColor: '#D5E5EA',
                          color: '#163E49',
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                ANALYSIS + CHAT
                ================================================= */}
            <Tabs
              defaultActiveKey="analysis"
              className="mb-3"
            >
              <Tab
                eventKey="analysis"
                title="Analysis"
              >
                <AnalysisPanel
                  documentId={documentId}
                  documentStatus={document?.status}
                  onJumpToPage={goToPage}
                />
              </Tab>

              <Tab
                eventKey="chat"
                title="Chat"
              >
                <ChatPanel
                  documentId={documentId}
                  documentStatus={document?.status}
                  onJumpToPage={goToPage}
                />
              </Tab>
            </Tabs>
          </>
        )}
      </Container>

      <AppFooter />
    </>
  );
}

export default DocumentDetail;