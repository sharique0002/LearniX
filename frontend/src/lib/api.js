import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

// API client for main backend
export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// AI service client
export const aiApi = axios.create({
    baseURL: AI_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add access token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const { data } = await api.post('/auth/refresh');
                localStorage.setItem('accessToken', data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: () => api.post('/auth/refresh'),
    me: () => api.get('/auth/me'),
};

// Courses API
export const coursesApi = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    getBySlug: (slug) => api.get(`/courses/slug/${slug}`),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    getMyCourses: () => api.get('/courses/my/courses'),
};

// Enrollment API
export const enrollmentApi = {
    enroll: (courseId) => api.post(`/enrollments/${courseId}`),
    getAll: () => api.get('/enrollments'),
    getProgress: (courseId) => api.get(`/enrollments/progress/${courseId}`),
    markComplete: (lessonId) => api.post(`/enrollments/progress/lessons/${lessonId}/complete`),
    updateProgress: (lessonId, data) => api.put(`/enrollments/progress/lessons/${lessonId}`, data),
};

// Gamification API
export const gamificationApi = {
    getStats: () => api.get('/gamification/stats'),
    getBadges: () => api.get('/gamification/badges'),
    getLeaderboard: (period) => api.get('/gamification/leaderboard', { params: { period } }),
};

// AI Chat API
export const chatApi = {
    startSession: (userId, data) => aiApi.post(`/chat/sessions/${userId}/start`, data),
    sendMessage: (sessionId, userId, query) => aiApi.post(`/chat/sessions/${sessionId}/message/${userId}`, { query }),
    getHistory: (sessionId) => aiApi.get(`/chat/sessions/${sessionId}/history`),
    addContext: (sessionId, data) => aiApi.post(`/chat/sessions/${sessionId}/context`, data),
};

// Recommendations API
export const recommendationsApi = {
    getCourses: (userId) => aiApi.get(`/recommendations/courses/${userId}`),
};
