import { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Alert,
  ProgressBar,
} from 'react-bootstrap';
import { uploadDocument } from '../api/documents';

const MAX_FILE_SIZE_MB = 20;

function UploadModal({ show, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const resetState = () => {
    setFile(null);
    setError('');
    setUploading(false);
    setProgress(0);
  };

  const handleClose = () => {
    if (uploading) return;

    resetState();
    onClose();
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setError('');

    if (!selected) return;

    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      setFile(null);
      return;
    }

    if (selected.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
      setError(`File too large. Max ${MAX_FILE_SIZE_MB}MB allowed.`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      await uploadDocument(file, (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );

        setProgress(percent);
      });

      resetState();
      onUploadSuccess();
      onClose();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'Upload failed. Please try again.';

      setError(detail);
      setUploading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop={uploading ? 'static' : true}
      keyboard={!uploading}
    >
      <Modal.Header closeButton={!uploading}>
        <Modal.Title>Upload Document</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group>
          <Form.Label>
            Select a PDF file (max {MAX_FILE_SIZE_MB}MB)
          </Form.Label>

          <Form.Control
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </Form.Group>

        {uploading && (
          <div className="mt-3">
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              animated
            />
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UploadModal;