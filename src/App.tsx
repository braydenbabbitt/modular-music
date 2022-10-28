import React from 'react';
import './App.css';
import { useBrowserColorScheme, useDestructableLocalStorage } from 'den-ui';
import { ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import { HeaderNavbar } from './components/navbars/header-navbar.component';

function App() {
  // State
  const [colorScheme, setColorScheme] = useDestructableLocalStorage<ColorScheme>(
    'colorScheme',
    useBrowserColorScheme(),
  );

  // Variables
  const currentLocation = useLocation();

  // Functions
  const toggleColorScheme = (newValue?: ColorScheme) => {
    setColorScheme(newValue);
  };

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
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <HeaderNavbar links={headerLinks}></HeaderNavbar>
    </ColorSchemeProvider>
  );
}

export default App;
