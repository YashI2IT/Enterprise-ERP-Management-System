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
import FeesDashboard from './pages/finance/FeesDashboard';
import FeeStructures from './pages/finance/FeeStructures';
import StudentFees from './pages/finance/StudentFees';
import LibraryDashboard from './pages/library/LibraryDashboard';
import BooksList from './pages/library/BooksList';
import BookIssues from './pages/library/BookIssues';
import ExamsDashboard from './pages/academic/ExamsDashboard';
import ExamResults from './pages/academic/ExamResults';
import ClassTimetable from './pages/academic/ClassTimetable';
import HostelDashboard from './pages/hostel/HostelDashboard';
import RoomAllocation from './pages/hostel/RoomAllocation';
import TransportDashboard from './pages/transport/TransportDashboard';
import RouteManagement from './pages/transport/RouteManagement';
import TransportAllocations from './pages/transport/TransportAllocations';

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
              <Route path="fees" element={<FeesDashboard />} />
              <Route path="fees/structures" element={<FeeStructures />} />
              <Route path="fees/students" element={<StudentFees />} />
              <Route path="library" element={<LibraryDashboard />} />
              <Route path="library/books" element={<BooksList />} />
              <Route path="library/issues" element={<BookIssues />} />
              <Route path="academic/exams" element={<ExamsDashboard />} />
              <Route path="academic/results" element={<ExamResults />} />
              <Route path="academic/timetable" element={<ClassTimetable />} />
              <Route path="hostels" element={<HostelDashboard />} />
              <Route path="hostels/rooms" element={<RoomAllocation />} />
              <Route path="transport" element={<TransportDashboard />} />
              <Route path="transport/routes" element={<RouteManagement />} />
              <Route path="transport/allocations" element={<TransportAllocations />} />
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
