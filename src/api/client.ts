import { API_URL } from './config'

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
  post: async <T, B = Record<string, unknown>>(
    endpoint: string,
    body: B
  ): Promise<T> => {
    const fullUrl = `${API_URL}${endpoint}`
    // console.log('🌐 API CLIENT DEBUG:')
    // console.log('API_URL:', API_URL)
    // console.log('Endpoint:', endpoint)
    // console.log('Full URL:', fullUrl)
    // console.log('Environment:', import.meta.env.PROD ? 'PRODUCTION' : 'DEVELOPMENT')
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      mode: import.meta.env.PROD ? 'cors' : 'same-origin',
      credentials: import.meta.env.PROD ? 'omit' : 'same-origin',
    })
    
    // console.log('📡 Response status:', response.status)
    // console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return data
  },
}
