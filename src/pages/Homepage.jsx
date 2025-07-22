import Title from "../components/Title";
import Header from "../components/Header";
import "../styles/Homepage.css";
import Profile from "../components/Profile";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { Box, CircularProgress } from "@mui/material";

export default function Homepage() {
  const [userName, setUserName] = useState("User Name");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  console.log(user);
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log(userData);
          // setUserName();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading, db]);

  if (authLoading || loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <div>
        <Header />
        <div className="main-content">
          <Title />
          <div className="options">
            <div className="option-choice" onClick={() => navigate('/login')}>
              <p className="option-content">Login</p>
            </div>
            <div className="option-choice" onClick={() => navigate('/signup')}>
              <p className="option-content">Sign Up</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
    <div>
      <Header />
      <div className="main-content">
        <Title />
        <Profile 
          className="center-profile" 
          sx={{ 
            width: { xs: 150, sm: 200, md: 250 }, 
            height: { xs: 150, sm: 200, md: 250 },
            fontSize: { xs: '3rem', sm: '4rem', md: '5rem' }
          }} 
        />
        <p className="name title">{user?.displayName.toUpperCase() || user?.name.toUpperCase() || "User Undefined"}</p>

        <div className="options">
          <div className="option-choice" onClick={() => handleOptionClick("/stats")}>
            <p className="option-content">Stats</p>
          </div>
          <div className="option-choice" onClick={() => handleOptionClick("/teams")}>
            <p className="option-content">Teams</p>
          </div>
          <div className="option-choice" onClick={() => handleOptionClick("/matches")}>
            <p className="option-content">Book A Match</p>
          </div>
          <div className="option-choice" onClick={() => handleOptionClick("/leagues")}>
            <p className="option-content">Leagues</p>
          </div>
          <div className="option-choice" onClick={() => handleOptionClick("/requests")}>
            <p className="option-content">Requests</p>
          </div>
        </div>
      </div>
    </div>
  );
}
