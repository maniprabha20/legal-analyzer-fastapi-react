import { useState, useEffect } from 'react';
import { Button, Spinner, Alert, Badge, Accordion, ListGroup } from 'react-bootstrap';
import { analyzeDocument, fetchReports } from '../api/documents';

const RISK_VARIANTS = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

function PageBadge({ page, onJumpToPage }) {
  return (
    <Badge
      bg="light"
      text="dark"
      className="border ms-2"
      style={{ cursor: 'pointer' }}
      onClick={() => onJumpToPage(page)}
    >
      Page {page}
    </Badge>
  );
}

function AnalysisPanel({ documentId, documentStatus, onJumpToPage }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadExistingReport() {
      try {
        const reports = await fetchReports(documentId);
        if (reports.length > 0) {
          setAnalysis(reports[0].result); // newest first, per backend ordering
        }
      } catch (err) {
        // No existing reports is not an error state - just means none run yet
      } finally {
        setLoading(false);
      }
    }

    loadExistingReport();
  }, [documentId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');

    try {
      const report = await analyzeDocument(documentId);
      setAnalysis(report.result);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Analysis failed. Please try again.';
      setError(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  if (documentStatus !== 'ready') {
    return (
      <Alert variant="secondary">
        Document must finish processing before it can be analyzed.
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <div className="text-center p-3">
        <p className="text-muted">No analysis has been run yet.</p>
        <Button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </div>
    );
  }

  return (
    <div>
      <Alert variant="warning" className="py-2 px-3 small">
        {analysis.disclaimer}
      </Alert>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">Analysis</h6>
        <Button size="sm" variant="outline-primary" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Re-analyzing...' : 'Re-analyze'}
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <p className="mb-3">{analysis.summary}</p>

      <Accordion defaultActiveKey="risks" alwaysOpen>
        <Accordion.Item eventKey="risks">
          <Accordion.Header>Risks ({analysis.risks.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.risks.length === 0 ? (
              <p className="text-muted mb-0">No specific risks identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.risks.map((risk, i) => (
                  <ListGroup.Item key={i}>
                    <Badge bg={RISK_VARIANTS[risk.risk_level] || 'secondary'} className="me-2">
                      {risk.risk_level}
                    </Badge>
                    {risk.description}
                    <PageBadge page={risk.page_number} onJumpToPage={onJumpToPage} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="clauses">
          <Accordion.Header>Key Clauses ({analysis.key_clauses.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.key_clauses.length === 0 ? (
              <p className="text-muted mb-0">No key clauses identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.key_clauses.map((clause, i) => (
                  <ListGroup.Item key={i}>
                    <strong>{clause.title}</strong>
                    <PageBadge page={clause.page_number} onJumpToPage={onJumpToPage} />
                    <div className="text-muted small mt-1">{clause.summary}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="dates">
          <Accordion.Header>Key Dates ({analysis.key_dates.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.key_dates.length === 0 ? (
              <p className="text-muted mb-0">No key dates identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.key_dates.map((item, i) => (
                  <ListGroup.Item key={i}>
                    <strong>{item.date_or_deadline}</strong> &mdash; {item.description}
                    <PageBadge page={item.page_number} onJumpToPage={onJumpToPage} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="payments">
          <Accordion.Header>Payment Terms ({analysis.payment_terms.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.payment_terms.length === 0 ? (
              <p className="text-muted mb-0">No payment terms identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.payment_terms.map((item, i) => (
                  <ListGroup.Item key={i}>
                    <strong>{item.amount_or_terms}</strong> &mdash; {item.description}
                    <PageBadge page={item.page_number} onJumpToPage={onJumpToPage} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="obligations">
          <Accordion.Header>Obligations ({analysis.obligations.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.obligations.length === 0 ? (
              <p className="text-muted mb-0">No obligations identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.obligations.map((item, i) => (
                  <ListGroup.Item key={i}>
                    <strong>{item.party}:</strong> {item.description}
                    <PageBadge page={item.page_number} onJumpToPage={onJumpToPage} />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="recommendations">
          <Accordion.Header>Recommendations ({analysis.recommendations.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.recommendations.length === 0 ? (
              <p className="text-muted mb-0">No recommendations.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.recommendations.map((rec, i) => (
                  <ListGroup.Item key={i}>{rec}</ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default AnalysisPanel;