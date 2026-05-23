import axios from 'axios';
import { Assignment, ApiResponse, AssignmentFormData } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const assignmentApi = {
  getAll: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Assignment[]>> => {
    const { data } = await api.get('/assignments', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Assignment>> => {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
  },

  create: async (formData: AssignmentFormData): Promise<ApiResponse<{ assignmentId: string; jobId?: string; status: string }>> => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('subject', formData.subject);
    fd.append('className', formData.className);
    fd.append('dueDate', formData.dueDate);
    fd.append('questionTypes', JSON.stringify(formData.questionTypes));
    fd.append('additionalInstructions', formData.additionalInstructions || '');
    if (formData.file) {
      fd.append('file', formData.file);
    }

    const { data } = await api.post('/assignments', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await api.delete(`/assignments/${id}`);
    return data;
  },

  regenerate: async (id: string): Promise<ApiResponse<{ assignmentId: string; status: string }>> => {
    const { data } = await api.post(`/assignments/${id}/regenerate`);
    return data;
  },

  getStatus: async (id: string): Promise<ApiResponse<{ status: string; errorMessage?: string }>> => {
    const { data } = await api.get(`/assignments/${id}/status`);
    return data;
  },
};

export default api;
