import apiClient from './client';

export async function fetchRecentActivity(limit = 10) {
  const response = await apiClient.get('/activity', {
    params: { limit },
  });

  return response.data;
}