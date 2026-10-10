import { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { fetchRecentActivity } from '../api/activity';

const ACTION_META = {
  document_uploaded: { icon: '📤', verb: 'Uploaded' },
  analysis_completed: { icon: '🧠', verb: 'AI analysis completed for' },
  chat_question_asked: { icon: '💬', verb: 'Asked a question about' },
  report_downloaded: { icon: '📥', verb: 'Downloaded report for' },
  document_deleted: { icon: '🗑️', verb: 'Deleted' },
};

function timeAgo(iso) {
  const hasZone = /[zZ]$|[+-]\d\d:\d\d$/.test(iso);
  const then = new Date(hasZone ? iso : `${iso}Z`);
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
}

function documentLabel(item) {
  if (item.document_filename) return item.document_filename;
  return item.action === 'document_deleted'
    ? 'a document'
    : 'a deleted document';
}

function RecentActivity({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchRecentActivity(10);

        if (!cancelled) {
          setItems(data);
          setError(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="mt-5">
      <div className="section-heading">Recent Activity</div>

      <div className="section-subheading">
        Your latest actions across all documents
      </div>

      <div className="surface-card activity-card">
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" />
          </div>
        ) : error ? (
          <p
            className="text-muted text-center my-3"
            style={{ fontSize: '0.85rem' }}
          >
            Could not load recent activity.
          </p>
        ) : items.length === 0 ? (
          <p
            className="text-muted text-center my-3"
            style={{ fontSize: '0.85rem' }}
          >
            No activity yet. Uploads, analyses, questions, and downloads will
            appear here.
          </p>
        ) : (
          items.map((item) => {
            const meta = ACTION_META[item.action] || {
              icon: '•',
              verb: item.action,
            };

            return (
              <div className="activity-item" key={item.id}>
                <div className="activity-icon">{meta.icon}</div>

                <div className="activity-text">
                  {meta.verb}{' '}
                  <strong>{documentLabel(item)}</strong>
                </div>

                <div className="activity-time">
                  {timeAgo(item.created_at)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;