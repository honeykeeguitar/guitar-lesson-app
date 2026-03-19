import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { handleRequest } from "./client-storage";

// Mock Response object that works like fetch Response
class MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  private _data: any;

  constructor(status: number, data: any) {
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this.statusText = status === 200 ? "OK" : status === 201 ? "Created" : "Error";
    this._data = data;
  }

  async json() {
    return this._data;
  }

  async text() {
    return JSON.stringify(this._data);
  }
}

async function throwIfResNotOk(res: MockResponse) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<MockResponse> {
  const { status, data: responseData } = handleRequest(method, url, data);
  const res = new MockResponse(status, responseData);
  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = Array.isArray(queryKey) ? queryKey[0] as string : String(queryKey);
    const { status, data } = handleRequest("GET", url);

    if (unauthorizedBehavior === "returnNull" && status === 401) {
      return null;
    }

    if (status < 200 || status >= 300) {
      throw new Error(`${status}: ${JSON.stringify(data)}`);
    }
    return data as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
