import { Grid, Typography, Box } from '@mui/material';
import Team from './Team';
import PropTypes from 'prop-types';

export default function TeamList({ teams, onTeamUpdate, onTeamSelect, userId, showBookButton }) {
    if (!teams || teams.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                    No teams found
                </Typography>
            </Box>
        );
    }

    return (
        <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            sx={{
                width: '100%',
                margin: '0 auto',
                '& .MuiGrid-item': {
                    display: 'flex',
                    justifyContent: 'center'
                }
            }}
        >
            {teams.map(team => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={team.id}>
                    <Team 
                        team={team} 
                        onTeamUpdate={onTeamUpdate}
                        onTeamSelect={onTeamSelect}
                        isCurrentUser={userId === team.captainId}
                        showBookButton={showBookButton}
                    />
                </Grid>
            ))}
        </Grid>
    );
}

TeamList.propTypes = {
    teams: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        sport: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired,
        playerUids: PropTypes.object.isRequired,
        playerCount: PropTypes.number.isRequired,
        leagueNumber: PropTypes.number.isRequired,
        captainId: PropTypes.string.isRequired,
        matches: PropTypes.shape({
            matchesWon: PropTypes.number.isRequired,
            matchesLost: PropTypes.number.isRequired,
            matchesTied: PropTypes.number.isRequired
        }).isRequired
    })).isRequired,
    onTeamUpdate: PropTypes.func,
    onTeamSelect: PropTypes.func,
    userId: PropTypes.string.isRequired,
    showBookButton: PropTypes.bool
};

TeamList.defaultProps = {
    onTeamUpdate: () => {},
    onTeamSelect: () => {},
    showBookButton: false
}; 