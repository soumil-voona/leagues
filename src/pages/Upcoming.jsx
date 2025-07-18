import { useState, useEffect } from 'react';
import { 
    collection, 
    query, 
    getDocs, 
    where,
    or,
    Timestamp,
    and,
    updateDoc,
    doc,
    increment
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Title from "../components/Title";
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Button,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
    Tabs,
    Tab
} from '@mui/material';
import {
    SportsScore as SportsScoreIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    Add as AddIcon,
    EmojiEvents as TrophyIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const styles = {
    container: {
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
    },
    card: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
        },
        transition: 'all 0.2s ease-in-out',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    cardContent: {
        p: 3,
        '&:last-child': { pb: 3 }
    },
    teamName: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1a237e',
        fontFamily: 'Russo One'
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        color: '#666'
    },
    icon: {
        fontSize: '1.2rem',
        color: '#2CBB34'
    },
    statusChip: {
        fontWeight: 'bold',
        borderRadius: '8px',
        bgcolor: '#e3f2fd',
        color: '#1976d2'
    },
    noMatchesBox: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        textAlign: 'center',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        p: 4,
        border: '1px solid rgba(0, 0, 0, 0.05)'
    },
    scoreDialog: {
        '& .MuiDialog-paper': {
            borderRadius: '8px',
            minWidth: '300px'
        }
    },
    scoreInput: {
        '& .MuiOutlinedInput-root': {
            borderRadius: '8px'
        },
        mb: 2
    },
    scoreStatus: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mt: 2,
        p: 2,
        borderRadius: '8px',
        bgcolor: '#f8f9fa'
    },
    pendingChip: {
        bgcolor: '#fff3e0',
        color: '#e65100',
        fontWeight: 'bold',
        borderRadius: '8px'
    },
    confirmedChip: {
        bgcolor: '#e8f5e9',
        color: '#2e7d32',
        fontWeight: 'bold',
        borderRadius: '8px'
    },
    winChip: {
        bgcolor: '#e8f5e9',
        color: '#2e7d32',
        fontWeight: 'bold',
        borderRadius: '8px',
        '& .MuiChip-label': {
            px: 2
        }
    },
    lossChip: {
        bgcolor: '#ffebee',
        color: '#c62828',
        fontWeight: 'bold',
        borderRadius: '8px',
        '& .MuiChip-label': {
            px: 2
        }
    },
    drawChip: {
        bgcolor: '#fff3e0',
        color: '#e65100',
        fontWeight: 'bold',
        borderRadius: '8px',
        '& .MuiChip-label': {
            px: 2
        }
    }
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Date not set';
    
    try {
        const date = new Date(timestamp);
        return format(date, 'PPp');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

export default function Matches() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [matches, setMatches] = useState([]);
    const [activeTab, setActiveTab] = useState(0); // 0 for upcoming, 1 for past
    const [scoreDialog, setScoreDialog] = useState({
        open: false,
        match: null
    });
    const [scoreInput, setScoreInput] = useState({
        teamA: '',
        teamB: ''
    });
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchUserTeams = async () => {
        if (!user?.uid) return [];
        
        try {
            const teamsRef = collection(db, 'teams');
            const teamsSnapshot = await getDocs(teamsRef);
            
            // Filter teams where user is either captain or player
            return teamsSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(team => {
                    // Check if user is captain
                    if (team.captainId === user.uid) return true;
                    
                    // Check if user is a player
                    const players = team.players || {};
                    return Object.values(players).some(player => player.userId === user.uid);
                });
        } catch (error) {
            console.error('Error fetching user teams:', error);
            setError('Failed to fetch teams. Please try again.');
            return [];
        }
    };

    const fetchMatches = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get all user's teams
            const teams = await fetchUserTeams();
            if (teams.length === 0) {
                setMatches([]);
                setLoading(false);
                return;
            }

            const userTeamIds = teams.map(team => team.id);
            const now = new Date().toISOString();

            // Fetch matches where user's teams are involved
            const matchesRef = collection(db, 'matches');
            const matchesQuery = query(matchesRef, 
                where('status', '==', 'accepted')
            );

            const matchesSnapshot = await getDocs(matchesQuery);
            const matchesData = matchesSnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    userTeams: [doc.data().teamA, doc.data().teamB].filter(teamId => 
                        userTeamIds.includes(teamId)
                    )
                }))
                .filter(match => 
                    userTeamIds.includes(match.teamA) || userTeamIds.includes(match.teamB)
                )
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

            setMatches(matchesData);
        } catch (error) {
            console.error('Error fetching matches:', error);
            setError('Failed to load matches. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreSubmit = async () => {
        if (!scoreDialog.match) return;

        try {
            const match = scoreDialog.match;
            const userTeam = match.userTeams[0]; // Get the first team the user is part of
            const isTeamA = userTeam === match.teamA;
            
            const scoreUpdate = {
                scores: {
                    ...(match.scores || {}),
                    [userTeam]: {
                        teamA: parseInt(scoreInput.teamA),
                        teamB: parseInt(scoreInput.teamB),
                        submittedBy: user.uid,
                        submittedAt: new Date().toISOString()
                    }
                }
            };

            // If both teams have submitted scores and they match, mark as confirmed
            const otherTeamScore = match.scores?.[isTeamA ? match.teamB : match.teamA];
            if (otherTeamScore && 
                otherTeamScore.teamA === parseInt(scoreInput.teamA) && 
                otherTeamScore.teamB === parseInt(scoreInput.teamB)) {
                scoreUpdate.scoreConfirmed = true;
                scoreUpdate.finalScore = {
                    teamA: parseInt(scoreInput.teamA),
                    teamB: parseInt(scoreInput.teamB)
                };

                // Update team statistics
                const teamARefs = doc(db, 'teams', match.teamA);
                const teamBRefs = doc(db, 'teams', match.teamB);

                const teamAScore = scoreUpdate.finalScore.teamA;
                const teamBScore = scoreUpdate.finalScore.teamB;

                // Determine match result for Team A
                let teamAResult = 'tied';
                if (teamAScore > teamBScore) teamAResult = 'won';
                if (teamAScore < teamBScore) teamAResult = 'lost';

                // Update Team A stats
                await updateDoc(teamARefs, {
                    matches: {
                        matchesWon: increment(teamAResult === 'won' ? 1 : 0),
                        matchesLost: increment(teamAResult === 'lost' ? 1 : 0),
                        matchesTied: increment(teamAResult === 'tied' ? 1 : 0)
                    }
                });

                // Update Team B stats (opposite of Team A)
                await updateDoc(teamBRefs, {
                    matches: {
                        matchesWon: increment(teamAResult === 'lost' ? 1 : 0),
                        matchesLost: increment(teamAResult === 'won' ? 1 : 0),
                        matchesTied: increment(teamAResult === 'tied' ? 1 : 0)
                    }
                });
            }

            await updateDoc(doc(db, 'matches', match.id), scoreUpdate);
            
            setSuccess('Score submitted successfully!');
            setScoreDialog({ open: false, match: null });
            setScoreInput({ teamA: '', teamB: '' });
            fetchMatches(); // Refresh matches
        } catch (error) {
            console.error('Error submitting score:', error);
            setError('Failed to submit score. Please try again.');
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [user]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filteredMatches = matches.filter(match => {
        const matchDate = new Date(match.dateTime);
        const now = new Date();
        return activeTab === 0 ? matchDate > now : matchDate <= now;
    });

    const canSubmitScore = (match) => {
        const userTeam = match.userTeams[0];
        const isTeamA = userTeam === match.teamA;
        const otherTeam = isTeamA ? match.teamB : match.teamA;
        
        // If score is already confirmed, no one can submit
        if (match.scoreConfirmed) return false;
        
        // If user's team hasn't submitted yet, they can submit
        if (!match.scores?.[userTeam]) return true;
        
        // If other team has submitted different scores, user can submit again
        const otherTeamScore = match.scores?.[otherTeam];
        if (otherTeamScore) {
            const userTeamScore = match.scores[userTeam];
            return otherTeamScore.teamA !== userTeamScore.teamA || 
                   otherTeamScore.teamB !== userTeamScore.teamB;
        }
        
        return false;
    };

    const getMatchResult = (match, userTeamId) => {
        if (!match.scoreConfirmed) return null;
        
        const isTeamA = userTeamId === match.teamA;
        const userScore = isTeamA ? match.finalScore.teamA : match.finalScore.teamB;
        const opponentScore = isTeamA ? match.finalScore.teamB : match.finalScore.teamA;
        
        if (userScore > opponentScore) return 'WIN';
        if (userScore < opponentScore) return 'LOSS';
        return 'DRAW';
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header />
            <Title />
            <Container maxWidth="lg" sx={styles.container}>
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
                    }}>
                        Matches
                    </Typography>
                </Box>

                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    sx={{ mb: 3 }}
                >
                    <Tab 
                        icon={<ScheduleIcon />}
                        label="Upcoming" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<TrophyIcon />}
                        label="Past" 
                        iconPosition="start"
                    />
                </Tabs>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : filteredMatches.length === 0 ? (
                    <Box sx={styles.noMatchesBox}>
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                mb: 2,
                                fontWeight: 'bold',
                                color: '#333',
                                fontFamily: 'Russo One'
                            }}
                        >
                            No {activeTab === 0 ? 'Upcoming' : 'Past'} Matches
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                mb: 4,
                                color: '#666',
                                maxWidth: '600px'
                            }}
                        >
                            {activeTab === 0 ? 
                                "You don't have any upcoming matches scheduled. Book a match to get started!" :
                                "You haven't played any matches yet. Book a match to get started!"
                            }
                        </Typography>
                        {activeTab === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate('/matches')}
                                sx={{ 
                                    bgcolor: '#2CBB34',
                                    fontWeight: 'bold',
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    px: 4,
                                    py: 1.5,
                                    boxShadow: '0 2px 12px rgba(44, 187, 52, 0.3)',
                                    '&:hover': {
                                        bgcolor: '#25a32a',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(44, 187, 52, 0.4)'
                                    },
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                Book a Match
                            </Button>
                        )}
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {filteredMatches.map((match) => (
                            <Card key={match.id} sx={styles.card}>
                                <CardContent sx={styles.cardContent}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography sx={styles.teamName}>
                                            {match.teamAName.toUpperCase()} vs {match.teamBName.toUpperCase()}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            {match.scoreConfirmed ? (
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    {match.userTeams.map(teamId => {
                                                        const result = getMatchResult(match, teamId);
                                                        const isTeamA = teamId === match.teamA;
                                                        const score = `${isTeamA ? match.finalScore.teamA : match.finalScore.teamB} - ${isTeamA ? match.finalScore.teamB : match.finalScore.teamA}`;
                                                        return (
                                                            <Chip
                                                                key={teamId}
                                                                label={`${result} (${score})`}
                                                                sx={
                                                                    result === 'WIN' ? styles.winChip :
                                                                    result === 'LOSS' ? styles.lossChip :
                                                                    styles.drawChip
                                                                }
                                                            />
                                                        );
                                                    })}
                                                </Box>
                                            ) : activeTab === 1 && (
                                                <Chip
                                                    label="Score Pending"
                                                    sx={styles.pendingChip}
                                                />
                                            )}
                                            <Chip
                                                label={activeTab === 0 ? "Upcoming" : "Past"}
                                                sx={styles.statusChip}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ my: 2 }}>
                                        <Box sx={styles.infoRow}>
                                            <SportsScoreIcon sx={styles.icon} />
                                            <Typography>{match.sport}</Typography>
                                        </Box>
                                        <Box sx={styles.infoRow}>
                                            <CalendarIcon sx={styles.icon} />
                                            <Typography>
                                                {formatDateTime(match.dateTime)}
                                            </Typography>
                                        </Box>
                                        <Box sx={styles.infoRow}>
                                            <LocationIcon sx={styles.icon} />
                                            <Typography>{match.venue}</Typography>
                                        </Box>
                                    </Box>

                                    {activeTab === 1 && !match.scoreConfirmed && canSubmitScore(match) && (
                                        <Button
                                            variant="contained"
                                            onClick={() => setScoreDialog({ open: true, match })}
                                            sx={{ 
                                                bgcolor: '#2CBB34',
                                                fontWeight: 'bold',
                                                textTransform: 'none',
                                                borderRadius: '8px',
                                                mt: 2,
                                                '&:hover': {
                                                    bgcolor: '#25a32a'
                                                }
                                            }}
                                        >
                                            Submit Score
                                        </Button>
                                    )}

                                    {activeTab === 1 && !match.scoreConfirmed && match.scores && (
                                        <Box sx={styles.scoreStatus}>
                                            <Typography variant="body2" color="text.secondary">
                                                Waiting for {match.scores[match.userTeams[0]] ? 'opponent' : 'your'} team to confirm score
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* Score Submission Dialog */}
                <Dialog 
                    open={scoreDialog.open} 
                    onClose={() => {
                        setScoreDialog({ open: false, match: null });
                        setScoreInput({ teamA: '', teamB: '' });
                    }}
                    sx={styles.scoreDialog}
                >
                    <DialogTitle sx={{
                        borderBottom: '1px solid #eee',
                        pb: 2,
                        fontWeight: 'bold',
                        color: '#333'
                    }}>
                        Submit Match Score
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            {scoreDialog.match?.teamAName} vs {scoreDialog.match?.teamBName}
                        </Typography>
                        
                        <TextField
                            label={`${scoreDialog.match?.teamAName} Score`}
                            type="number"
                            fullWidth
                            value={scoreInput.teamA}
                            onChange={(e) => setScoreInput(prev => ({ ...prev, teamA: e.target.value }))}
                            sx={styles.scoreInput}
                        />
                        
                        <TextField
                            label={`${scoreDialog.match?.teamBName} Score`}
                            type="number"
                            fullWidth
                            value={scoreInput.teamB}
                            onChange={(e) => setScoreInput(prev => ({ ...prev, teamB: e.target.value }))}
                            sx={styles.scoreInput}
                        />

                        <Typography variant="body2" color="text.secondary">
                            Both teams must submit matching scores to confirm the result.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{
                        borderTop: '1px solid #eee',
                        p: 2,
                        gap: 1
                    }}>
                        <Button 
                            onClick={() => {
                                setScoreDialog({ open: false, match: null });
                                setScoreInput({ teamA: '', teamB: '' });
                            }}
                            sx={{
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
                            onClick={handleScoreSubmit}
                            disabled={!scoreInput.teamA || !scoreInput.teamB}
                            sx={{
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
                            Submit Score
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