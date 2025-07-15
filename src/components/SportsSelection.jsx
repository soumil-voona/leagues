// Imports useState hook from react
import { useState } from 'react';

// For the buttons
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';
import SportsVolleyballIcon from '@mui/icons-material/SportsVolleyball';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
// Custom CSS for the buttons
import '../styles/sportsButton.css';

// For the submit button
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth.jsx';

export default function SportsSelection() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const db = getFirestore(app);
  const { user } = useAuth();

  const handleChange = (event, newSports) => {
    setSports(newSports);
  };

  const handleContinue = async () => {
    if (!user) return;
    if (sports.length === 0) {
      setError("Please select at least one sport");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        sports: sports,
      });
      navigate("/homepage");
    } catch (err) {
      setError("Failed to save sports: " + err.message);
      console.error("Error saving sports:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', margin: '40px auto' }}>
      <h2>Select Your Sports</h2>
      <div style={{ marginBottom: 24 }}>
        <ToggleButtonGroup
          value={sports}
          onChange={handleChange}
          aria-label="sports selection"
          className="sports-toggle-group"
        >
          <ToggleButton value="soccer" aria-label="soccer">
            <SportsSoccerIcon />
            <span className="sport-label">Soccer</span>
          </ToggleButton>
          <ToggleButton value="basketball" aria-label="basketball">
            <SportsBasketballIcon />
            <span className="sport-label">Basketball</span>
          </ToggleButton>
          <ToggleButton value="badminton" aria-label="badminton">
            <img
              src='/badminton-racket-icon-free-vector-removebg-preview.png'
              alt="Badminton"
              height="24"
              style={{ pointerEvents: 'none' }}
            />
            <span className="sport-label">Badminton</span>
          </ToggleButton>
          <ToggleButton value="football" aria-label="football">
            <SportsFootballIcon />
            <span className="sport-label">Football</span>
          </ToggleButton>
          <ToggleButton value="volleyball" aria-label="volleyball">
            <SportsVolleyballIcon />
            <span className="sport-label">Volleyball</span>
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleContinue}
        disabled={loading || sports.length === 0}
        style={{ marginTop: 24 }}
      >
        {loading ? "Saving..." : "Continue"}
      </Button>
      {error && <p className="error-message" style={{ marginTop: 16 }}>{error}</p>}
    </div>
  );
}
