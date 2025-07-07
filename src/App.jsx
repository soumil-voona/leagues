import React from 'react';
import { AuthProvider } from "./hooks/useAuth";
import AgeSelection from './components/AgeSelection';

function App() {
  return (
    <AuthProvider>
      <AgeSelection />
    </AuthProvider>
  );
}

export default App;