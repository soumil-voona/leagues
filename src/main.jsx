// React Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './hooks/useAuth.jsx';

// Initialize Firebase
import './firebaseConfig';

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

// Stylesheets
import './styles/App.css';

// import About from './components/About' // Example for another page

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/age" element={<Age />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/account" element={<Account />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/leagues" element={<Leagues />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)
