// React Imports
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

// Pages Imports
import App from './pages/App';
import Login from './pages/Login';
import Age from './pages/Age';
import Homepage from './pages/Homepage';
import Leagues from './pages/Leagues';
import Matches from './pages/Matches';
import Teams from './pages/Teams';
import Account from './pages/Account';

// Stylesheets
import './styles/App.css';

// import About from './components/About' // Example for another page

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/age" element={<Age />} />
      <Route path='/homepage' element={<Homepage />} />
      <Route path='/leagues' element={<Leagues />} />
      <Route path='/matches' element={<Matches />} />
      <Route path='/teams' element={<Teams />} />
      <Route path='/account' element={<Account />} />
    </Routes>
  </BrowserRouter>
)
