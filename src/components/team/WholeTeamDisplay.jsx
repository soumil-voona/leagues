import Player from './Player';
import TeamDetails from './TeamDetails';

export default function WholeTeamDisplay(props) {
    return (
        <div>
            <TeamDetails name={props.name} leagueNumber={props.leagueNumber} record={props.record} sport={props.sport}/>
            {props.players.map((player) => <Player name={player.name} isCaptain={player.isCaptain}/>)}
        </div>
    );
}