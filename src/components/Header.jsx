import Menu from './menu/Menu';
import Profile from './Profile';
import ChangeURLButton from './ChangeURLButton';
import { Badge } from '@mui/material';
import '../styles/header.css';

export default function Header({ pendingInvites = 0 }) {
    return (
        <div className='header-div'>
            <div className='header'>
                <Menu pendingInvites={pendingInvites} />
                <ChangeURLButton location="/account">
                    <Badge
                        badgeContent={pendingInvites}
                        color="error"
                        overlap="circular"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <Profile className='user-avatar' />
                    </Badge>
                </ChangeURLButton>
            </div>
        </div>
    );
}