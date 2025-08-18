import { transformToFrontend, transformToBackend } from "../lib/caseConverter";

export interface SimpleApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class SimpleApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = "SimpleApiError";
  }
}

class SimpleApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async safeFetch<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    console.log(`🚀 Simple fetch: ${options.method || "GET"} ${url}`);

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log(`📡 Response status: ${response.status}`);

    // Single response read - use arrayBuffer for safety
    const buffer = await response.arrayBuffer();
    const text = new TextDecoder().decode(buffer);

    console.log(`📡 Response length: ${text.length} chars`);

    let data: any = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }
    }

    if (!response.ok) {
      const errorMessage =
        data?.error || data?.message || `HTTP ${response.status}`;
      throw new SimpleApiError(errorMessage, response.status, data);
    }

    return transformToFrontend(data);
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.safeFetch<T>(url, { method: "GET" });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const transformedData = data ? transformToBackend(data) : undefined;

    console.log(`🔄 PUT data:`, {
      original: data,
      transformed: transformedData,
    });

    return this.safeFetch<T>(url, {
      method: "PUT",
      body: transformedData ? JSON.stringify(transformedData) : undefined,
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const transformedData = data ? transformToBackend(data) : undefined;

    return this.safeFetch<T>(url, {
      method: "POST",
      body: transformedData ? JSON.stringify(transformedData) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    return this.safeFetch<T>(url, { method: "DELETE" });
  }
}

// Create a simple client instance
const getSimpleApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const port = window.location.port;

    // Cloud environment
    if (hostname.includes("builder.codes") || hostname.includes("fly.dev")) {
      return "/api/v1";
    }

    // Local development
    if (hostname === "localhost" && port === "8080") {
      return "http://localhost:3000/api/v1";
    }
  }

  return "/api/v1";
};

export const simpleApiClient = new SimpleApiClient(getSimpleApiBaseUrl());
