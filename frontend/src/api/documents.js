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