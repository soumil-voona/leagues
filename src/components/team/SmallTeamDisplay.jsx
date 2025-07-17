import Icon from './Icon';
export default function SmallTeamDisplay(props) {
    return (
        <div className="team-container">
            <div className="team-header">
                <div className="sport-icon">
                    <Icon sport={props.sport} />
                </div>
                <h2 className="team-name">{props.teamName}</h2>
            </div>
            <div className="team-details">
                <div className="detail-item">
                    <span className="detail-label">Players</span>
                    <span className="detail-value">{props.playerCount}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">League</span>
                    <span className="detail-value">{props.league}</span>
                </div>
            </div>
        </div>
    );
}
