import AsyncStorage from '@react-native-async-storage/async-storage';
//import { Platform } from 'react-native';

// Environment Mode: 'LOCAL' | 'PRODUCTION' | 'CUSTOM_DOMAIN'
export type EnvironmentMode = 'LOCAL' | 'PRODUCTION' | 'CUSTOM_DOMAIN';

export const ENV_MODE: EnvironmentMode = 'PRODUCTION';

export const LOCAL_API_URL = 'http://localhost:3000';
export const PROD_API_URL = 'https://themakeuplabbuxar.vercel.app';
export const CUSTOM_DOMAIN_API_URL = 'https://themakeuplabbuxar.com';
export const PARLOUR_KEY = '234678';

export function getApiBaseUrl(mode: EnvironmentMode = ENV_MODE): string {
  // If running in production release build (APK), default to production backend
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    return mode === 'CUSTOM_DOMAIN' ? CUSTOM_DOMAIN_API_URL : PROD_API_URL;
  }

  switch (mode) {
    case 'CUSTOM_DOMAIN':
      return CUSTOM_DOMAIN_API_URL;
    case 'PRODUCTION':
      return PROD_API_URL;
    case 'LOCAL':
    default:
      return LOCAL_API_URL;
  }
}

export let API_BASE_URL = getApiBaseUrl(ENV_MODE);

export function setApiBaseUrl(newUrl: string) {
  if (newUrl) {
    API_BASE_URL = newUrl.replace(/\/$/, '');
  }
}

import { getValidAuthToken, clearAuthToken } from '../utils/token';

let onUnauthorizedListener: (() => void) | null = null;

export function setOnUnauthorizedListener(listener: (() => void) | null) {
  onUnauthorizedListener = listener;
}

export async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getValidAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const authHeaders = await getAuthHeader();

  // Attach parlour_key to query string so CORS preflight on older deployments never blocks it
  const separator = endpoint.includes('?') ? '&' : '?';
  const fullUrl = `${API_BASE_URL}${endpoint}${separator}parlour_key=${encodeURIComponent(PARLOUR_KEY)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-parlour-key': PARLOUR_KEY,
    ...authHeaders,
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      const errorData = await response.json().catch(() => ({}));
      // Purge expired token automatically
      await clearAuthToken();
      if (onUnauthorizedListener) {
        onUnauthorizedListener();
      }
      return { success: false, message: errorData.message || 'Unauthorized / Session expired' };
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.warn(`Local request failed on ${endpoint}:`, err?.message || err);

    // If local request failed, attempt automatic fallback to production
    if (API_BASE_URL === LOCAL_API_URL) {
      try {
        const fallbackUrl = `${PROD_API_URL}${endpoint}${separator}parlour_key=${encodeURIComponent(PARLOUR_KEY)}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          headers,
        });

        if (fallbackRes.status === 401) {
          const errorData = await fallbackRes.json().catch(() => ({}));
          return { success: false, message: errorData.message || 'Unauthorized / Session expired' };
        }

        const fallbackData = await fallbackRes.json();
        return fallbackData;
      } catch (fallbackErr: any) {
        console.error(`Fallback error on ${endpoint}:`, fallbackErr);
      }
    }

    return { success: false, message: err.message || 'Network request failed. Please check internet connection.' };
  }
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Service Types / Categories
  getServiceTypes: () => apiRequest('/api/service-types'),

  createServiceType: (data: { name: string }) =>
    apiRequest('/api/service-types', { method: 'POST', body: JSON.stringify(data) }),

  updateServiceType: (id: string, data: { name: string }) =>
    apiRequest(`/api/service-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteServiceType: (id: string) => apiRequest(`/api/service-types/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => apiRequest('/api/services'),

  createService: (data: any) => apiRequest('/api/services', { method: 'POST', body: JSON.stringify(data) }),

  updateService: (id: string, data: any) =>
    apiRequest(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteService: (id: string) => apiRequest(`/api/services/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (search?: string) =>
    apiRequest(`/api/appointments${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  updateAppointmentStatus: (id: string, status: string) =>
    apiRequest(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  deleteAppointment: (id: string) => apiRequest(`/api/appointments/${id}`, { method: 'DELETE' }),

  // Testimonials
  getTestimonials: () => apiRequest('/api/testimonials'),

  createTestimonial: (data: any) => apiRequest('/api/testimonials', { method: 'POST', body: JSON.stringify(data) }),

  updateTestimonial: (id: string, data: any) =>
    apiRequest(`/api/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTestimonial: (id: string) => apiRequest(`/api/testimonials/${id}`, { method: 'DELETE' }),

  // Staff / Employees
  getEmployees: () => apiRequest('/api/employees'),

  createEmployee: (data: any) => apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(data) }),

  updateEmployee: (id: string, data: any) =>
    apiRequest(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteEmployee: (id: string) => apiRequest(`/api/employees/${id}`, { method: 'DELETE' }),

  // Coupons
  getCoupons: () => apiRequest('/api/coupons?all=true'),

  createCoupon: (data: any) => apiRequest('/api/coupons', { method: 'POST', body: JSON.stringify(data) }),

  updateCoupon: (id: string, data: any) =>
    apiRequest(`/api/coupons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCoupon: (id: string) => apiRequest(`/api/coupons/${id}`, { method: 'DELETE' }),

  // Customer Coupons (ADMIN ONLY)
  getCustomerCoupons: (phone?: string) =>
    apiRequest(`/api/customer-coupons${phone ? `?phone=${encodeURIComponent(phone)}` : ''}`),

  assignCustomerCoupon: (data: any) =>
    apiRequest('/api/customer-coupons', { method: 'POST', body: JSON.stringify(data) }),

  deleteCustomerCoupon: (id: string) => apiRequest(`/api/customer-coupons/${id}`, { method: 'DELETE' }),

  // Gallery
  getParlourImages: () => apiRequest('/api/parlour-images'),

  createParlourImage: (data: any) => apiRequest('/api/parlour-images', { method: 'POST', body: JSON.stringify(data) }),

  deleteParlourImage: (id: string) => apiRequest(`/api/parlour-images/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => apiRequest('/api/settings'),

  updateSettings: (data: any) => apiRequest('/api/settings', { method: 'POST', body: JSON.stringify(data) }),

  // Upload Image to Cloudinary
  uploadImage: (image: string) => apiRequest('/api/upload', { method: 'POST', body: JSON.stringify({ image }) }),

  // Seed
  seedDatabase: () => apiRequest('/api/seed', { method: 'POST' }),
};
