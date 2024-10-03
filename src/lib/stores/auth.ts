import { writable } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';

interface AuthStore {
  token: string | null;
  user: any | null;
}

function createAuthStore() {
  const { subscribe, set } = writable<AuthStore>({
    token: null,
    user: null,
  });

  return {
    subscribe,
    setToken: (token: string) => {
      localStorage.setItem('token', token);
      const user = jwtDecode(token);
      set({ token, user });
    },
    clearToken: () => {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    },
    init: () => {
      const token = localStorage.getItem('token');
      if (token) {
        const user = jwtDecode(token);
        set({ token, user });
      }
    },
  };
}

export const auth = createAuthStore();
