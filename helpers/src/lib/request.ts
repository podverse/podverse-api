import axios, { AxiosRequestConfig } from 'axios';
import { config } from '@helpers/config';

export const request = async (
  url: string,
  requestConfig?: AxiosRequestConfig,
  abort?: {
    controller: AbortController
    timeoutMs: number
  }
): Promise<any> => {
  let timeoutId: NodeJS.Timeout | undefined;
  if (abort) {
    timeoutId = setTimeout(() => {
      abort.controller.abort();
    }, abort.timeoutMs);
  }
  
  try {
    const response = await axios.request({
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
}

export const throwRequestError = (error: unknown) => {
  if (error instanceof Error) {
    const statusCode = (error as any).statusCode;
    if (statusCode) {
      throw new Error(`HTTP Error: ${statusCode} - ${error.message}`);
    } else {
      throw new Error(`Unknown Error: ${error.message}`);
    }
  } else {
    throw new Error('An unexpected error occurred');
  }
}
