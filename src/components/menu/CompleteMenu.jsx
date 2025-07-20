import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from './MenuItem';
import '../../styles/menu/CompleteMenu.css';

export default function CompleteMenu(props) {
    return (
        <div className="menu">
            <MenuIcon onClick={() => props.setShowMenu(false)} sx={{ marginLeft: "25px", cursor: "pointer" }} />
            <div className='menu-items'>
                <MenuItem content="Home" location="/" />
                <MenuItem content="Teams" location="/teams" />
                <MenuItem content="Leagues" location="/leagues" />
                <MenuItem content="Stats" location="/stats" />
                <MenuItem content="Book A Match" location="/matches" />
                <MenuItem content="Current Match Requests" location="/requests" />
                <MenuItem content="Upcoming matches" location="/upcoming" />
            </div>
        </div>
    );
}