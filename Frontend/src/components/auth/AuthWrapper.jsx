import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/userSlice';

const AuthWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Check auth status when component mounts
    dispatch(checkAuthStatus());

    // Set a timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    // Once loading is complete, update showLoading state
    if (!loading) {
      setShowLoading(false);
    }
  }, [loading]);

  // Show loading state only for a maximum of 3 seconds
  if (loading && showLoading) {
    return (
      <div className="loading-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // If not authenticated after loading or timeout, redirect to login
  if (!isAuthenticated) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthWrapper;