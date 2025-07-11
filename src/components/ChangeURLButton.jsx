// For changing screen
import { useNavigate } from 'react-router-dom';

// For the submit button
import Button from '@mui/material/Button';

export default function ChangeURLButton(props) {

    const navigate = useNavigate();

    function handleClick() {
        if (props.onClick) {
            props.onClick();
        }
        navigate(props.location);
    }
    
    return (
        <Button onClick={handleClick}>{props.content}</Button>
    );
}