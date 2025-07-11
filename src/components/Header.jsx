import Menu from './menu/Menu';
import Profile from './Profile';
import ChangeURLButton from './ChangeURLButton';

import '../styles/header.css';

export default function Header() {
    return (
        <div className='header'>
            <Menu />
            {/* Change hard coded value later!! */}
            <ChangeURLButton location="/account">
                <Profile className='user-avatar'/>
            </ChangeURLButton>
        </div>
    );
}