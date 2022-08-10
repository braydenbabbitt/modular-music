import { ThemeProvider } from '@emotion/react'
import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import './App.css';
import { getTheme } from './utils/Theme'

function App() {
  const theme = getTheme();

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
