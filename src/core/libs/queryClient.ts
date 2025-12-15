import { ConvexQueryClient } from '@convex-dev/react-query';
import { convex } from '@core/providers/convex/convexClient';
import { QueryClient } from '@tanstack/react-query';

const convexQueryClient = new ConvexQueryClient(convex);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      gcTime: 1000 * 60 * 60 * 24 * 7, // 1 week
      staleTime: 1000 * 60 * 60 * 24, // 1 day
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);
