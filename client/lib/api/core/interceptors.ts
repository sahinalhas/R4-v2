import { toast } from "sonner";

export type RequestInterceptor = (config: RequestInit, endpoint: string) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response, endpoint: string) => Response | Promise<Response>;
export type ErrorInterceptor = (error: Error, endpoint: string, method: string) => void | Promise<void>;

export interface ToastConfig {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  errorMessage?: string;
  errorDescription?: string;
}

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  async applyRequestInterceptors(config: RequestInit, endpoint: string): Promise<RequestInit> {
    let modifiedConfig = config;
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig, endpoint);
    }
    return modifiedConfig;
  }

  async applyResponseInterceptors(response: Response, endpoint: string): Promise<Response> {
    let modifiedResponse = response;
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse, endpoint);
    }
    return modifiedResponse;
  }

  async applyErrorInterceptors(error: Error, endpoint: string, method: string): Promise<void> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error, endpoint, method);
    }
  }
}

export function createDefaultErrorInterceptor(toastConfig: ToastConfig): ErrorInterceptor {
  return (error: Error, endpoint: string, method: string) => {
    console.error(`API Error [${method} ${endpoint}]:`, error);

    if (toastConfig.showErrorToast) {
      const errMsg = toastConfig.errorMessage || 'İşlem sırasında bir hata oluştu';
      toast.error(errMsg, toastConfig.errorDescription ? { description: toastConfig.errorDescription } : undefined);
    }
  };
}

export function createDefaultSuccessInterceptor(toastConfig: ToastConfig): ResponseInterceptor {
  return (response: Response) => {
    if (toastConfig.showSuccessToast && toastConfig.successMessage) {
      toast.success(toastConfig.successMessage);
    }
    return response;
  };
}
