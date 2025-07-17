import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Box, 
    Chip,
    Typography,
    IconButton,
    Paper
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsIcon from '@mui/icons-material/Sports';
import GroupsIcon from '@mui/icons-material/Groups';

const sports = ["Soccer", "Basketball", "Tennis", "Volleyball", "Football"];
const leagues = [1, 2, 3];

const styles = {
    dialog: {
        '& .MuiDialog-paper': {
            borderRadius: '16px',
            padding: '16px'
        }
    },
    dialogTitle: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 8px',
        '& h2': {
            fontSize: '24px',
            fontWeight: 600
        }
    },
    closeButton: {
        color: 'text.secondary'
    },
    content: {
        padding: '24px 16px !important'
    },
    section: {
        marginBottom: '24px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: 500,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: 'text.secondary'
    },
    formControl: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px'
        }
    },
    playerChips: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '16px'
    },
    chip: {
        borderRadius: '8px',
        '&.MuiChip-root': {
            backgroundColor: '#e3f2fd',
            '&:hover': {
                backgroundColor: '#bbdefb'
            }
        }
    },
    actions: {
        padding: '16px !important',
        gap: '12px'
    },
    createButton: {
        borderRadius: '10px',
        padding: '8px 24px',
        textTransform: 'none',
        fontWeight: 600
    },
    cancelButton: {
        borderRadius: '10px',
        padding: '8px 24px',
        textTransform: 'none'
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '16px'
    }
};

