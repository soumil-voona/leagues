import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import {Filter} from 'bad-words';
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
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsIcon from '@mui/icons-material/Sports';
import GroupsIcon from '@mui/icons-material/Groups';

const sports = ["Soccer", "Basketball", "Tennis", "Volleyball", "Football"];
const leagues = [1, 2, 3];

// Initialize profanity filter
const filter = new Filter();

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
    },
    userSelectionDialog: {
        '& .MuiDialog-paper': {
            width: '400px',
            maxWidth: '90%',
            borderRadius: '12px'
        }
    },
    userList: {
        width: '100%',
        maxHeight: '300px',
        overflowY: 'auto'
    },
    userListItem: {
        borderRadius: '8px',
        margin: '4px 0',
        '&:hover': {
            backgroundColor: '#f5f5f5'
        }
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
    const [matchingUsers, setMatchingUsers] = useState([]);
    const [userSelectionOpen, setUserSelectionOpen] = useState(false);
    const [pendingPlayerName, setPendingPlayerName] = useState('');

    const findUserByName = async (name) => {
        try {
            const usersRef = collection(db, 'users');
            const allUsersSnapshot = await getDocs(usersRef);
            const matches = [];

            console.log('Searching for user:', name);

            for (const doc of allUsersSnapshot.docs) {
                const userData = doc.data();
                console.log('Checking user document:', doc.id, userData);

                // Check name field
                if (userData.name === name) {
                    matches.push({
                        id: doc.id,
                        name: userData.name,
                        email: userData.email
                    });
                    continue;
                }

                // Check email field (both full email and username part)
                const email = userData.email || '';
                const username = email.split('@')[0];
                if (email === name || username === name) {
                    matches.push({
                        id: doc.id,
                        name: userData.name || username,
                        email: email
                    });
                }
            }

            console.log('Found matches:', matches);
            return matches;
        } catch (err) {
            console.error('Error finding user:', err);
            return [];
        }
    };

    const handleAddPlayer = async (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const newPlayer = playersInput.trim();
            if (newPlayer && !(newPlayer in players)) {
                console.log('Adding player:', newPlayer);
                const matches = await findUserByName(newPlayer);
                console.log('Found matches for player:', matches);

                if (matches.length === 0) {
                    setError(`User "${newPlayer}" not found. Please enter a valid username or email.`);
                    setPlayersInput('');
                    return;
                }

                if (matches.length === 1) {
                    // If only one match, add directly
                    addPlayerToTeam(matches[0]);
                } else {
                    // If multiple matches, show selection dialog
                    setMatchingUsers(matches);
                    setPendingPlayerName(newPlayer);
                    setUserSelectionOpen(true);
                }
                setPlayersInput('');
            }
        }
    };

    const addPlayerToTeam = (selectedUser) => {
        setPlayers({
            ...players,
            [selectedUser.name]: {
                name: selectedUser.name,
                isCaptain: false,
                userId: selectedUser.id,
                email: selectedUser.email
            }
        });
        setError('');
        setUserSelectionOpen(false);
        setMatchingUsers([]);
        setPendingPlayerName('');
    };

    const handleUserSelection = (selectedUser) => {
        addPlayerToTeam(selectedUser);
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

        // Check for inappropriate team name
        if (filter.isProfane(teamName)) {
            setError('Please choose an appropriate team name without offensive language.');
            return;
        }

        try {
            // Check if team name already exists - case insensitive
            const teamsRef = collection(db, 'teams');
            const teamNameLower = teamName.toLowerCase().trim();
            const teamQuery = query(teamsRef, where('teamNameLower', '==', teamNameLower));
            const existingTeams = await getDocs(teamQuery);

            if (!existingTeams.empty) {
                setError(`Team name "${teamName}" already exists. Please choose a different name.`);
                return;
            }

            const captainName = user.name || user.displayName || user.email.split('@')[0];
            console.log('Creating team with captain:', captainName); // Debug log
            const teamPlayers = {
                [captainName]: {
                    isCaptain: true,
                    userId: user.uid,
                    name: captainName,
                    email: user.email // Add captain's email
                },
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
                teamNameLower: teamName.toLowerCase().trim(), // Store lowercase version for case-insensitive comparison
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
        <>
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
                                    onChange={(e) => setPlayersInput(e.target.value.toLowerCase())}
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

            {/* User Selection Dialog */}
            <Dialog
                open={userSelectionOpen}
                onClose={() => setUserSelectionOpen(false)}
                sx={styles.userSelectionDialog}
            >
                <DialogTitle>
                    Multiple users found for "{pendingPlayerName}"
                    <Typography variant="subtitle2" color="text.secondary">
                        Please select the correct user
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <List sx={styles.userList}>
                        {matchingUsers.map((user) => (
                            <ListItem key={user.id} disablePadding>
                                <ListItemButton
                                    onClick={() => handleUserSelection(user)}
                                    sx={styles.userListItem}
                                >
                                    <ListItemText
                                        primary={user.name}
                                        secondary={user.email}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserSelectionOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 