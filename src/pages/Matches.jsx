import { useState, useEffect, useMemo } from 'react';
import { 
    collection, 
    query, 
    getDocs, 
    addDoc, 
    serverTimestamp, 
    where,
    // or,
    // and,
    getDoc,
    doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import Header from "../components/Header";
import Title from "../components/Title";
import TeamList from "../components/team/TeamList";
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '../styles/Matches.css';
import AddIcon from '@mui/icons-material/Add';
// import { useNavigate } from 'react-router-dom';

// Predefined list of sports
const AVAILABLE_SPORTS = ["Soccer", "Basketball", "Tennis", "Volleyball", "Football"];

export default function Matches() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teams, setTeams] = useState([]);
    const [selectedSport, setSelectedSport] = useState('');
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [openBookingDialog, setOpenBookingDialog] = useState(false);
    const [matchDateTime, setMatchDateTime] = useState(null);
    const [venue, setVenue] = useState('');
    const [success, setSuccess] = useState('');
    const [userTeams, setUserTeams] = useState([]);
    const [selectedUserTeam, setSelectedUserTeam] = useState('');
    const [teamsWithPendingRequests, setTeamsWithPendingRequests] = useState(new Set());
    // const [availableSports, setAvailableSports] = useState([]);
    const { user } = useAuth();
    // const navigate = useNavigate();

    // Get unique sports from user's teams where they are captain
    const captainSports = useMemo(() => {
        return [...new Set(userTeams
            .filter(team => team.captainId === user?.uid)
            .map(team => team.sport)
        )].sort();
    }, [userTeams, user?.uid]);

    

    useEffect(() => {
        const fetchUserTeams = async () => {
            if (!user?.uid) return [];
            
            try {
                const teamsRef = collection(db, 'teams');
                const teamsSnapshot = await getDocs(teamsRef);
                
                // Filter teams where user is either captain or player
                const userTeamsData = teamsSnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(team => {
                        // Check if user is captain or player
                        const players = team.players || {};
                        return Object.values(players).some(player => player.userId === user.uid);
                    });

                setUserTeams(userTeamsData);
                return userTeamsData;
            } catch (error) {
                console.error('Error fetching user teams:', error);
                return [];
            }
        };


        const fetchTeamsWithPendingRequests = async () => {
            try {
                const matchesRef = collection(db, 'matches');
                const pendingMatchesQuery = query(
                    matchesRef, 
                    where('status', '==', 'pending')
                );
                const pendingMatchesSnapshot = await getDocs(pendingMatchesQuery);
                
                const pendingTeams = new Set();
                pendingMatchesSnapshot.docs.forEach(doc => {
                    const match = doc.data();
                    pendingTeams.add(match.teamA);
                    pendingTeams.add(match.teamB);
                });
                
                setTeamsWithPendingRequests(pendingTeams);
                return pendingTeams;
            } catch (error) {
                console.error('Error fetching teams with pending requests:', error);
                return new Set();
            }
        };

        const fetchTeams = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                setError(null);

                // First get user's teams
                const userTeamsData = await fetchUserTeams();
                const userTeamIds = new Set(userTeamsData.map(team => team.id));

                // Get teams with pending requests
                const pendingTeams = await fetchTeamsWithPendingRequests();

                // Then get all other teams
                const teamsRef = collection(db, 'teams');
                const querySnapshot = await getDocs(teamsRef);

                const teamsData = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(team => 
                        !userTeamIds.has(team.id) && // Exclude user's teams
                        !pendingTeams.has(team.id) // Exclude teams with pending requests
                    );

                setTeams(teamsData);
                
                // Set initial sport selection if none selected
                const userCaptainTeams = userTeamsData.filter(team => team.captainId === user.uid);
                if (userCaptainTeams.length > 0 && !selectedSport) {
                    setSelectedSport(userCaptainTeams[0].sport);
                }

            } catch (error) {
                console.error('Error fetching teams:', error);
                setError('Failed to load teams. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [selectedSport, user.uid]);

    const handleSportChange = (event) => {
        setSelectedSport(event.target.value);
        setSelectedUserTeam(''); // Reset selected user team when sport changes
        setSelectedTeam(null); // Reset selected opponent team
    };

    const handleTeamSelect = (team) => {
        setSelectedTeam(team);
        
        // Filter user teams by selected sport and ensure user is captain
        const eligibleTeams = userTeams.filter(t => 
            t.sport === team.sport && 
            t.captainId === user.uid &&
            t.leagueNumber === team.leagueNumber
        );
        
        if (eligibleTeams.length === 0) {
            setError('You must be a team captain to send match requests');
            return;
        }
        
        if (eligibleTeams.length === 1) {
            setSelectedUserTeam(eligibleTeams[0].id);
        }
        
        setOpenBookingDialog(true);
        setError(null); // Clear any previous errors
    };

    const handleBookMatch = async () => {
        if (!selectedTeam || !matchDateTime || !venue || !selectedUserTeam) {
            setError('Please fill in all fields');
            return;
        }

        try {
            // Verify user is still the captain
            const userTeam = userTeams.find(t => t.id === selectedUserTeam);
            if (!userTeam || userTeam.captainId !== user.uid) {
                setError('You must be the team captain to send match requests');
                return;
            }

            // Verify the selected team doesn't have pending requests
            if (teamsWithPendingRequests.has(selectedTeam.id)) {
                setError('This team already has a pending match request');
                return;
            }

            // Get the opponent team's captain ID
            const teamsRef = collection(db, 'teams');
            const opponentTeamDoc = await getDoc(doc(teamsRef, selectedTeam.id));
            if (!opponentTeamDoc.exists()) {
                setError('Selected team no longer exists');
                return;
            }
            const opponentTeamData = opponentTeamDoc.data();
            
            // Add match to Firestore
            await addDoc(collection(db, 'matches'), {
                teamA: selectedUserTeam,
                teamAName: userTeam.teamName,
                teamACaptainId: userTeam.captainId, // Add requesting team's captain ID
                teamB: selectedTeam.id,
                teamBName: selectedTeam.teamName,
                teamBCaptainId: opponentTeamData.captainId, // Add opponent team's captain ID
                sport: selectedTeam.sport,
                dateTime: matchDateTime.toISOString(),
                venue: venue,
                status: 'pending',
                createdAt: serverTimestamp(),
                createdBy: user.uid
            });

            setSuccess('Match request sent successfully!');
            setOpenBookingDialog(false);
            setSelectedTeam(null);
            setSelectedUserTeam('');
            setMatchDateTime(null);
            setVenue('');
            
            // Refresh the teams list to update pending requests
            // The useEffect will handle fetching all data again
        } catch (error) {
            console.error('Error booking match:', error);
            setError('Failed to book match. Please try again.');
        }
    };

    // Filter teams by selected sport and league number
    const filteredTeams = useMemo(() => {
        if (!selectedSport) return [];
        
        // First filter by selected sport
        const teamsBySport = teams.filter(team => team.sport === selectedSport);

        // If a user team is selected, filter by league number
        if (selectedUserTeam) {
            const userTeam = userTeams.find(t => t.id === selectedUserTeam);
            return teamsBySport.filter(team => team.leagueNumber === userTeam?.leagueNumber);
        }

        // If no user team selected, show all teams for the selected sport
        return teamsBySport;
    }, [teams, selectedSport, selectedUserTeam, userTeams]);

    // Get eligible user teams for the selected opponent team's sport
    const eligibleUserTeams = useMemo(() => {
        if (!selectedTeam) return [];
        
        return userTeams.filter(team => 
            team.sport === selectedTeam.sport && 
            team.captainId === user?.uid &&
            team.leagueNumber === selectedTeam.leagueNumber
        );
    }, [selectedTeam, userTeams, user?.uid]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header />
            <Title />
            <Container
                maxWidth="lg"
                sx={{
                    py: 4,
                    px: { xs: 2, sm: 3, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch'
                }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    <Typography variant="h4" component="h1" sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        fontFamily: 'Russo One'
                    }} className='title'>
                        Book a Match
                    </Typography>

                    {userTeams.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>Select Sport</InputLabel>
                                <Select
                                    value={selectedSport}
                                    onChange={handleSportChange}
                                    label="Select Sport"
                                >
                                    {captainSports.map((sport) => (
                                        <MenuItem key={sport} value={sport}>
                                            {sport}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {selectedSport && userTeams.filter(team => team.sport === selectedSport).length > 0 && (
                                <FormControl sx={{ minWidth: 200 }}>
                                    <InputLabel>Select Your Team</InputLabel>
                                    <Select
                                        value={selectedUserTeam}
                                        onChange={(e) => setSelectedUserTeam(e.target.value)}
                                        label="Select Your Team"
                                    >
                                        {userTeams
                                            .filter(team => team.sport === selectedSport)
                                            .map(team => (
                                                <MenuItem key={team.id} value={team.id}>
                                                    {team.teamName} (League {team.leagueNumber})
                                                </MenuItem>
                                            ))
                                        }
                                    </Select>
                                </FormControl>
                            )}
                        </Box>
                    )}
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : captainSports.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        You need to be a team captain to book matches. Please create a team or ask your team captain to make match requests.
                    </Alert>
                ) : filteredTeams.length === 0 && selectedSport && selectedUserTeam ? (
                    <Box 
                        textAlign="center" 
                        py={4}
                        sx={{
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                            p: 4,
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        <Typography variant="h6" color="text.secondary">
                            No teams found in League {userTeams.find(t => t.id === selectedUserTeam)?.leagueNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Teams can only match with others in the same league
                        </Typography>
                    </Box>
                ) : (
                    <TeamList
                        teams={filteredTeams}
                        onTeamSelect={handleTeamSelect}
                        userId={user?.uid}
                        showBookButton
                    />
                )}

                {/* Booking Dialog */}
                <Dialog
                    open={openBookingDialog}
                    onClose={() => setOpenBookingDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    sx={{
                        '& .MuiDialog-paper': {
                            borderRadius: '8px'
                        }
                    }}
                >
                    <DialogTitle sx={{
                        borderBottom: '1px solid #eee',
                        pb: 2,
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Book Match with {selectedTeam?.teamName}
                    </DialogTitle>
                    <DialogContent sx={{ py: 3 }}>
                        <Box sx={{ mt: 2 }}>
                            {eligibleUserTeams.length > 1 && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Select Your Team</InputLabel>
                                    <Select
                                        value={selectedUserTeam}
                                        onChange={(e) => setSelectedUserTeam(e.target.value)}
                                        label="Select Your Team"
                                        sx={{
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {eligibleUserTeams.map(team => (
                                            <MenuItem key={team.id} value={team.id}>
                                                {team.teamName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    label="Match Date & Time"
                                    value={matchDateTime}
                                    onChange={(newValue) => {
                                        try {
                                            const date = newValue ? new Date(newValue) : null;
                                            if (date && !isNaN(date.getTime())) {
                                                setMatchDateTime(date);
                                            } else {
                                                setMatchDateTime(null);
                                            }
                                        } catch (error) {
                                            console.error('Error parsing date:', error);
                                            setMatchDateTime(null);
                                        }
                                    }}
                                    minDateTime={new Date()}
                                    views={['year', 'month', 'day', 'hours', 'minutes']}
                                    format="yyyy/MM/dd hh:mm a"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: matchDateTime === null,
                                            helperText: matchDateTime === null ? 'Please select a valid date and time' : '',
                                            sx: {
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '8px'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Box>
                        <TextField
                            margin="normal"
                            label="Venue"
                            fullWidth
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            error={!venue}
                            helperText={!venue ? 'Please enter a venue' : ''}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px'
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{
                        borderTop: '1px solid #eee',
                        p: 2,
                        gap: 1
                    }}>
                        <Button 
                            onClick={() => setOpenBookingDialog(false)}
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                bgcolor: '#666',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#555'
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleBookMatch} 
                            disabled={!selectedUserTeam || !matchDateTime || !venue}
                            sx={{
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                bgcolor: '#2CBB34',
                                color: 'white',
                                fontWeight: 'bold',
                                '&:hover': {
                                    bgcolor: '#25a32a'
                                },
                                '&:disabled': {
                                    bgcolor: '#ccc'
                                }
                            }}
                        >
                            Send Request
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={!!success || !!error}
                    autoHideDuration={6000}
                    onClose={() => {
                        setSuccess('');
                        setError(null);
                    }}
                >
                    <Alert
                        onClose={() => {
                            setSuccess('');
                            setError(null);
                        }}
                        severity={success ? 'success' : 'error'}
                        sx={{ 
                            width: '100%',
                            borderRadius: '8px'
                        }}
                    >
                        {success || error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}