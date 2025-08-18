import { APIResponse, PaginatedResponse, FilterOptions } from "../types";
import { transformToFrontend, transformToBackend } from "../lib/caseConverter";

// Force recompilation - 2025-01-30

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, any>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
    public errorType?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let fullUrl: string;

    // Check if baseUrl is absolute (starts with http)
    if (this.baseUrl.startsWith("http")) {
      // Direct connection to backend
      fullUrl = `${this.baseUrl}${endpoint}`;
      console.log(`🔗 Building direct URL: ${fullUrl}`);
    } else {
      // Relative URL for proxy
      fullUrl = `${this.baseUrl}${endpoint}`;
      if (!fullUrl.startsWith("/")) {
        fullUrl = `/${fullUrl}`;
      }
      console.log(`🔗 Building relative URL: ${fullUrl}`);
    }

    // Add query parameters if present
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const separator = fullUrl.includes("?") ? "&" : "?";
      fullUrl = `${fullUrl}${separator}${searchParams.toString()}`;
    }

    console.log(`✅ Final API URL: ${fullUrl}`);
    return fullUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { params, timeout = this.timeout, ...fetchOptions } = options;

    const url = this.buildUrl(endpoint, params);
    console.log(`🚀 Making ${fetchOptions.method || "GET"} request to: ${url}`);

    const headers = {
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    };

    console.log(`📤 Request headers:`, headers);
    console.log(`📤 Request body:`, fetchOptions.body ? "Has body" : "No body");
    console.log(`📤 Request method:`, fetchOptions.method || "GET");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`📡 Sending fetch request...`);
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      console.log(`📡 Fetch completed with status: ${response.status}`);
      clearTimeout(timeoutId);

      // Defensive response handling - prevent any double reads
      let responseData: any = null;
      let errorOccurred = false;

      try {
        // Check content type to determine how to read response
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          // For JSON responses, use response.json()
          responseData = await response.json();
          console.log(`📡 Successfully parsed JSON response`);
        } else {
          // For non-JSON responses, read as text
          const responseText = await response.text();
          console.log(`📡 Response text (first 100 chars): ${responseText.substring(0, 100)}`);

          // Try to parse as JSON anyway, fallback to text
          if (responseText.trim()) {
            try {
              responseData = JSON.parse(responseText);
              console.log(`📡 Parsed non-JSON content-type as JSON`);
            } catch (parseError) {
              responseData = { message: responseText };
              console.log(`📡 Using text response`);
            }
          } else {
            responseData = {};
            console.log(`📡 Empty response`);
          }
        }
      } catch (readError) {
        console.error(`📡 Response read error:`, readError);
        errorOccurred = true;

        // Create error response data
        responseData = {
          error: "Failed to read response",
          details: readError.message,
          status: response.status
        };
      }

      // Check for HTTP errors
      if (!response.ok) {
        const errorMessage = !errorOccurred && responseData?.error
          ? responseData.error
          : !errorOccurred && responseData?.message
          ? responseData.message
          : `HTTP ${response.status}`;

        console.error(`📡 HTTP Error ${response.status}: ${errorMessage}`);
        throw new ApiError(
          `HTTP ${response.status}: ${errorMessage}`,
          response.status,
          responseData,
        );
      }

      // Additional error check for response read failures
      if (errorOccurred) {
        console.error(`📡 Response processing failed`);
        throw new ApiError(
          "Failed to process response",
          response.status,
          responseData,
        );
      }

      console.log(`✅ API call successful`);

      // Transform snake_case to camelCase for frontend
      const transformedData = transformToFrontend(responseData);
      return transformedData;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        console.error(`📡 Request Error:`, error.message);

        if (error.name === "AbortError") {
          throw new ApiError("Request timeout", 408);
        }

        // Handle specific body stream errors
        if (
          error.message.includes("body stream") ||
          error.message.includes("already read")
        ) {
          throw new ApiError("Response reading error - please try again", 0);
        }

        throw new ApiError(error.message, 0);
      }

      throw new ApiError("Unknown error occurred", 0);
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    // Transform camelCase to snake_case for backend
    const transformedData = data ? transformToBackend(data) : undefined;

    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: transformedData ? JSON.stringify(transformedData) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    // Transform camelCase to snake_case for backend
    const transformedData = data ? transformToBackend(data) : undefined;

    console.log(`🔄 PUT ${endpoint}:`, {
      originalData: data,
      transformedData: transformedData
    });

    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: transformedData ? JSON.stringify(transformedData) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestOptions = {},
  ): Promise<T> {
    // Transform camelCase to snake_case for backend
    const transformedData = data ? transformToBackend(data) : undefined;

    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: transformedData ? JSON.stringify(transformedData) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: "DELETE" });
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  setAuthToken(token: string): void {
    this.setDefaultHeader("Authorization", `Bearer ${token}`);
  }

  clearAuth(): void {
    this.removeDefaultHeader("Authorization");
  }
}

// Create default API client instance
const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log("🌐 Current location:", window.location.href);

    // В облачной среде fly.dev/builder.codes
    if (hostname.includes("builder.codes") || hostname.includes("fly.dev")) {
      // Сначала пробуем proxy
      const proxyUrl = "/api/v1";
      console.log("🌩️ Cloud environment - trying proxy URL:", proxyUrl);
      return proxyUrl;
    }

    // Локальн��я разработка - прямое подклю��ение к бэкенду
    if (hostname === "localhost" && port === "8080") {
      const directUrl = "http://localhost:3000/api/v1";
      console.log("🏠 Local development - using direct connection:", directUrl);
      return directUrl;
    }
  }

  // Default fallback
  const defaultUrl = "/api/v1";
  console.log("🔄 Using default API URL:", defaultUrl);
  return defaultUrl;
};

const API_BASE_URL = getApiBaseUrl();

console.log("=== API Configuration ===");
console.log("API Base URL:", API_BASE_URL);
console.log("========================");

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30000,
});

// Helper functions for common API patterns
export const createPaginatedRequest = (
  page: number = 1,
  limit: number = 20,
  filters?: FilterOptions,
) => {
  return {
    page,
    limit,
    ...filters,
  };
};

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export default apiClient;
