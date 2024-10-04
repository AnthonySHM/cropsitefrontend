import { auth } from './stores/auth';
import { get } from 'svelte/store';

const BASE_URL = 'http://localhost:3000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { token } = get(auth);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || `API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => fetchWithAuth(endpoint),
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getComments: (cropId: string, tab: string) => fetchWithAuth(`/comments/${cropId}/${tab}`),
  addComment: (cropId: string, tab: string, content: string) => fetchWithAuth('/comments', {
    method: 'POST',
    body: JSON.stringify({ cropId, tab, content }),
  }),
  // Add other methods (PUT, DELETE, etc.) as needed
};