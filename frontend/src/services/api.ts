import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        return api(originalRequest);
      } catch (refreshError) {
        // Handle token refresh failure (e.g., redirect to login)
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
