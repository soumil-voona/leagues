import Menu from './Menu';
import Profile from './Profile';

import '../styles/header.css';

export default function Header() {
    return (
        <div className='header'>
            <Menu />
            {/* Change hard coded value later!! */}
            <Profile className='user-avatar'/>
        </div>
    );
}