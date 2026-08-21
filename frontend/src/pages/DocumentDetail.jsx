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
import { Document, Page } from 'react-pdf';
import { fetchDocument } from '../api/documents';
import apiClient from '../api/client';
import AnalysisPanel from '../components/AnalysisPanel';

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
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocumentAndFile() {
      try {
        const doc = await fetchDocument(documentId);
        setDocument(doc);

        const response = await apiClient.get(
          `/documents/${documentId}/download`,
          {
            responseType: 'blob',
          }
        );

        const blobUrl = URL.createObjectURL(response.data);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        setError('Could not load this document.');
      } finally {
        setLoading(false);
      }
    }

    loadDocumentAndFile();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const goToPage = (page) => {
  const target = Number(page);

  if (!numPages || target < 1 || target > numPages) return;

  setPageNumber(target);
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
                      onLoadSuccess={({ numPages }) =>
                        
                        setNumPages(numPages)
                      }
                      loading={
                        <Spinner animation="border" size="sm" />
                      }
                    >
                      <Page pageNumber={pageNumber} width={480} />
                      <p>DEBUG: pageNumber = {pageNumber}, numPages = {numPages}</p>
                    </Document>

                    {numPages && (
                      <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => goToPage(pageNumber - 1)}
                          disabled={pageNumber <= 1}
                        >
                          Previous
                        </Button>

                        <span>
                          Page {pageNumber} of {numPages}
                        </span>

                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => goToPage(pageNumber + 1)}
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