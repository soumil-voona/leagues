import { useState } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Chip, 
    IconButton, 
    Collapse,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import SportsIcon from '@mui/icons-material/Sports';
import DeleteIcon from '@mui/icons-material/Delete';
import Icon from './Icon';
import PropTypes from 'prop-types';
import { db } from '../../firebaseConfig';
import { doc, deleteDoc, collection, query, where, getDocs, or } from 'firebase/firestore';

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
    },
    actionButtons: {
        marginTop: 2,
        display: 'flex',
        gap: 1
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
        color: 'white',
        '&:hover': {
            backgroundColor: '#b71c1c'
        }
    },
    bookButton: {
        backgroundColor: '#2CBB34',
        color: 'white',
        '&:hover': {
            backgroundColor: '#25a32a'
        }
    },
    dialogTitle: {
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }
};

export default function Team({ team, onTeamSelect, onTeamUpdate, isCurrentUser, showBookButton }) {
    const [expanded, setExpanded] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleClick = () => {
        setExpanded(!expanded);
    };

    const handleBookClick = (e) => {
        e.stopPropagation(); // Prevent card expansion
        onTeamSelect(team);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent card expansion
        setDeleteDialogOpen(true);
    };

    const handleDeleteTeam = async () => {
        try {
            setIsDeleting(true);
            setDeleteError('');

            // Delete associated matches
            const matchesRef = collection(db, 'matches');
            const matchesQuery = query(matchesRef, 
                or(
                    where('teamA', '==', team.id),
                    where('teamB', '==', team.id)
                )
            );
            const matchesSnapshot = await getDocs(matchesQuery);
            
            // Delete all matches involving this team
            const deleteMatchPromises = matchesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteMatchPromises);

            // Delete the team
            await deleteDoc(doc(db, 'teams', team.id));
            
            setDeleteDialogOpen(false);
            if (onTeamUpdate) {
                onTeamUpdate(); // Refresh the teams list
            }
        } catch (error) {
            console.error('Error deleting team:', error);
            setDeleteError('Failed to delete team. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const getMatchesDisplay = () => {
        const { matchesWon = 0, matchesLost = 0, matchesTied = 0 } = team.matches || {};
        return `${matchesWon}W - ${matchesLost}L - ${matchesTied}T`;
    };

    return (
        <>
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
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                                <Chip 
                                    label={`League ${team.leagueNumber}`}
                                    size="small"
                                    sx={styles.leagueChip}
                                />
                                <Chip 
                                    icon={<SportsIcon sx={{ fontSize: '16px !important' }} />}
                                    label={team.sport}
                                    size="small"
                                    sx={styles.leagueChip}
                                />
                            </Box>
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
                        {isCurrentUser && (
                            <Button
                                variant="contained"
                                onClick={handleDeleteClick}
                                fullWidth
                                startIcon={<DeleteIcon />}
                                sx={styles.deleteButton}
                                style={{marginTop: '10px', borderRadius: '10px'}}
                            >
                                Delete Team
                            </Button>
                        )}
                    </Collapse>

                    <Stack direction="row" spacing={1} sx={styles.actionButtons}>
                        {showBookButton && (
                            <Button
                                variant="contained"
                                onClick={handleBookClick}
                                fullWidth
                                sx={styles.bookButton}
                            >
                                Book Match
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    Delete Team
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>
                        Are you sure you want to delete the team "{team.teamName}"? This action cannot be undone and will also delete all associated matches.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        color="primary"
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteTeam}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={20} /> : null}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Team'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

Team.propTypes = {
    team: PropTypes.shape({
        id: PropTypes.string.isRequired,
        teamName: PropTypes.string.isRequired,
        sport: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired,
        playerCount: PropTypes.number.isRequired,
        leagueNumber: PropTypes.number.isRequired,
        matches: PropTypes.shape({
            matchesWon: PropTypes.number,
            matchesLost: PropTypes.number,
            matchesTied: PropTypes.number
        })
    }).isRequired,
    onTeamSelect: PropTypes.func,
    onTeamUpdate: PropTypes.func,
    isCurrentUser: PropTypes.bool,
    showBookButton: PropTypes.bool
};

Team.defaultProps = {
    onTeamSelect: () => {},
    onTeamUpdate: () => {},
    isCurrentUser: false,
    showBookButton: false
};