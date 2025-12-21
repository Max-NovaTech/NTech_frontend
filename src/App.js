import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Premium from './pages/Premium';
import Superagent from './pages/SuperAgent';
import Normalagent from './pages/NormalAgent';
import OtherDashboard from './pages/OtherDashboard';
import LandingPage from './pages/LandingPage';
import Shop from './pages/Shop';
import BASE_URL from './endpoints/endpoints';

// PrivateRoute Component for Role-Based Access
const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // If role is not allowed, redirect to landing page
    Swal.fire('Access Denied', 'You do not have permission to access this page.', 'error');
    return <Navigate to="/" replace />;
  }

  // If token and role are valid, render the child routes
  return <Outlet />;
};

function App() {
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return; // Only connect if a user is logged in
    }

    // Connect to the socket server
    const socket = io(BASE_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    // Register user with the server
    socket.on('connect', () => {
      /* console.log('Socket connected:', socket.id); */
      socket.emit('register', userId);
      /* console.log(`[Socket] Emitted 'register' for userId: ${userId}`); */
    });

    // Listen for force-logout event
    socket.on('force-logout', (data) => {
      /* console.log(`[Socket] Received 'force-logout':`, data.message); */
      Swal.fire({
        title: 'Session Terminated',
        text: data.message || 'Your session has been terminated by an administrator. Please log in again.',
        icon: 'warning',
        confirmButtonText: 'OK',
      }).then(() => {
        localStorage.clear();
        window.location.href = '/login';
      });
    });

    socket.on('disconnect', (reason) => {
      /* console.log('Socket disconnected:', reason); */
    });

    // Cleanup on component unmount
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['USER']} />}>
          <Route path="/user" element={<UserDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['PREMIUM']} />}>
          <Route path="/premium" element={<Premium />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['SUPER']} />}>
          <Route path="/superagent" element={<Superagent />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['NORMAL']} />}>
          <Route path="/normalagent" element={<Normalagent />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['Other']} />}>
          <Route path="/otherdashboard" element={<OtherDashboard />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;