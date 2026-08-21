import { useState, useEffect } from 'react';
import {
  Button,
  Spinner,
  Alert,
  Badge,
  Accordion,
  ListGroup,
} from 'react-bootstrap';

import { analyzeDocument, fetchReports } from '../api/documents';
import apiClient from '../api/client';

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
  const [currentReportId, setCurrentReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Load existing analysis report
  useEffect(() => {
    async function loadExistingReport() {
      try {
        const reports = await fetchReports(documentId);

        if (reports.length > 0) {
          setCurrentReportId(reports[0].id);
          setAnalysis(reports[0].result);
        }
      } catch (err) {
        // No existing report is okay
      } finally {
        setLoading(false);
      }
    }

    loadExistingReport();
  }, [documentId]);

  // Run / Re-run AI analysis
  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError('');

    try {
      const report = await analyzeDocument(documentId);

      setCurrentReportId(report.id);
      setAnalysis(report.result);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Analysis failed. Please try again.';

      setError(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  // Download PDF report
  const handleDownload = async () => {
    try {
      if (!currentReportId) {
        setError('No analysis report available for download.');
        return;
      }

      const response = await apiClient.get(
        `/reports/${currentReportId}/download`,
        {
          responseType: 'blob',
        }
      );

      const url = URL.createObjectURL(response.data);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'analysis-report.pdf';

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Failed to download PDF report.';

      setError(detail);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" size="sm" />
      </div>
    );
  }

  // Document processing state
  if (documentStatus !== 'ready') {
    return (
      <Alert variant="secondary">
        Document must finish processing before it can be analyzed.
      </Alert>
    );
  }

  // No analysis available
  if (!analysis) {
    return (
      <div className="text-center p-3">
        <p className="text-muted">
          No analysis has been run yet.
        </p>

        <Button
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div>

      {/* Disclaimer */}
      <Alert
        variant="warning"
        className="py-2 px-3 small"
      >
        {analysis.disclaimer}
      </Alert>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">

        <h6 className="mb-0">
          Analysis
        </h6>

        <div>

          {/* Download PDF */}
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={handleDownload}
            disabled={!currentReportId}
            className="me-2"
          >
            Download PDF
          </Button>

          {/* Re-analyze */}
          <Button
            size="sm"
            variant="outline-primary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing
              ? 'Re-analyzing...'
              : 'Re-analyze'}
          </Button>

        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Summary */}
      <p className="mb-3">
        {analysis.summary}
      </p>

      <Accordion
        defaultActiveKey="risks"
        alwaysOpen
      >

        {/* RISKS */}
        <Accordion.Item eventKey="risks">

          <Accordion.Header>
            Risks ({analysis.risks.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.risks.length === 0 ? (

              <p className="text-muted mb-0">
                No specific risks identified.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.risks.map((risk, i) => (

                  <ListGroup.Item key={i}>

                    <Badge
                      bg={
                        RISK_VARIANTS[risk.risk_level] ||
                        'secondary'
                      }
                      className="me-2"
                    >
                      {risk.risk_level}
                    </Badge>

                    {risk.description}

                    <PageBadge
                      page={risk.page_number}
                      onJumpToPage={onJumpToPage}
                    />

                  </ListGroup.Item>

                ))}

              </ListGroup>

            )}

          </Accordion.Body>

        </Accordion.Item>


        {/* KEY CLAUSES */}
        <Accordion.Item eventKey="clauses">

          <Accordion.Header>
            Key Clauses ({analysis.key_clauses.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.key_clauses.length === 0 ? (

              <p className="text-muted mb-0">
                No key clauses identified.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.key_clauses.map((clause, i) => (

                  <ListGroup.Item key={i}>

                    <strong>
                      {clause.title}
                    </strong>

                    <PageBadge
                      page={clause.page_number}
                      onJumpToPage={onJumpToPage}
                    />

                    <div className="text-muted small mt-1">
                      {clause.summary}
                    </div>

                  </ListGroup.Item>

                ))}

              </ListGroup>

            )}

          </Accordion.Body>

        </Accordion.Item>


        {/* KEY DATES */}
        <Accordion.Item eventKey="dates">

          <Accordion.Header>
            Key Dates ({analysis.key_dates.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.key_dates.length === 0 ? (

              <p className="text-muted mb-0">
                No key dates identified.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.key_dates.map((item, i) => (

                  <ListGroup.Item key={i}>

                    <strong>
                      {item.date_or_deadline}
                    </strong>

                    &mdash; {item.description}

                    <PageBadge
                      page={item.page_number}
                      onJumpToPage={onJumpToPage}
                    />

                  </ListGroup.Item>

                ))}

              </ListGroup>

            )}

          </Accordion.Body>

        </Accordion.Item>


        {/* PAYMENT TERMS */}
        <Accordion.Item eventKey="payments">

          <Accordion.Header>
            Payment Terms ({analysis.payment_terms.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.payment_terms.length === 0 ? (

              <p className="text-muted mb-0">
                No payment terms identified.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.payment_terms.map((item, i) => (

                  <ListGroup.Item key={i}>

                    <strong>
                      {item.amount_or_terms}
                    </strong>

                    &mdash; {item.description}

                    <PageBadge
                      page={item.page_number}
                      onJumpToPage={onJumpToPage}
                    />

                  </ListGroup.Item>

                ))}

              </ListGroup>

            )}

          </Accordion.Body>

        </Accordion.Item>


        {/* OBLIGATIONS */}
        <Accordion.Item eventKey="obligations">

          <Accordion.Header>
            Obligations ({analysis.obligations.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.obligations.length === 0 ? (

              <p className="text-muted mb-0">
                No obligations identified.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.obligations.map((item, i) => (

                  <ListGroup.Item key={i}>

                    <strong>
                      {item.party}:
                    </strong>{' '}

                    {item.description}

                    <PageBadge
                      page={item.page_number}
                      onJumpToPage={onJumpToPage}
                    />

                  </ListGroup.Item>

                ))}

              </ListGroup>

            )}

          </Accordion.Body>

        </Accordion.Item>


        {/* RECOMMENDATIONS */}
        <Accordion.Item eventKey="recommendations">

          <Accordion.Header>
            Recommendations ({analysis.recommendations.length})
          </Accordion.Header>

          <Accordion.Body>

            {analysis.recommendations.length === 0 ? (

              <p className="text-muted mb-0">
                No recommendations.
              </p>

            ) : (

              <ListGroup variant="flush">

                {analysis.recommendations.map((rec, i) => (

                  <ListGroup.Item key={i}>
                    {rec}
                  </ListGroup.Item>

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