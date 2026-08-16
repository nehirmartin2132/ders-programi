const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `İstek başarısız oldu (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCourses: () => request('/courses'),
  createCourse: (course) => request('/courses', { method: 'POST', body: JSON.stringify(course) }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
  generateSchedules: (electiveCount) =>
    request('/schedule/generate', { method: 'POST', body: JSON.stringify({ electiveCount }) }),
};
