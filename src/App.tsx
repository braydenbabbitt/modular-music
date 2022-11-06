import React from 'react';
import './App.css';
import { useBrowserColorScheme, useDestructibleLocalStorage } from 'den-ui';
import { ColorSchemeProvider, ColorScheme, MantineProvider, Text } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { HeaderNavbar } from './components/navbars/header-navbar.component';
import { SpotifyLoginPage } from './pages/spotify/spotify-login.page';
import { AuthProvider } from './services/auth/auth.provider';
import { mantineTheme } from './theme';
import { COLOR_SCHEME_KEY } from './utils/constants';
import { SettingsPage } from './pages/account/settings.component';
import { PageContainer } from './components/containers/page-container.component';

function App() {
  // State
  const [colorScheme, setColorScheme] = useDestructibleLocalStorage<ColorScheme>(
    COLOR_SCHEME_KEY,
    useBrowserColorScheme(),
  );

  // Variables
  const headerLinks = [
    {
      label: 'Test Dropdown',
      children: [{ label: 'sublink1', link: '/' }],
    },
    {
      label: 'Test Direct Link',
      link: '/',
    },
  ];

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={setColorScheme}>
      <MantineProvider
        theme={{
          colorScheme,
          ...mantineTheme,
        }}
      >
        <AuthProvider>
          <HeaderNavbar links={headerLinks}></HeaderNavbar>
          <PageContainer>
            <Routes>
              <Route path='/' element={<Text>Home</Text>} />
              <Route path='/spotify-login' element={<SpotifyLoginPage />} />
              <Route path='/settings' element={<SettingsPage />} />
            </Routes>
          </PageContainer>
        </AuthProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
