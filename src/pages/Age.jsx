import Title from "../components/Title";
import AgeSelection from "../components/AgeSelection";
import SportsSelection from "../components/SportsSelection";
import { useAuth } from "../hooks/useAuth.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebaseConfig";
import { TopWave, BottomWave } from "../components/LandingWaves";
import TextField from '@mui/material/TextField';
import "../styles/age.css";

export default function Age() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedAge, setSelectedAge] = useState(18);
    const [name, setName] = useState("");
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
                    // If user already has name, age and sports, redirect to homepage
                    if (userData.name && userData.age && userData.sports && userData.sports.length > 0) {
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

    const handleAgeChange = (age) => {
        setSelectedAge(age);
    };

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    if (loading || user === undefined) {
        return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="age-page">
            <div className="top-wave">
                <TopWave />
            </div>

            <div className="age-content">
                <img src="/imgs/title-text.png" alt="LEAGUES" className="title-image" />
                <h2 className="select-age-text">Enter Name</h2>
                <div className="name-input-container" style={{
                    width: '100%',
                    maxWidth: '500px',
                    margin: '20px auto'
                }}>
                    <TextField
                        fullWidth
                        label="Your Name"
                        variant="outlined"
                        value={name}
                        onChange={handleNameChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#2CBB34',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#2CBB34',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#2CBB34',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#2CBB34',
                                '&.Mui-focused': {
                                    color: '#2CBB34',
                                },
                            },
                            fontFamily: 'Poppins, sans-serif',
                        }}
                    />
                </div>

                <h2 className="select-age-text">Select Age</h2>
                <div className="selection-container">
                    <AgeSelection onAgeChange={handleAgeChange} />
                </div>

                <h2 className="sports-text">Sports</h2>
                <div className="selection-container">
                    <SportsSelection selectedAge={selectedAge} name={name} />
                </div>
            </div>

            <div className="bottom-wave">
                <BottomWave />
            </div>
        </div>
    );
}