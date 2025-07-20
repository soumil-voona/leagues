import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../hooks/useAuth';

export default function Profile(props) {
    const { user } = useAuth();

    const getInitials = () => {
        if (!user) return '';

        // Try to get name from user data
        const name = user.name || user.displayName || '';
        if (!name) return '';

        // Split name and get initials
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2); // Only take first two initials
    };

    const initials = getInitials();

    return (
        <Avatar 
            className={props.className} 
            sx={{
                ...props.sx,
                bgcolor: '#2CBB34', // Use the app's primary green color
                color: 'white',
                fontFamily: 'Russo One'
            }}
        >
            {initials || <PersonIcon />}
        </Avatar>
    );
}
