export const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getMediaUrl = (value?: string | null) => {
  if (!value) return '';

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_ORIGIN}${value.startsWith('/') ? value : `/${value}`}`;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = sessionStorage.getItem('sacrms_token');
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return payload as T;
}
