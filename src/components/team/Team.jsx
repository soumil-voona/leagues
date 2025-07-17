import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, IconButton, Collapse } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import Icon from './Icon';

const styles = {
    card: {
        width: '100%',
        maxWidth: '400px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)'
        },
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        margin: '0 auto'
    },
    content: {
        padding: '24px !important',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '20px'
    },
    iconContainer: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        fontSize: '24px'
    },
    teamName: {
        fontSize: '24px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: '#1a237e'
    },
    statsContainer: {
        display: 'flex',
        gap: '16px',
        marginTop: '16px'
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    statIcon: {
        color: '#5c6bc0',
        fontSize: '20px'
    },
    statText: {
        fontSize: '14px',
        color: '#424242',
        fontWeight: 500
    },
    leagueChip: {
        backgroundColor: '#e8eaf6',
        color: '#3949ab',
        fontWeight: 600,
        borderRadius: '8px'
    },
    membersSection: {
        marginTop: '24px',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        paddingTop: '24px'
    },
    membersList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    memberItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s ease',
        '&:hover': {
            transform: 'translateX(4px)'
        }
    },
    captainItem: {
        backgroundColor: '#e3f2fd',
        border: '1px solid #90caf9'
    },
    memberIcon: {
        color: '#5c6bc0',
        fontSize: '20px'
    },
    captainIcon: {
        color: '#1976d2'
    },
    memberName: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#424242',
        flex: 1
    },
    captainBadge: {
        backgroundColor: '#bbdefb',
        color: '#1976d2',
        fontWeight: 600,
        fontSize: '12px',
        padding: '4px 8px',
        borderRadius: '6px'
    }
};

export default function Team({ team }) {
    const [expanded, setExpanded] = useState(false);
    
    const handleClick = () => {
        setExpanded(!expanded);
    };

    const getMatchesDisplay = () => {
        const { matchesWon = 0, matchesLost = 0, matchesTied = 0 } = team.matches || {};
        return `${matchesWon}W - ${matchesLost}L - ${matchesTied}T`;
    };

    return (
        <Card sx={styles.card} onClick={handleClick}>
            <CardContent sx={styles.content}>
                <Box sx={styles.header}>
                    <Box sx={styles.iconContainer}>
                        <Icon sport={team.sport} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={styles.teamName}>
                            {team.teamName}
                        </Typography>
                        <Chip 
                            label={`League ${team.leagueNumber}`}
                            size="small"
                            sx={styles.leagueChip}
                        />
                    </Box>
                </Box>
                
                <Box sx={styles.statsContainer}>
                    <Box sx={styles.statItem}>
                        <PersonIcon sx={styles.statIcon} />
                        <Typography sx={styles.statText}>
                            {team.playerCount} Players
                        </Typography>
                    </Box>
                    <Box sx={styles.statItem}>
                        <EmojiEventsIcon sx={styles.statIcon} />
                        <Typography sx={styles.statText}>
                            {getMatchesDisplay()}
                        </Typography>
                    </Box>
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={styles.membersSection}>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                fontWeight: 600, 
                                marginBottom: '16px',
                                color: '#1a237e'
                            }}
                        >
                            Team Members
                        </Typography>
                        <Box sx={styles.membersList}>
                            {Object.entries(team.players).map(([playerName, playerData]) => (
                                <Box 
                                    key={playerName}
                                    sx={{
                                        ...styles.memberItem,
                                        ...(playerData.isCaptain && styles.captainItem)
                                    }}
                                >
                                    {playerData.isCaptain ? (
                                        <StarIcon sx={{...styles.memberIcon, ...styles.captainIcon}} />
                                    ) : (
                                        <PersonIcon sx={styles.memberIcon} />
                                    )}
                                    <Typography sx={styles.memberName}>
                                        {playerName}
                                    </Typography>
                                    {playerData.isCaptain && (
                                        <Box component="span" sx={styles.captainBadge}>
                                            Captain
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Collapse>
            </CardContent>
        </Card>
    );
}