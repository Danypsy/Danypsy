import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getMe } from '../store/slices/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !isAuthenticated && !loading) {
      dispatch(getMe());
    }
  }, [token, isAuthenticated, loading, dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
