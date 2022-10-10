import React from 'react';
import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import './App.css';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Route, Routes } from 'react-router-dom';
import { Settings } from './pages/Settings';
import { ProgramsPage } from './pages/ProgramsPage';
import { Program } from './pages/programs/Program';
import { GlobalHotKeys } from 'react-hotkeys';
import { DevTools } from './components/DevTools';
import { useBrowserColorScheme, useDestructableLocalStorage } from 'den-ui';

function App() {
  // State
  // const [brightness, setBrightness] = useLocalStorage<ColorScheme>({ key: 'brightness', defaultValue: useBrowserBrightness() });
  const [colorScheme, setColorScheme] = useDestructableLocalStorage<'light' | 'dark'>(
    'colorScheme',
    useBrowserColorScheme(),
  );
  const [devMode, setDevMode] = useLocalStorage<boolean>({
    key: 'dev',
    defaultValue: false,
  });

  // Functions
  const toggleBrightness = () => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Variables
  const appTheme = { ...getTheme(), colorScheme: colorScheme };

  // HotKeys
  const hotKeyMap = {
    TOGGLE_DEV_MODE: 'F17',
    TOGGLE_BRIGHTNESS: 'Control+Shift+B',
  };
  const hotKeyHandlers = {
    TOGGLE_DEV_MODE: () => {
      setDevMode((prev) => !prev);
    },
    TOGGLE_BRIGHTNESS: toggleBrightness,
  };

  return (
    <AuthProvider>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleBrightness}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
          <GlobalHotKeys keyMap={hotKeyMap} handlers={hotKeyHandlers}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
              }}
            >
              <Navbar devMode={devMode} />
              <Routes>
                <Route index element={<Home />} />
                <Route path='settings' element={<Settings />} />
                <Route path='programs'>
                  <Route index element={<ProgramsPage />} />
                  <Route path=':programId' element={<Program />} />
                </Route>
              </Routes>
              {devMode && <DevTools toggleDevMode={hotKeyHandlers.TOGGLE_DEV_MODE} />}
            </div>
          </GlobalHotKeys>
        </MantineProvider>
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;
