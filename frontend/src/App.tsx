// React import removed
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { Toaster } from 'sonner';

import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import StudentsList from './pages/students/StudentsList';
import StaffList from './pages/staff/StaffList';
import Attendance from './pages/attendance/Attendance';

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div>Dashboard Home (Widgets go here)</div>} />
              <Route path="students" element={<StudentsList />} />
              <Route path="staff" element={<StaffList />} />
              <Route path="attendance" element={<Attendance />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
