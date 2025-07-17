import { 
    FaFutbol as SoccerIcon,
    FaBasketballBall as BasketballIcon,
    FaTableTennis as TennisIcon,
    FaVolleyballBall as VolleyballIcon,
    FaBaseballBall as BaseballIcon,
    FaFootballBall as FootballIcon
} from 'react-icons/fa';

export default function Icon(props) {
    switch (props.sport) {
        case "Soccer":
            return (
                <div>
                    <SoccerIcon />
                </div>
            );
        case "Basketball":
            return (
                <div>
                    <BasketballIcon />
                </div>
            );
        case "Tennis":
            return (
                <div>
                    <TennisIcon />
                </div>
            );
        case "Volleyball":
            return (
                <div>
                    <VolleyballIcon />
                </div>
            );
        case "Baseball":
            return (
                <div>
                    <BaseballIcon />
                </div>
            );
        case "Football":
            return (
                <div>
                    <FootballIcon />
                </div>
            );
        default:
            return null;
    }
}
