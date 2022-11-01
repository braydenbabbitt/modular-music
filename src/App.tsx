import React from 'react';
import './App.css';
import { useBrowserColorScheme, useDestructableLocalStorage } from 'den-ui';
import { ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { HeaderNavbar } from './components/navbars/header-navbar.component';
import { SpotifyLoginPage } from './pages/spotify/spotify-login.page';
import { AuthProvider } from './services/auth/auth.provider';

function App() {
  // State
  const [colorScheme, setColorScheme] = useDestructableLocalStorage<ColorScheme>(
    'colorScheme',
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
    },
  ];

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={setColorScheme}>
      <AuthProvider>
        <HeaderNavbar links={headerLinks}></HeaderNavbar>
        <Routes>
          <Route path='/' element={<h1>Home</h1>} />
          <Route path='/spotify-login' element={<SpotifyLoginPage />} />
        </Routes>
      </AuthProvider>
    </ColorSchemeProvider>
  );
}

export default App;
