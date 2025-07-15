import * as React from 'react';
import Slider from '@mui/material/Slider';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth.jsx';

export default function AgeSelection() {
  const [age, setAge] = React.useState(18);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const { user } = useAuth();
  const db = getFirestore(app);

  const handleAgeChange = async (e, newValue) => {
    setAge(newValue);
  };

  const handleAgeChangeCommitted = async (e, newValue) => {
    if (!user) return;
    
    setError("");
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        age: newValue,
      });
    } catch (err) {
      setError("Failed to save age: " + err.message);
      console.error("Error saving age:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ width: 300, margin: '40px auto', textAlign: 'center' }}>
      <h2>Select Your Age</h2>
      <Slider
        value={age}
        min={13}
        max={100}
        onChange={handleAgeChange}
        onChangeCommitted={handleAgeChangeCommitted}
        valueLabelDisplay="auto"
        aria-label="age"
        disabled={saving}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <span>13</span>
        <span>{saving ? "Saving..." : age}</span>
        <span>100</span>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}