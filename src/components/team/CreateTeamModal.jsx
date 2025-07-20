import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Filter } from 'bad-words';
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
    ListItemButton,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SportsIcon from '@mui/icons-material/Sports';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';

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
    }
};

export default function CreateTeamModal({ open, onClose }) {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [sport, setSport] = useState('');
    const [leagueNumber, setLeagueNumber] = useState('');
    const [players, setPlayers] = useState({});
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const searchUsers = async (searchText) => {
        if (!searchText || searchText.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const usersRef = collection(db, 'users');
            const allUsersSnapshot = await getDocs(usersRef);
            const searchTextLower = searchText.toLowerCase();

            const matches = allUsersSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(userData => {
                    // Don't show current user
                    if (userData.id === user.uid) return false;

                    // Don't show already added players
                    if (players[userData.name]) return false;

                    // Search in name and email
                    const name = (userData.name || '').toLowerCase();
                    const email = (userData.email || '').toLowerCase();
                    const username = email.split('@')[0];

                    return name.includes(searchTextLower) ||
                        email.includes(searchTextLower) ||
                        username.includes(searchTextLower);
                })
                .slice(0, 5); // Limit to 5 results

            setSearchResults(matches);
        } catch (err) {
            console.error('Error searching users:', err);
            setError('Failed to search users. Please try again.');
        } finally {
            setSearching(false);
        }
    };

    const handleAddPlayer = async (selectedUser) => {
        if (!selectedUser) return;

        try {
            // Check if there's already a pending invite for this user
            const invitesRef = collection(db, 'teamInvites');
            const existingInviteQuery = query(
                invitesRef,
                where('teamName', '==', teamName),
                where('invitedUserId', '==', selectedUser.id),
                where('status', '==', 'pending')
            );
            const existingInvites = await getDocs(existingInviteQuery);

            if (!existingInvites.empty) {
                setError(`An invite for ${selectedUser.name} is already pending.`);
                return;
            }

            // Add to temporary players list with pending status
            setPlayers(prev => ({
                ...prev,
                [selectedUser.name]: {
                    name: selectedUser.name,
                    isCaptain: false,
                    userId: selectedUser.id,
                    email: selectedUser.email,
                    status: 'pending'
                }
            }));

            setSearchQuery('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error checking invites:', err);
            setError('Failed to add player. Please try again.');
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

            // Check if user already has a team in this sport and league
            const userTeamsQuery = query(
                teamsRef,
                where('captainId', '==', user.uid),
                where('sport', '==', sport),
                where('leagueNumber', '==', parseInt(leagueNumber))
            );
            const userTeamsSnapshot = await getDocs(userTeamsQuery);

            if (!userTeamsSnapshot.empty) {
                setError(`You already have a team in ${sport} League ${leagueNumber}. You can't create multiple teams in the same sport and league.`);
                return;
            }

            const captainName = user.name || user.displayName || user.email.split('@')[0];
            const teamPlayers = {
                [captainName]: {
                    isCaptain: true,
                    userId: user.uid,
                    name: captainName,
                    email: user.email,
                    status: 'accepted'
                }
            };

            // Create the team first
            const teamDocRef = await addDoc(collection(db, 'teams'), {
                teamName,
                teamNameLower: teamName.toLowerCase().trim(),
                sport,
                players: teamPlayers,
                playerCount: 1, // Start with just the captain
                leagueNumber: parseInt(leagueNumber),
                createdAt: serverTimestamp(),
                captainId: user.uid,
                matches: { matchesWon: 0, matchesLost: 0, matchesTied: 0 }
            });

            // Send invites to all pending players
            const invitesRef = collection(db, 'teamInvites');
            const invitePromises = Object.entries(players).map(([playerName, playerData]) =>
                addDoc(invitesRef, {
                    teamId: teamDocRef.id,
                    teamName: teamName,
                    sport: sport,
                    leagueNumber: parseInt(leagueNumber),
                    invitedUserId: playerData.userId,
                    invitedUserName: playerName,
                    invitedUserEmail: playerData.email,
                    captainId: user.uid,
                    captainName: captainName,
                    status: 'pending',
                    createdAt: serverTimestamp()
                })
            );

            await Promise.all(invitePromises);

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
                            <Autocomplete
                                freeSolo
                                options={searchResults}
                                getOptionLabel={(option) =>
                                    typeof option === 'string' ? option : option.name
                                }
                                filterOptions={(x) => x}
                                value={null}
                                inputValue={searchQuery}
                                onInputChange={(event, newValue) => {
                                    setSearchQuery(newValue);
                                    searchUsers(newValue);
                                }}
                                onChange={(event, newValue) => {
                                    if (newValue && typeof newValue !== 'string') {
                                        handleAddPlayer(newValue);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Team Members"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {searching ? (
                                                        <CircularProgress color="inherit" size={20} />
                                                    ) : (
                                                        <SearchIcon color="action" />
                                                    )}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            )
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <ListItem {...props}>
                                        <ListItemText
                                            primary={option.name}
                                            secondary={option.email}
                                        />
                                    </ListItem>
                                )}
                                noOptionsText={
                                    searchQuery.length < 2
                                        ? "Type at least 2 characters to search"
                                        : "No users found"
                                }
                            />
                            <Box sx={styles.playerChips}>
                                {Object.entries(players).map(([playerName, playerData]) => (
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