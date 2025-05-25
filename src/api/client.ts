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
      console.log(`Realizando petición POST a: ${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'same-origin',
      });

      const data = await response.json();
      console.log('Respuesta recibida (raw):', data);
      console.log('Propiedades de la respuesta:', Object.keys(data));
      
      if (data.facturas) {
        console.log('Número de facturas recibidas:', data.facturas.length);
        console.log('Primera factura (ejemplo):', data.facturas[0]);
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },
}; 