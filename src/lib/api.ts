import { auth } from './stores/auth';

const BASE_URL = 'https://cropsitebackend-1.onrender.com';

async function request(endpoint: string, options: RequestInit = {}) {
  let token: string | null = null;
  auth.subscribe(state => {
    token = state.token;
  })();

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
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }

  return response.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: unknown) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  async getComments() {
    return request('/admin/comments');
  },

  async deleteComment(commentId: string) {
    return request(`/admin/comments/${commentId}`, { method: 'DELETE' });
  },
};