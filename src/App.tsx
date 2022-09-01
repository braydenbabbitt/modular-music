import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import './App.css';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme, useLocalStorage } from '@mantine/hooks';

function App() {
  const [brightness, setBrightness] = useLocalStorage<'light' | 'dark'>({ key: 'brightness', defaultValue: useColorScheme() });
  const appTheme = { ...getTheme(), colorScheme: brightness };

  const toggleBrightness = () => {
    setBrightness(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AuthProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={appTheme}>
        <ColorSchemeProvider colorScheme={brightness} toggleColorScheme={toggleBrightness}>
          <Navbar />
          <Home />
        </ColorSchemeProvider>
      </MantineProvider >
    </AuthProvider>
  );
}

export default App;