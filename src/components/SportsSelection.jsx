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

export default function SportsSelection({ selectedAge, name }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const db = getFirestore(app);
  const { user } = useAuth();

  const handleChange = (event, newSports) => {
    setSports(newSports);
  };

  const generateUsername = (name) => {
    // Remove spaces and special characters, convert to lowercase
    return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const handleContinue = async () => {
    if (!user) return;

    // Validate inputs
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (sports.length === 0) {
      setError("Please select at least one sport");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const username = generateUsername(name);
      await updateDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        username: username,
        age: selectedAge,
        sports: sports,
      });
      navigate("/homepage");
    } catch (err) {
      setError("Failed to save profile: " + err.message);
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
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
      
      <div style={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={loading || sports.length === 0 || !name.trim()}
          className="continue-button"
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
        {error && (
          <p style={{ 
            color: '#ff3333', 
            marginTop: 16,
            fontFamily: 'Poppins, sans-serif',
            fontSize: '0.9rem'
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
