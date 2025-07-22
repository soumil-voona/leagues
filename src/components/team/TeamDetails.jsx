export default function TeamDetails(props) {
    return (
        <div>
            <p className='team-name'>{props.name.toLowerCase()}</p>
            <p className='team-details'>Current League - {props.sport[0]} League {props.leagueNumber} </p>
            <p className='team-details'>Record (w/d/l) - {props.record} </p>
        </div>
    );
}