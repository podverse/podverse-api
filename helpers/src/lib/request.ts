import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@helpers/config';

export const request = async <T>(
  url: string,
  requestConfig?: AxiosRequestConfig,
  abort?: {
    controller: AbortController
    timeoutMs: number
  }
): Promise<T> => {
  // eslint-disable-next-line no-undef
  let timeoutId: NodeJS.Timeout | undefined;
  if (abort) {
    timeoutId = setTimeout(() => {
      abort.controller.abort();
    }, abort.timeoutMs);
  }
  
  try {
    const response: AxiosResponse<T> = await axios.request<T>({
      url,
      method: 'GET',
      headers: {
        'User-Agent': config?.userAgent,
        ...requestConfig?.headers
      },
      signal: abort?.controller?.signal,
      ...requestConfig
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.error('Request canceled', error.message);
    } else {
      console.error('Error fetching data', error);
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

export const throwRequestError = (error: unknown): never => {
  if (error instanceof Error) {
    const errorWithStatusCode = error as ErrorWithStatusCode;
    if (errorWithStatusCode.statusCode) {
      throw new Error(`HTTP Error: ${errorWithStatusCode.statusCode} - ${error.message}`);
    } else {
      throw new Error(`Unknown Error: ${error.message}`);
    }
  } else {
    throw new Error('An unexpected error occurred');
  }
};
