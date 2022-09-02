import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import './App.css';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Settings } from './pages/Settings';

function App() {
  const [brightness, setBrightness] = useLocalStorage<'light' | 'dark'>({
    key: 'brightness',
    defaultValue: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  });
  const appTheme = { ...getTheme(), colorScheme: brightness };

  const toggleBrightness = () => {
    setBrightness(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
        <ColorSchemeProvider colorScheme={brightness} toggleColorScheme={toggleBrightness}>
          <Navbar />
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/settings' element={<Settings />} />
            </Routes>
        </ColorSchemeProvider>
      </MantineProvider >
    </AuthProvider>
  );
}

export default App;