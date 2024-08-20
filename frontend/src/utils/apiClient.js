import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const server = import.meta.env.VITE_SERVER;

// Create an instance of Axios
const apiClient = axios.create({
  baseURL: server,
  withCredentials: true,
});

// Response interceptor to handle 401 errors
apiClient.interceptors.response.use((response) => {
  return response;
}, async (error) => {
  const originalRequest = error.config;
  if (error?.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const refreshResponse = await apiClient.post(`${server}/login/refresh-token`);
      if (refreshResponse.data.success) {
        return apiClient(originalRequest);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (refreshError) {
      toast.error('Session expired. Please log in again.');
      const navigate = useNavigate();
      navigate('/login');
    }
  }
  if (error?.response?.status === 403) {
    const navigate = useNavigate();
    navigate('/login');
  }
  return Promise.reject(error);
});

export default apiClient;
