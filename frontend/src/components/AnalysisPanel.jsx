import { useState, useEffect } from 'react';
import { Button, Spinner, Alert, Accordion, ListGroup } from 'react-bootstrap';
import { analyzeDocument, fetchReports } from '../api/documents';
import apiClient from '../api/client';

const RISK_BADGE_CLASS = {
  low: 'badge-status-ready',
  medium: 'badge-status-processing',
  high: 'badge-status-failed',
};

function PageChip({ page, onJumpToPage }) {
  return (
    <span className="page-chip" onClick={() => onJumpToPage(page)}>
      Page {page}
    </span>
  );
}

function RiskOverview({ risks }) {
  const counts = { high: 0, medium: 0, low: 0 };
  risks.forEach((r) => {
    if (counts[r.risk_level] !== undefined) counts[r.risk_level] += 1;
  });

  return (
    <div className="risk-overview">
      <div className="risk-count-card high">
        <div className="count">{counts.high}</div>
        <div className="label">High</div>
      </div>
      <div className="risk-count-card medium">
        <div className="count">{counts.medium}</div>
        <div className="label">Medium</div>
      </div>
      <div className="risk-count-card low">
        <div className="count">{counts.low}</div>
        <div className="label">Low</div>
      </div>
    </div>
  );
}

function AnalysisPanel({ documentId, documentStatus, onJumpToPage }) {
  const [analysis, setAnalysis] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadExistingReport() {
      try {
        const reports = await fetchReports(documentId);
        if (reports.length > 0) {
          setAnalysis(reports[0].result); // newest first, per backend ordering
          setCurrentReportId(reports[0].id);
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
      setCurrentReportId(report.id);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Analysis failed. Please try again.';
      setError(detail);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (!currentReportId) return;
    try {
      const response = await apiClient.get(`/reports/${currentReportId}/download`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analysis-report.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Could not download the report. Please try again.');
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
      <div className="text-center p-4 surface-card">
        <p className="text-muted mb-3">No analysis has been run yet.</p>
        <Button className="btn-primary-modern" onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
        {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
      </div>
    );
  }

  return (
    <div>
      <div className="disclaimer-banner">{analysis.disclaimer}</div>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>Analysis Results</span>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={handleDownload}>
            Download PDF
          </Button>
          <Button size="sm" variant="outline-primary" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Re-analyzing...' : 'Re-analyze'}
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="exec-summary-card">
        <div className="label">Executive Summary</div>
        <p>{analysis.summary}</p>
      </div>

      <RiskOverview risks={analysis.risks} />

      <Accordion defaultActiveKey="risks" alwaysOpen className="modern-accordion">
        <Accordion.Item eventKey="risks">
          <Accordion.Header>Risks ({analysis.risks.length})</Accordion.Header>
          <Accordion.Body>
            {analysis.risks.length === 0 ? (
              <p className="text-muted mb-0">No specific risks identified.</p>
            ) : (
              <ListGroup variant="flush">
                {analysis.risks.map((risk, i) => (
                  <ListGroup.Item key={i} className="px-0">
                    <span className={`badge-status ${RISK_BADGE_CLASS[risk.risk_level] || 'badge-status-uploaded'} me-2`}>
                      {risk.risk_level}
                    </span>
                    {risk.description}
                    <PageChip page={risk.page_number} onJumpToPage={onJumpToPage} />
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
                  <ListGroup.Item key={i} className="px-0">
                    <strong>{clause.title}</strong>
                    <PageChip page={clause.page_number} onJumpToPage={onJumpToPage} />
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                      {clause.summary}
                    </div>
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
                  <ListGroup.Item key={i} className="px-0">
                    <strong>{item.date_or_deadline}</strong> &mdash; {item.description}
                    <PageChip page={item.page_number} onJumpToPage={onJumpToPage} />
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
                  <ListGroup.Item key={i} className="px-0">
                    <strong>{item.amount_or_terms}</strong> &mdash; {item.description}
                    <PageChip page={item.page_number} onJumpToPage={onJumpToPage} />
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
                  <ListGroup.Item key={i} className="px-0">
                    <strong>{item.party}:</strong> {item.description}
                    <PageChip page={item.page_number} onJumpToPage={onJumpToPage} />
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
                  <ListGroup.Item key={i} className="px-0">{rec}</ListGroup.Item>
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