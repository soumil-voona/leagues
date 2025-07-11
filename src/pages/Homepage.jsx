import Title from "../components/Title";
import Header from "../components/Header";
import '../styles/homepage.css';
import Profile from "../components/Profile";
import { useState } from 'react';

export default function Homepage() {

    // Change this to actual user name
    let [userName, setUserName] = useState("User Name");

    return (
        <div>
            <Header />
            <div className="main-content">
                <Title />
                <Profile className="center-profile" sx={{ width: 100, height: 100}}/>
                <p className="name">{userName}</p>

                <div  className="options">
                    <div className="option-choice">
                        <p className="option-content">Stats</p>
                    </div>
                    <div className="option-choice">
                        <p className="option-content">Teams</p>
                    </div>
                    <div className="option-choice">
                        <p className="option-content">Parks</p>
                    </div>
                    <div className="option-choice">
                        <p className="option-content">Requests</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
