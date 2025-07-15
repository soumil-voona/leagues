import React from 'react';
import { AuthProvider } from "./hooks/useAuth.jsx";
import AgeSelection from './components/AgeSelection';
import LandingWaves from './components/LandingWaves.jsx';

function App() {
  return (
    <AuthProvider>
      <LandingWaves />
      <AgeSelection />
    </AuthProvider>
  );
}

export default App;