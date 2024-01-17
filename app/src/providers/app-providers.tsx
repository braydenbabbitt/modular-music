import { ReactNode } from 'react';
import { EmotionThemeProvider } from './emotion';
import { CustomMantineProvider } from './mantine';
import { SpotifySupabaseProvider } from './spotify-supabase-provider';

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <CustomMantineProvider>
      <EmotionThemeProvider>
        <SpotifySupabaseProvider>{children}</SpotifySupabaseProvider>
      </EmotionThemeProvider>
    </CustomMantineProvider>
  );
};
