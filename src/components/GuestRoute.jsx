import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import SplashScreen from './SplashScreen.jsx';

export default function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <SplashScreen />;
  if (user) return <Navigate to="/explorar" replace />;
  return <Outlet />;
}
