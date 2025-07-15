import Title from "../components/Title";
import AgeSelection from "../components/AgeSelection";
import SportsSelection from "../components/SportsSelection";
import { useAuth } from "../hooks/useAuth.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";

export default function Age() {
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

        const checkUserProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    // If user already has age and sports, redirect to homepage
                    if (userData.age && userData.sports && userData.sports.length > 0) {
                        navigate("/homepage");
                    }
                }
            } catch (error) {
                console.error("Error checking user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        checkUserProfile();
    }, [user, navigate, db]);

    if (loading || user === undefined) {
        return <div style={{textAlign: 'center', marginTop: '20vh'}}>Loading...</div>;
    }

    if (!user) {
        return null;
    }
    
    return (
        <div className="vertical" style={{ textAlign: 'center', padding: '20px' }}>
            <p className="welcome-text">Welcome to</p>
            <Title />
            <p className="setup-text">Let's get to know you</p>
            <div className="selection-container">
                <AgeSelection />
                <SportsSelection />
            </div>
        </div>
    );
}