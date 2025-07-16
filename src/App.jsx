import React from 'react';
import { AuthProvider } from "./hooks/useAuth.jsx";
import AgeSelection from './components/AgeSelection';
import LandingWaves from './components/LandingWaves.jsx';

function App() {
  return (
    <AuthProvider>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        <LandingWaves />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 20px',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          <AgeSelection />
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;