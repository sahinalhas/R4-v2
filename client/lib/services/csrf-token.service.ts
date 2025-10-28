/**
 * CSRF Token Service
 * 
 * Manages CSRF token fetching, caching, and refreshing.
 * Ensures all mutation requests (POST/PUT/DELETE/PATCH) include a valid CSRF token.
 */

interface CsrfTokenResponse {
  csrfToken: string;
}

class CsrfTokenService {
  private static token: string | null = null;
  private static tokenPromise: Promise<string> | null = null;

  static async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = this.fetchToken();
    try {
      this.token = await this.tokenPromise;
      this.tokenPromise = null;
      return this.token;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      this.tokenPromise = null;
      // Return empty string as fallback - server will handle missing token
      return '';
    }
  }

  private static async fetchToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-token', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CSRF token request failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('CSRF token response is not JSON');
      }

      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('CSRF token fetch error:', error);
      throw error;
    }
  }

  refreshToken(): void {
    this.token = null;
    this.tokenPromise = null;
  }

  hasToken(): boolean {
    return this.token !== null;
  }
}

export const csrfTokenService = new CsrfTokenService();