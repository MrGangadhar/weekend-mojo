import InternalLogin from './pages/user/InternalLogin';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';

// User Pages
import Home from './pages/user/Home';
import TripDetails from './pages/user/TripDetails';
import BookingFlow from './pages/user/BookingFlow';
import Payment from './pages/user/Payment';
import UserDashboard from './pages/user/UserDashboard';
import LiveTracking from './pages/user/LiveTracking';
import VideoUpload from './pages/user/VideoUpload';
import Login from './pages/user/Login';

// Management Pages
import ManagementDashboard from './pages/management/Dashboard';
import TripsManagement from './pages/management/TripsManagement';
import BusesManagement from './pages/management/BusesManagement';
import Finance from './pages/management/Finance';
import VideoModeration from './pages/management/VideoModeration';

// Conductor Pages
import ConductorPanel from './pages/conductor/AssignedTrips';
import LiveTripMonitor from './pages/conductor/LiveTripMonitor';
import PassengerList from './pages/conductor/PassengerList';

// Editor Pages
import EditorPanel from './pages/editor/ApprovedVideos';
import PublishQueue from './pages/editor/PublishQueue';

// Layout Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

function AppRoutes() {
  const { user, loading } = useAuth();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'management':
        return '/admin';
      case 'conductor':
        return '/conductor';
      case 'editor':
        return '/editor';
      default:
        return '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to={getDashboardPath(user.role)} replace />} />
          <Route path="/internal-login" element={!user ? <InternalLogin /> : <Navigate to={getDashboardPath(user.role)} replace />} />

          {/* User Routes */}
          <Route
            path="/booking/:tripId"
            element={
              <ProtectedRoute roles={['user', 'management']}>
                <BookingFlow />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:bookingId"
            element={
              <ProtectedRoute roles={['user', 'management']}>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tracking/:bookingId"
            element={
              <ProtectedRoute roles={['user', 'conductor', 'management']}>
                <LiveTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-video"
            element={
              <ProtectedRoute roles={['user']}>
                <VideoUpload />
              </ProtectedRoute>
            }
          />

          {/* Management Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['management']}>
                <ManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trips"
            element={
              <ProtectedRoute roles={['management']}>
                <TripsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/buses"
            element={
              <ProtectedRoute roles={['management']}>
                <BusesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/finance"
            element={
              <ProtectedRoute roles={['management']}>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/videos"
            element={
              <ProtectedRoute roles={['management']}>
                <VideoModeration />
              </ProtectedRoute>
            }
          />

          {/* Conductor Routes */}
          <Route
            path="/conductor"
            element={
              <ProtectedRoute roles={['conductor']}>
                <ConductorPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conductor/live/:tripId/:busId"
            element={
              <ProtectedRoute roles={['conductor']}>
                <LiveTripMonitor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conductor/passengers/:tripId/:busId"
            element={
              <ProtectedRoute roles={['conductor']}>
                <PassengerList />
              </ProtectedRoute>
            }
          />

          {/* Editor Routes */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute roles={['editor']}>
                <EditorPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/queue"
            element={
              <ProtectedRoute roles={['editor']}>
                <PublishQueue />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? getDashboardPath(user.role) : '/'} replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
