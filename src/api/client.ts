import { API_URL } from './config';

/**
 * Generic API client for making requests to Mikrowisp
 */
export const apiClient = {
  /**
   * Make a POST request to the Mikrowisp API
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Promise with the response data
   */
  post: async <T, B = Record<string, unknown>>(endpoint: string, body: B): Promise<T> => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'same-origin',
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
}; 