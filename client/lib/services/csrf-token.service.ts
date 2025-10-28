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
  private token: string | null = null;
  private fetchPromise: Promise<string> | null = null;

  async getToken(): Promise<string> {
    if (this.token) {
      return this.token;
    }

    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this.fetchNewToken();
    
    try {
      this.token = await this.fetchPromise;
      return this.token;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch CSRF token: ${response.status}`);
        }

        const data: CsrfTokenResponse = await response.json();
        
        if (!data.csrfToken) {
          throw new Error('CSRF token missing in response');
        }

        return data.csrfToken;
      } catch (error) {
        lastError = error as Error;
        console.warn(`CSRF token fetch attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }

    console.error('All CSRF token fetch attempts failed:', lastError);
    throw lastError || new Error('Failed to fetch CSRF token after multiple attempts');
  }

  refreshToken(): void {
    this.token = null;
    this.fetchPromise = null;
  }

  hasToken(): boolean {
    return this.token !== null;
  }
}

export const csrfTokenService = new CsrfTokenService();
