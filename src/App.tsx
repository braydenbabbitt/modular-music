import React from 'react';
import './App.css';
import { useBrowserColorScheme, useDestructableLocalStorage } from 'den-ui';
import { ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { Route, Routes } from 'react-router-dom';
import { HeaderNavbar } from './components/navbars/header-navbar.component';
import { SpotifyLoginPage } from './pages/spotify/spotify-login.page';

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
      <HeaderNavbar links={headerLinks}></HeaderNavbar>
      <Routes>
        <Route path='/' element={<h1>Home</h1>} />
        <Route path='/spotify-login' element={<SpotifyLoginPage />} />
      </Routes>
    </ColorSchemeProvider>
  );
}

export default App;
