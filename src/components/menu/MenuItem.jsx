import '../../styles/menu/MenuItem.css';
import ChangeURLButton from '../ChangeURLButton';

export default function MenuItem(props) {
    return (
        <div className='menu-item'>
            <ChangeURLButton location={props.location}>
                <p className='menu-content'>{props.content}</p>
            </ChangeURLButton>
        </div>
    );
}