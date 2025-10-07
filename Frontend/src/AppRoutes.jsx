import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Landing from './components/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import AuthWrapper from './components/auth/AuthWrapper';

const AppRoutes = () => {
  const [isDark, setIsDark] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.user);

  // check for saved theme in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login isAuthenticated={isAuthenticated} />} />
        <Route path="/register" element={<Register isAuthenticated={isAuthenticated} />} />
        <Route 
          path="/chat" 
          element={
            <AuthWrapper>
              <Chat />
            </AuthWrapper>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes