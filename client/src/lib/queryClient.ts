import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Preload products immediately when app loads
export const preloadProducts = async () => {
  try {
    // Preload all products
    await queryClient.prefetchQuery({
      queryKey: ["/api/products"],
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
    
    // Preload featured products
    await queryClient.prefetchQuery({
      queryKey: ["/api/products", { featured: "true" }],
      queryFn: async () => {
        const response = await fetch("/api/products?featured=true");
        return response.json();
      },
      staleTime: 10 * 60 * 1000,
    });
    
    // Preload products by category
    const categories = ['motorcycles', 'parts', 'accessories'];
    await Promise.all(categories.map(category => 
      queryClient.prefetchQuery({
        queryKey: ["/api/products", { category }],
        queryFn: async () => {
          const response = await fetch(`/api/products?category=${category}`);
          return response.json();
        },
        staleTime: 10 * 60 * 1000,
      })
    ));
  } catch (error) {
    console.log('Preloading failed, will load on demand:', error);
  }
};
