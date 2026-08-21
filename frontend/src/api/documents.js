import apiClient from './client';

export async function fetchDocuments(limit = 20, offset = 0) {
  const response = await apiClient.get('/documents', {
    params: { limit, offset },
  });

  return response.data;
}

export async function deleteDocument(documentId) {
  await apiClient.delete(`/documents/${documentId}`);
}

export async function fetchDocumentStatus(documentId) {
  const response = await apiClient.get(`/documents/${documentId}/status`);
  return response.data;
}

export async function fetchDocument(documentId) {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
}

export function getDownloadUrl(documentId) {
  return `${apiClient.defaults.baseURL}/documents/${documentId}/download`;
}

export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });

  return response.data;
}

export async function analyzeDocument(documentId) {
  const response = await apiClient.post(
    `/documents/${documentId}/analyze`
  );

  return response.data;
}

export async function fetchReports(documentId) {
  const response = await apiClient.get(
    `/documents/${documentId}/reports`
  );

  return response.data;
}