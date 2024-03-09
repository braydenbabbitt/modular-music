import { ReactNode } from 'react';
import { EmotionThemeProvider } from './emotion';
import { CustomMantineProvider } from './mantine';
import { ReactQueryProvider } from './react-query/react-query-provider';
import { SpotifySupabaseProvider } from './spotify-supabase-provider';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <CustomMantineProvider>
      <EmotionThemeProvider>
        <SpotifySupabaseProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </SpotifySupabaseProvider>
      </EmotionThemeProvider>
    </CustomMantineProvider>
  );
};
