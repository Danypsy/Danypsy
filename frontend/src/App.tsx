import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DossierList from './pages/DossierList';
import DossierDetail from './pages/DossierDetail';
import DossierCreate from './pages/DossierCreate';
import ChecklistPage from './pages/ChecklistPage';
import KPIDashboard from './pages/KPIDashboard';
import PrivateRoute from './components/PrivateRoute';

// Thème Material-UI personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />

            {/* Routes protégées */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dossiers" element={<DossierList />} />
              <Route path="dossiers/create" element={<DossierCreate />} />
              <Route path="dossiers/:id" element={<DossierDetail />} />
              <Route path="dossiers/:id/checklist" element={<ChecklistPage />} />
              <Route path="kpis" element={<KPIDashboard />} />
            </Route>

            {/* Route 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