export default function CreateTeamModal({ open, onClose }) {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [sport, setSport] = useState('');
    const [leagueNumber, setLeagueNumber] = useState('');
    const [playersInput, setPlayersInput] = useState('');
    const [players, setPlayers] = useState({});
    const [error, setError] = useState('');

    const findUserByName = async (name) => {
        try {
            const usersRef = collection(db, 'users');
            const allUsersSnapshot = await getDocs(usersRef);
            
            console.log('Searching for user:', name);
            // Find user by checking each user document
            for (const doc of allUsersSnapshot.docs) {
                const userData = doc.data();
                console.log('Checking user document:', doc.id, userData);
                
                // Check name field
                if (userData.name === name) {
                    console.log('Found user by name:', doc.id);
                    return doc.id;
                }
                
                // Check email field (both full email and username part)
                const email = userData.email || '';
                const username = email.split('@')[0];
                if (email === name || username === name) {
                    console.log('Found user by email/username:', doc.id);
                    return doc.id;
                }
            }

            console.log('No user found for:', name);
            return null;
        } catch (err) {
            console.error('Error finding user:', err);
            return null;
        }
    };

    const handleAddPlayer = async (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const newPlayer = playersInput.trim();
            if (newPlayer && !(newPlayer in players)) {
                console.log('Adding player:', newPlayer); // Debug log
                // Try to find the user's UID immediately when adding
                const uid = await findUserByName(newPlayer);
                console.log('Found UID for player:', newPlayer, uid); // Debug log
                setPlayers({
                    ...players,
                    [newPlayer]: { 
                        name: newPlayer,
                        isCaptain: false,
                        userId: uid || null // Store the UID if found
                    }
                });
                setPlayersInput('');
            }
        }
    };

    const removePlayer = (playerToRemove) => {
        const updatedPlayers = { ...players };
        delete updatedPlayers[playerToRemove];
        setPlayers(updatedPlayers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!teamName || !sport || !leagueNumber || !user) {
            setError('Please fill in all fields and ensure you are logged in');
            return;
        }

        try {
            const captainName = user.name || user.displayName || user.email.split('@')[0];
            console.log('Creating team with captain:', captainName); // Debug log
            const teamPlayers = {
                [captainName]: { isCaptain: true, userId: user.uid, name: captainName },
                ...players
            };

            // Find UIDs for all players
            const playerUids = {
                [captainName]: user.uid // Add captain's UID
            };

            // Look up UIDs for other players
            console.log('Looking up UIDs for players:', Object.keys(players)); // Debug log
            for (const [playerName, playerData] of Object.entries(players)) {
                // If we already found the UID when adding the player, use that
                if (playerData.userId) {
                    console.log('Using cached UID for player:', playerName, playerData.userId); // Debug log
                    playerUids[playerName] = playerData.userId;
                } else {
                    // Otherwise try to find it again
                    console.log('Looking up UID for player:', playerName); // Debug log
                    const uid = await findUserByName(playerName);
                    console.log('Found UID:', uid); // Debug log
                    if (uid) {
                        playerUids[playerName] = uid;
                        // Update the players object with the found UID
                        teamPlayers[playerName].userId = uid;
                    }
                }
            }

            console.log('Final team data:', { teamPlayers, playerUids }); // Debug log

            await addDoc(collection(db, 'teams'), {
                teamName,
                sport,
                players: teamPlayers,
                playerUids,
                playerCount: Object.keys(teamPlayers).length,
                leagueNumber: parseInt(leagueNumber),
                createdAt: serverTimestamp(),
                captainId: user.uid,
                matches: { matchesWon: 0, matchesLost: 0, matchesTied: 0 }
            });
            
            // Reset form
            setTeamName('');
            setSport('');
            setLeagueNumber('');
            setPlayers({});
            setError('');
            onClose();
        } catch (err) {
            console.error('Error adding team: ', err);
            setError('Failed to create team. Please try again.');
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            sx={styles.dialog}
        >
            <DialogTitle sx={styles.dialogTitle}>
                <Typography variant="h2">Create New Team</Typography>
                <IconButton 
                    onClick={onClose}
                    size="small"
                    sx={styles.closeButton}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={styles.content}>
                    {error && (
                        <Paper elevation={0} sx={styles.error}>
                            <Typography>{error}</Typography>
                        </Paper>
                    )}
                    
                    <Box sx={styles.section}>
                        <Typography sx={styles.sectionTitle}>
                            <GroupsIcon fontSize="small" />
                            Team Information
                        </Typography>
                        <TextField
                            autoFocus
                            fullWidth
                            label="Team Name"
                            variant="outlined"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            sx={styles.formControl}
                        />
                    </Box>

                    <Box sx={styles.section}>
                        <Typography sx={styles.sectionTitle}>
                            <SportsIcon fontSize="small" />
                            Sport & League Details
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth sx={styles.formControl}>
                                <InputLabel>Sport</InputLabel>
                                <Select
                                    value={sport}
                                    label="Sport"
                                    onChange={(e) => setSport(e.target.value)}
                                >
                                    {sports.map((sport) => (
                                        <MenuItem key={sport} value={sport}>
                                            {sport}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={styles.formControl}>
                                <InputLabel>League #</InputLabel>
                                <Select
                                    value={leagueNumber}
                                    label="League #"
                                    onChange={(e) => setLeagueNumber(e.target.value)}
                                >
                                    {leagues.map((num) => (
                                        <MenuItem key={num} value={num}>
                                            {num}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    <Box sx={styles.section}>
                        <Typography sx={styles.sectionTitle}>
                            <PersonAddIcon fontSize="small" />
                            Team Members
                        </Typography>
                        <FormControl fullWidth sx={styles.formControl}>
                            <TextField
                                label="Add Team Members"
                                value={playersInput}
                                onChange={(e) => setPlayersInput(e.target.value)}
                                onKeyDown={handleAddPlayer}
                                placeholder="Type names and press comma or enter"
                                variant="outlined"
                                helperText="Press comma or enter to add members"
                            />
                            <Box sx={styles.playerChips}>
                                {Object.entries(players).map(([playerName]) => (
                                    <Chip
                                        key={playerName}
                                        label={playerName}
                                        onDelete={() => removePlayer(playerName)}
                                        sx={styles.chip}
                                    />
                                ))}
                            </Box>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={styles.actions}>
                    <Button 
                        onClick={onClose} 
                        sx={styles.cancelButton}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        sx={styles.createButton}
                    >
                        Create Team
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
