import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import './App.css';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';
import { Route, Routes } from 'react-router-dom';
import { Settings } from './pages/Settings';
import { Dashboard } from './pages/Dashboard';

function App() {
  const browserBrightness = useColorScheme();
  const [brightness, setBrightness] = useLocalStorage<ColorScheme>({ key: 'brightness', defaultValue: browserBrightness, getInitialValueInEffect: true });
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
            <Route path='/' element={<Home />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/dashboard' element={<Dashboard />} />
          </Routes>
        </MantineProvider >
      </ColorSchemeProvider>
    </AuthProvider>
  );
}

export default App;