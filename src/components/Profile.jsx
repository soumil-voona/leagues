import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';

export default function Profile(props) {
    return (
        <Avatar className={props.className && props.className} sx={props.sx && props.sx}><PersonIcon /></ Avatar>
    );
}
