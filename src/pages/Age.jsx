import AgeSelection from "../components/AgeSelection";
import SportsSelection from "../components/SportsSelection";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { TopWave, BottomWave } from "../components/LandingWaves";
import "../styles/age.css";

export default function Age() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedAge, setSelectedAge] = useState(18);
    const [userName, setUserName] = useState("");
    const db = getFirestore(app);

    useEffect(() => {
        if (user === undefined) {
            return; // Still initializing
        }

        if (!user) {
            navigate("/login");
            return;
        }

        const checkUserProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // If user already has age and sports, redirect to homepage
                    if (userData.age && userData.sports && userData.sports.length > 0) {
                        navigate("/homepage");
                    }
                    // Set the user's name from Firestore
                    setUserName(userData.name || "");
                }
            } catch (error) {
                console.error("Error checking user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfile();
    }, [user, navigate, db]);

    const handleAgeChange = (age) => {
        setSelectedAge(age);
    };

    if (loading || user === undefined) {
        return <div style={{textAlign: 'center', marginTop: '20vh'}}>Loading...</div>;
    }

    if (!user) {
        return null;
    }
    
    return (
        <div className="age-page">
            <div className="age-content">
                <img src="/imgs/title-text.png" alt="LEAGUES" className="title-image" />
                
                {userName && (
                    <h2 className="welcome-text">Welcome, {userName.split(' ')[0]}!</h2>
                )}
                
                <h2 className="select-age-text">Select Age</h2>
                <div className="selection-container">
                    <AgeSelection onAgeChange={handleAgeChange} />
                </div>
                
                <h2 className="sports-text">Select Sports</h2>
                <div className="selection-container">
                    <SportsSelection selectedAge={selectedAge} name={userName} />
                </div>
            </div>
        </div>
    );
}