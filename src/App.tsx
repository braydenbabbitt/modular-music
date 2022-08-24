import { AuthProvider } from './hooks/useAuthContext';
import { getTheme } from './utils/Theme';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import './App.css';
import { About } from './pages/About';

function App() {
  const theme = getTheme();

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path='/about' element={<About />} /> */}
          <Route path='/login' element={<Login />} />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App