import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import './App.css';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Route, Routes } from 'react-router-dom';
import { Settings } from './pages/Settings';
import { ProgramsPage } from './pages/ProgramsPage';
import { useBrowserBrightness } from './hooks/useBrowserBrightness';
import { Program } from './pages/programs/Program';

function App() {
  // const browserBrightness = useBrowserBrightness();
  const [brightness, setBrightness] = useLocalStorage<ColorScheme>({ key: 'brightness', defaultValue: useBrowserBrightness(), getInitialValueInEffect: false });
  const toggleBrightness = () => {
    setBrightness(prev => prev === 'light' ? 'dark' : 'light');
  };

  const appTheme = { ...getTheme(), colorScheme: brightness };

  return (
    <AuthProvider>
      <ColorSchemeProvider colorScheme={brightness} toggleColorScheme={toggleBrightness}>
        <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
          <Navbar />
          <Routes>
            <Route index element={<Home />} />
            <Route path='settings' element={<Settings />} />
            <Route path='programs'>
              <Route index element={<ProgramsPage />} />
              <Route path=':programId' element={<Program />} />
            </Route>
          </Routes>
        </MantineProvider >
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;