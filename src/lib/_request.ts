import { request, AxiosRequestConfig } from 'podverse-helpers';
import { config } from '../config';

export const _request = async <T>(
  url: string,
  requestConfig?: AxiosRequestConfig,
  abort?: {
    controller: AbortController;
    timeoutMs: number;
  }
): Promise<{ status: number; data: T }> => {
  const headers = {
    ...requestConfig?.headers,
    'User-Agent': config.userAgent,
  };
  return request<T>(url, { ...requestConfig, headers }, abort);
};
