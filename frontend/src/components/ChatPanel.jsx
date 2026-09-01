import { useState, useEffect, useRef } from 'react';
import { Form, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import { askQuestion, fetchChatHistory } from '../api/documents';

function ChatPanel({ documentId, documentStatus, onJumpToPage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await fetchChatHistory(documentId);
        const formatted = history.map((m) => ({
          role: m.role,
          content: m.content,
          pagesReferenced: [],
        }));
        setMessages(formatted);
      } catch (err) {
        // No history yet is not an error state
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [documentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setError('');
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question, pagesReferenced: [] }]);
    setSending(true);

    try {
      const result = await askQuestion(documentId, question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          pagesReferenced: result.pages_referenced || [],
        },
      ]);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to get an answer. Please try again.';
      setError(detail);
    } finally {
      setSending(false);
    }
  };

  if (documentStatus !== 'ready') {
    return (
      <Alert variant="secondary">
        Document must finish processing before you can chat with it.
      </Alert>
    );
  }

  return (
    <div className="d-flex flex-column" style={{ height: '480px' }}>
      <div className="flex-grow-1 overflow-auto mb-2 p-2 border rounded bg-light">
        {loadingHistory ? (
          <div className="text-center mt-3">
            <Spinner animation="border" size="sm" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-muted text-center mt-3">
            Ask a question about this document to get started.
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-2 d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-2 rounded ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border'
                }`}
                style={{ maxWidth: '85%' }}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.pagesReferenced.length > 0 && (
                  <div className="mt-1">
                    {msg.pagesReferenced.map((page) => (
                      <Badge
                        key={page}
                        bg="light"
                        text="dark"
                        className="border me-1"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onJumpToPage(page)}
                      >
                        Page {page}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="d-flex justify-content-start mb-2">
            <div className="p-2 rounded bg-white border">
              <Spinner animation="border" size="sm" className="me-2" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && <Alert variant="danger" className="py-2">{error}</Alert>}

      <Form onSubmit={handleSend} className="d-flex gap-2">
        <Form.Control
          type="text"
          placeholder="Ask a question about this document..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          Send
        </Button>
      </Form>
    </div>
  );
}

export default ChatPanel;