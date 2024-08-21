import axios, { AxiosRequestConfig, Method } from 'axios';

export const request = async (
  url: string,
  config?: AxiosRequestConfig,
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
      signal: abort?.controller?.signal,
      ...config
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