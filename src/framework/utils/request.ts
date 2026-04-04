import axios from 'axios';
import { getToken, getLocale } from './get-token';
import pickBy from 'lodash/pickBy';
import { SearchParamOptions } from '@/types/index'
import toast from 'react-hot-toast';





const request = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT, // TODO: take this api URL from env
  timeout: 300000000,
  headers: {
    "Accept": 'application/json',
    'Content-Type': 'application/json',
  },
});

// Change request data/error here
request.interceptors.request.use(
  (config) => {
    const token = getToken();
    const locale = getLocale()
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); // Fetch CSRF token from meta tag

    //@ts-ignore
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token ? token : ''}`,
      'Accept-Language': `${locale ? locale : 'en'}`,
      'X-CSRF-TOKEN': csrfToken, // Add CSRF token here

    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response error handler
request.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const resp = error?.response;
      const data = resp?.data;

      let message: string =
        (typeof data?.message === 'string' && data.message) ||
        (typeof error?.message === 'string' && error.message) ||
        `Request failed${resp?.status ? ` (${resp.status})` : ''}`;

      // Laravel-like validation errors: { errors: { field: [msg, ...] } }
      if (data?.errors && typeof data.errors === 'object') {
        const firstFieldErrors = Object.values<any>(data.errors).find(
          (arr: any) => Array.isArray(arr) && arr.length > 0
        ) as string[] | undefined;
        if (firstFieldErrors && firstFieldErrors[0]) {
          message = firstFieldErrors[0];
        }
      }

      // Normalize the error message so feature hooks can toast it once
      if (message) {
        error.message = message;
        if (error?.response?.data && typeof error.response.data === 'object') {
          (error.response.data as any).message = message;
        }
      }
    } catch {
      // Best-effort normalization
      error.message = error?.message || 'An unexpected error occurred';
    }

    return Promise.reject(error);
  }
);

export class HttpClient {
  static async get<T>(url: string, params?: unknown) {
    const response = await request.get<T>(url, { params });

    return response.data;
  }

  static async post<T>(url: string, data?: unknown, options?: any) {

    const response = await request.post<T>(url, data, options);
    return response;
  }

  static async put<T>(url: string, data: unknown) {
    const response = await request.put<T>(url, data);
    return response.data;
  }
  static async patch<T>(url: string, data: unknown, options?: any) {
    const response = await request.patch<T>(url, data, options);
    return response.data;
  }

  static async delete<T>(url: string) {
    const response = await request.delete<T>(url);
    return response.data;
  }

  static stringifySearchQuery(values: any) {
    const parsedValues = pickBy(values);
    return Object.keys(parsedValues)
      .map((k) => {
        if (k === 'type') {
          return `${k}.slug:${parsedValues[k]};`;
        }
        if (k === 'category') {
          return `categories.slug:${parsedValues[k]};`;
        }
        if (k === 'tags') {
          return `tags.slug:${parsedValues[k]};`;
        }
        if (k === 'variations') {
          return `variations.value:${parsedValues[k]};`;
        }
        return `${k}:${parsedValues[k]};`;
      })
      .join('')
      .slice(0, -1);
  }

  static formatSearchParams(params: Partial<SearchParamOptions>) {
    return Object.entries(params)
      .filter(([, value]) => Boolean(value))
      .map(([k, v]) =>
        ['type', 'categories', 'tags', 'author', 'manufacturer'].includes(k)
          ? `${k}.slug:${v}`
          : `${k}:${v}`
      )
      .join(';');
  }
}


export default request;
