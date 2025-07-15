import Title from "../components/Title";
import Header from "../components/Header";
import "../styles/homepage.css";
import Profile from "../components/Profile";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

export default function Homepage() {
  const [userName, setUserName] = useState("User Name");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);

  useEffect(() => {
    if (user === undefined) {
      return; // Still initializing
    }
    
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, db]);

  if (loading || user === undefined) {
    return <div style={{textAlign: 'center', marginTop: '20vh'}}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const handleOptionClick = (path) => {
    navigate(path);
  };

  return (
    <div>
      <Header />
      <div className="main-content">
        <Title />
        <Profile className="center-profile" sx={{ width: 100, height: 100 }} />
        <p className="name">{userName}</p>

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
        </div>
      </div>
    </div>
  );
}
