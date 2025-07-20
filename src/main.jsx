// React Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth.jsx';

// Initialize Firebase
import { app, db } from './firebaseConfig';
import { enableMultiTabIndexedDbPersistence } from 'firebase/firestore';

// Pages Imports
import App from './pages/App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Age from './pages/Age';
import Homepage from './pages/Homepage';
import Account from './pages/Account';
import Teams from './pages/Teams';
import Leagues from './pages/Leagues';
import Matches from './pages/Matches';
import Requests from './pages/Requests';
import Upcoming from './pages/Upcoming';
import TeamDetailsPage from './pages/TeamDetailsPage';
import Stats from './pages/Stats';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

// Stylesheets
import './styles/App.css';

// Validate Firebase initialization
if (!app) {
  throw new Error('Firebase app not initialized correctly');
}

// Initialize Firestore with multi-tab support
try {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support all of the features required to enable persistence');
    }
  });
} catch (error) {
  console.warn('Error enabling Firestore persistence:', error);
}

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirect>
              <Signup />
            </AuthRedirect>
          }
        />

        {/* Protected routes */}
        <Route
          path="/age"
          element={
            <ProtectedRoute>
              <Age />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leagues"
          element={
            <ProtectedRoute>
              <Leagues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute>
              <TeamDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Stats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <Requests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upcoming"
          element={
            <ProtectedRoute>
              <Upcoming />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
