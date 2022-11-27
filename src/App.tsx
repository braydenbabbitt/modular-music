import React from 'react';
import './App.css';
import { useBrowserColorScheme, useDestructibleLocalStorage } from 'den-ui';
import { ColorSchemeProvider, ColorScheme, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { Route, Routes } from 'react-router-dom';
import { HeaderNavbar } from './components/navbars/header-navbar.component';
import { SpotifyLoginPage } from './pages/spotify/spotify-login.page';
import { AuthProvider } from './services/auth/auth.provider';
import { mantineTheme } from './theme';
import { COLOR_SCHEME_KEY } from './utils/constants';
import { SettingsPage } from './pages/account/settings.page';
import { PageContainer } from './components/containers/page-container.component';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { HomePage } from './pages/home/home.page';
import { HotKeys } from 'react-hotkeys';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SupabaseClientProvider } from './services/supabase/client/client';
import { CreateProgramPage } from './pages/program/create-program.page';

const queryClient = new QueryClient();

function App() {
  // State
  const browserColorSchemeSetting = useBrowserColorScheme();
  const [colorScheme, setColorScheme, colorSchemeIsStored] = useDestructibleLocalStorage<ColorScheme>(
    COLOR_SCHEME_KEY,
    browserColorSchemeSetting,
  );

  // Variables
  const hotkeys = {
    keyMap: {
      TOGGLE_COLOR_SCHEME: ['ctrl+alt+c', 'meta+alt+c'],
    },
    handlers: {
      TOGGLE_COLOR_SCHEME: () => {
        setColorScheme((prev) => {
          if (colorSchemeIsStored) {
            return prev === 'dark' ? 'light' : 'dark';
          } else {
            return browserColorSchemeSetting === 'dark' ? 'light' : 'dark';
          }
        });
      },
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={setColorScheme}>
        <MantineProvider
          theme={{
            colorScheme,
            ...mantineTheme,
          }}
        >
          <HotKeys {...hotkeys}>
            <NotificationsProvider>
              <SupabaseClientProvider>
                <AuthProvider>
                  <HeaderNavbar />
                  <PageContainer>
                    <Routes>
                      <Route path='/' element={<HomePage />} />
                      <Route path='/dashboard' element={<DashboardPage />} />
                      <Route path='/program'>
                        <Route path=':programId' element={<CreateProgramPage />} />
                      </Route>
                      <Route path='/spotify-login' element={<SpotifyLoginPage />} />
                      <Route path='/settings' element={<SettingsPage />} />
                    </Routes>
                  </PageContainer>
                </AuthProvider>
              </SupabaseClientProvider>
            </NotificationsProvider>
          </HotKeys>
        </MantineProvider>
      </ColorSchemeProvider>
    </QueryClientProvider>
  );
}

export default App;
