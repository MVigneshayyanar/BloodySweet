import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardOverview from './pages/Dashboard/DashboardOverview';
import BloodRequestPage from './pages/Requests/BloodRequestPage';
import AnalyticsPage from './pages/Dashboard/AnalyticsPage';
import DonorsPage from './pages/Donors/DonorsPage';
import SeedDataPage from './pages/Admin/SeedDataPage';
import PrivateRoute from './components/common/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/seed" element={<SeedDataPage />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardOverview />} />
            <Route path="donors" element={<DonorsPage />} />
            <Route path="requests" element={<BloodRequestPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
