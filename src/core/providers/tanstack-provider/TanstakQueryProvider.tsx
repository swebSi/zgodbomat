import { queryClient } from '@core/libs/queryClient';
import { queryStorage } from '@shared/storage/query-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: queryStorage,
});

export default function TanstackQueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}>
      {children}
    </PersistQueryClientProvider>
  );
}
