import Title from "../components/Title";
import AgeSelection from "../components/AgeSelection";
import SportsSelection from "../components/SportsSelection";

export default function Age() {
    return (
        <div className="vertical">
            <p>Welcome to</p>
            <Title />
            <p>Let's get to know you</p>
            
            {/* Age Selection */}
            <AgeSelection />
            {/* Sport Selection */}
            <SportsSelection />


        </div>
    );
}