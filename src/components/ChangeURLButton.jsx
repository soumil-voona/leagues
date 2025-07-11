// For changing screen
import { useNavigate } from 'react-router-dom';

export default function ChangeURLButton(props) {

    const navigate = useNavigate();

    function handleClick() {
        if (props.onClick) {
            props.onClick();
        }
        navigate(props.location);
    }
    
    return (
        <div onClick={handleClick}>{props.children}</div>
    );
}