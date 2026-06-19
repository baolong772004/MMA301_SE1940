import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppFonts } from '@/hooks';
import ApplicationNavigator from '@/navigation/Application';
import { hydrateStorage, storage } from '@/services/storage';
import { ThemeProvider } from '@/theme';
import '@/translations';

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
});

export { storage };

function App() {
  // Hydrate the synchronous storage cache (AsyncStorage) before mounting the
  // theme so the persisted variant is read synchronously without a flash.
  const [hydrated, setHydrated] = useState(false);
  const [fontsLoaded] = useAppFonts();

  useEffect(() => {
    void hydrateStorage().finally(() => {
      setHydrated(true);
    });
  }, []);

  if (!hydrated || !fontsLoaded) {
    return undefined;
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={storage}>
          <ApplicationNavigator />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
