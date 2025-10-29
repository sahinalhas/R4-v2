import { toast } from "sonner";
import { 
  InterceptorManager, 
  ToastConfig,
  createDefaultErrorInterceptor,
  createDefaultSuccessInterceptor,
  RequestInterceptor
} from "./interceptors";
import { 
  parseApiError, 
  handleNetworkError, 
  showErrorToast as displayErrorToast 
} from "./error-handler";
import { ApiError, isApiErrorResponse } from "../../types/api-types";

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestConfig<T = unknown> extends ToastConfig {
  method?: HttpMethod;
  body?: T;
  headers?: Record<string, string>;
  timeout?: number;
  skipCsrf?: boolean; // Allow skipping CSRF for public endpoints
}

export interface ApiResponse<T> {
  data: T;
  ok: boolean;
  status: number;
}

class ApiClient {
  private baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  private interceptors = new InterceptorManager();

  constructor() {
    // Modern CSRF protection uses SameSite cookies
    // No need for manual CSRF token handling
  }

  async request<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    config: ApiRequestConfig<TBody> = {},
    isRetry = false
  ): Promise<TResponse> {
    const {
      method = 'GET',
      body,
      headers = {},
      showSuccessToast = false,
      successMessage,
      showErrorToast = true,
      errorMessage,
      errorDescription,
      timeout = 30000,
    } = config;

    const toastConfig: ToastConfig = {
      showSuccessToast,
      successMessage,
      showErrorToast,
      errorMessage,
      errorDescription,
    };

    const errorInterceptor = createDefaultErrorInterceptor(toastConfig);
    const controller = new AbortController();
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      timeoutId = setTimeout(() => controller.abort(), timeout);

      let requestConfig: RequestInit = {
        method,
        headers: { ...this.baseHeaders, ...headers },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Required for SameSite cookies to work
        signal: controller.signal,
      };

      requestConfig = await this.interceptors.applyRequestInterceptors(requestConfig, endpoint);

      let response = await fetch(endpoint, requestConfig);
      
      response = await this.interceptors.applyResponseInterceptors(response, endpoint);

      // Parse response
      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json')
        ? await response.json().catch(() => ({}))
        : await response.text();

      // Handle error responses
      if (!response.ok) {
        const apiError = parseApiError(response, data);
        throw apiError;
      }

      // Check for API error format even in 200 responses
      if (typeof data === 'object' && data !== null && isApiErrorResponse(data)) {
        const apiError = parseApiError(response, data);
        throw apiError;
      }

      if (toastConfig.showSuccessToast && toastConfig.successMessage) {
        toast.success(toastConfig.successMessage);
      }

      return data as TResponse;
    } catch (error) {
      
      // Handle as ApiError or convert to ApiError
      const apiError = error instanceof Error && 'code' in error
        ? error as ApiError
        : handleNetworkError(error as Error);

      // Show error toast if configured
      if (toastConfig.showErrorToast) {
        if (toastConfig.errorMessage) {
          toast.error(toastConfig.errorMessage, {
            description: toastConfig.errorDescription
          });
        } else {
          displayErrorToast(apiError);
        }
      }

      // Apply interceptors
      await errorInterceptor(apiError, endpoint, method);
      await this.interceptors.applyErrorInterceptors(apiError, endpoint, method);
      
      throw apiError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  getInterceptors(): InterceptorManager {
    return this.interceptors;
  }

  async get<TResponse = unknown>(
    endpoint: string,
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<TResponse> {
    const response = await this.request<TResponse>(endpoint, { ...config, method: 'GET' });
    // Eğer response { data: ... } formatındaysa, data'yı döndür
    if (response && typeof response === 'object' && 'data' in response && !Array.isArray(response)) {
      return (response as any).data as TResponse;
    }
    return response;
  }

  async post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config: Omit<ApiRequestConfig<TBody>, 'method' | 'body'> = {}
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'POST', body });
  }

  async put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config: Omit<ApiRequestConfig<TBody>, 'method' | 'body'> = {}
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'PUT', body });
  }

  async delete<TResponse = unknown>(
    endpoint: string,
    config: Omit<ApiRequestConfig, 'method' | 'body'> = {}
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { ...config, method: 'DELETE' });
  }

  async patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config: Omit<ApiRequestConfig<TBody>, 'method' | 'body'> = {}
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...config, method: 'PATCH', body });
  }
}

export const apiClient = new ApiClient();

/**
 * Create a safe API handler with proper error handling
 */
export function createApiHandler<TResponse>(
  fetcher: () => Promise<TResponse>,
  fallback: TResponse,
  errorMessage?: string
): () => Promise<TResponse> {
  return async () => {
    try {
      return await fetcher();
    } catch (error) {
      const apiError = error instanceof Error && 'code' in error
        ? error as ApiError
        : handleNetworkError(error as Error);
      
      console.error(errorMessage || 'API error:', apiError);
      
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        displayErrorToast(apiError);
      }
      
      return fallback;
    }
  };
}

/**
 * Type-safe wrapper for safe fetch
 */
export async function safeFetch<T>(
  endpoint: string,
  config?: ApiRequestConfig
): Promise<T> {
  return apiClient.request<T>(endpoint, config);
}
