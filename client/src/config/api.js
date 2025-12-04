// api configuration
export const API_BASE_URL = 'http://localhost:3000';

export const API_ENDPOINTS = {
  login: `${API_BASE_URL}/users/login`,
  signup: `${API_BASE_URL}/users`,
  updateUsername: `${API_BASE_URL}/users/username`,
  plans: `${API_BASE_URL}/plans`,
  plan: (id) => `${API_BASE_URL}/plans/${id}`,
  planName: (id) => `${API_BASE_URL}/plans/${id}/name`,
  majors: `${API_BASE_URL}/majors`,
  majorDetail: (name) => `${API_BASE_URL}/majors/${encodeURIComponent(name)}`,
  aiChat: `${API_BASE_URL}/ai/chat`,
};

