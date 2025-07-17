import Profile from '../Profile';

export default function Player(props) {
    return (
        <div className='player'>
            <Profile className='player-profile' />
            <p className='player-name'>{props.name} {props.isCaptain && "- C"}</p>
        </div>
    );
}