import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

import CompleteMenu from './CompleteMenu';

export default function Menu() {
    let [showMenu, setShowMenu] = useState(false);

    function handleClick() {
        setShowMenu(!showMenu);
    }

    return (
        <div>
            {!showMenu && <MenuIcon onClick={handleClick} sx={{marginLeft: "25px", cursor: "pointer"}}/>}
            {showMenu && <CompleteMenu setShowMenu={setShowMenu}/>}
        </div>
    );
}