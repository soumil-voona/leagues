// React Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth.jsx';

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

// Tutorial Imports
import TutorialsPage from './pages/TutorialsPage.jsx';
import FootballTutorials from './pages/TutorialPages/FootballTutorials.jsx';
import TennisTutorials from './pages/TutorialPages/TennisTutorials.jsx';
import BasketballTutorials from './pages/TutorialPages/BasketballTutorials.jsx';
import SoccerTutorials from './pages/TutorialPages/SoccerTutorials.jsx';
import VolleyballTutorials from './pages/TutorialPages/VolleyballTutorials.jsx';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';
import AuthRedirect from './components/AuthRedirect';

// Stylesheets
import './styles/App.css';

// Firebase initialized elsewhere
import { app } from './firebaseConfig.js';

// Validate Firebase initialization
if (!app) {
  throw new Error('Firebase app not initialized correctly');
}

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public routes */}
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
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
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

        <Route
          path="/tutorials"
          element={
            <ProtectedRoute>
              <TutorialsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials/basketball"
          element={
            <ProtectedRoute>
              <BasketballTutorials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials/football"
          element={
            <ProtectedRoute>
              <FootballTutorials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials/soccer"
          element={
            <ProtectedRoute>
              <SoccerTutorials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials/tennis"
          element={
            <ProtectedRoute>
              <TennisTutorials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutorials/volleyball"
          element={
            <ProtectedRoute>
              <TennisTutorials />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
