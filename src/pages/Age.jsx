import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';

// Initialize Firestore
const db = getFirestore(app);
import { 
  FaFutbol as SoccerIcon,
  FaBasketballBall as BasketballIcon,
  FaTableTennis as TennisIcon,
  FaVolleyballBall as VolleyballIcon,
  FaBaseballBall as BaseballIcon,
  FaFootballBall as FootballIcon
} from 'react-icons/fa';
import '../styles/age.css';

const sports = [
  { id: 'soccer', name: 'Soccer', icon: SoccerIcon },
  { id: 'basketball', name: 'Basketball', icon: BasketballIcon },
  { id: 'tennis', name: 'Tennis', icon: TennisIcon },
  { id: 'volleyball', name: 'Volleyball', icon: VolleyballIcon },
  { id: 'baseball', name: 'Baseball', icon: BaseballIcon },
  { id: 'football', name: 'Football', icon: FootballIcon },
];

export default function Age() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('18');
  const [selectedAge, setSelectedAge] = useState(18);
  const [name, setName] = useState('');
  const [selectedSports, setSelectedSports] = useState([]);
  const db = getFirestore(app);

  useEffect(() => {
    if (user === undefined) return; // Still initializing
    if (!user) {
      navigate('/login');
      return;
    }

    const checkUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.name && userData.age && userData.sports?.length) {
            navigate('/homepage');
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserProfile();
  }, [user, navigate, db]);

  const handleAgeChange = (newAge) => {
    setSelectedAge(newAge);
    setInputValue(newAge === 0 ? '' : newAge.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 2);
    setInputValue(value);
    
    if (value === '') {
      setSelectedAge(0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 99) {
        setSelectedAge(numValue);
      }
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const toggleSport = (sportId) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      } else {
        return [...prev, sportId];
      }
    });
  };

  const handleContinue = async () => {
    if (name.trim() && selectedSports.length > 0) {
      try {
        // Save to Firestore
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: name.trim(),
          age: selectedAge,
          sports: selectedSports,
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        // Navigate to home page
        navigate('/homepage');
      } catch (error) {
        console.error('Error saving user data:', error);
        // Optionally show an error message to the user
        alert('Failed to save your information. Please try again.');
      }
    }
  };

  if (loading || user === undefined) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="age-page">
      <div className="welcome-section">
        <h1>Welcome to Leagues</h1>
        <p>Let's set up your profile</p>
      </div>

      <div className="form-container">
        <div className="form-group">
          <label htmlFor="name">Enter Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Your Name"
            className="name-input"
          />
        </div>

        <div className="form-group">
          <label>Select Age</label>
          <div className="age-input-container">
            <input
              type="number"
              min="0"
              max="99"
              value={inputValue}
              maxLength="2"
              onFocus={() => setInputValue('')}
              onBlur={() => {
                if (inputValue === '') {
                  setSelectedAge(0);
                }
              }}
              onChange={handleInputChange}
              className="age-number-input"
              aria-label="Enter your age"
            />
            {selectedAge > 0 && <span className="age-plus">+</span>}
          </div>
          <input
            type="range"
            min="0"
            max="99"
            value={selectedAge}
            onChange={(e) => handleAgeChange(parseInt(e.target.value, 10))}
            className="age-slider"
          />
          <div className="age-labels">
            <span>0</span>
            <span>99+</span>
          </div>
        </div>

        <div className="form-group">
          <label>Sports</label>
          <div className="sports-buttons">
            {sports.map(sport => (
              <button
                key={sport.id}
                className={`sport-button ${selectedSports.includes(sport.id) ? 'selected' : ''}`}
                onClick={() => toggleSport(sport.id)}
                type="button"
              >
                <div className="sport-icon">
                  <sport.icon className="sport-svg" />
                </div>
                <span>{sport.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        className="continue-button"
        onClick={handleContinue}
        disabled={!name || selectedSports.length === 0}
      >
        Continue
      </button>
    </div>
  );
}