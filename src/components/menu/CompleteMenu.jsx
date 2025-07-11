import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from './MenuItem';
import '../../styles/menu/CompleteMenu.css';

export default function CompleteMenu(props) {
    return (
        <div className="menu">
            <MenuIcon onClick={() => props.setShowMenu(false)} sx={{marginLeft: "25px"}}/>
            <div className='menu-items'>
                <MenuItem content="Home" location="/homepage"/>
                <MenuItem content="Teams" location="/teams"/>
                <MenuItem content="Leagues" location="/leagues"/>
                <MenuItem content="Book A Match" location="/matches"/>
            </div>
        </div>
    );
}