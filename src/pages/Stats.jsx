import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../hooks/useAuth';
import Header from "../components/Header";
import Title from "../components/Title";
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Card,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    SportsScore as SportsScoreIcon,
    Group as TeamIcon
} from '@mui/icons-material';

const styles = {
    container: {
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
    },
    teamCard: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
        }
    },
    teamHeader: {
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '& .MuiSvgIcon-root': {
            color: '#2CBB34'
        }
    },
    statBox: {
        p: 2,
        textAlign: 'center',
        borderRadius: '8px',
        bgcolor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        },
        transition: 'all 0.2s ease-in-out'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
    },
    error: {
        textAlign: 'center',
        py: 4,
        color: 'error.main'
    }
};

export default function Stats() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teams, setTeams] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTeams = async () => {
            if (!user?.uid) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Get all teams where user is a player
                const teamsRef = collection(db, 'teams');
                const teamsSnapshot = await getDocs(teamsRef);
                const userTeams = teamsSnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(team => {
                        const players = team.players || {};
                        return Object.values(players).some(player => player.userId === user.uid);
                    })
                    .sort((a, b) => {
                        // Sort by sport first, then league number
                        if (a.sport !== b.sport) {
                            return a.sport.localeCompare(b.sport);
                        }
                        return a.leagueNumber - b.leagueNumber;
                    });

                setTeams(userTeams);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching teams:', err);
                setError('Failed to load teams. Please try again later.');
                setLoading(false);
            }
        };

        fetchTeams();
    }, [user]);

    const calculateWinRate = (matches) => {
        const total = matches.matchesWon + matches.matchesLost + matches.matchesTied;
        if (total === 0) return 0;
        return ((matches.matchesWon / total) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <Box>
                <Header />
                <Title />
                <Box sx={styles.loading}>
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Header />
                <Title />
                <Container maxWidth="lg" sx={styles.container}>
                    <Typography color="error" sx={styles.error}>
                        {error}
                    </Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header />
            <Title />
            <Container maxWidth="lg" sx={styles.container}>
                <Box sx={styles.header}>
                    <Typography variant="h4" sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: { xs: '1.5rem', sm: '2rem' },
                        fontFamily: 'Russo One'
                    }}>
                        My Stats
                    </Typography>
                </Box>

                {teams.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            You are not part of any teams yet.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {teams.map((team) => (
                            <Grid item xs={12} key={team.id}>
                                <Card sx={styles.teamCard}>
                                    <Box sx={styles.teamHeader}>
                                        <TeamIcon />
                                        <Typography variant="h6" sx={{ fontFamily: 'Russo One', color: '#333', flex: 1 }}>
                                            {team.teamName.toUpperCase()}
                                        </Typography>
                                        <Chip
                                            icon={<SportsScoreIcon />}
                                            label={team.sport}
                                            sx={{
                                                borderRadius: '8px',
                                                bgcolor: '#e8f5e9',
                                                color: '#2e7d32',
                                                '& .MuiSvgIcon-root': { color: '#2e7d32' }
                                            }}
                                        />
                                        <Chip
                                            label={`League ${team.leagueNumber}`}
                                            sx={{
                                                borderRadius: '8px',
                                                bgcolor: '#e3f2fd',
                                                color: '#1976d2'
                                            }}
                                        />
                                        {team.players[Object.keys(team.players).find(key => team.players[key].userId === user.uid)]?.isCaptain && (
                                            <Chip
                                                label="Captain"
                                                sx={{
                                                    borderRadius: '8px',
                                                    bgcolor: '#fff3e0',
                                                    color: '#e65100'
                                                }}
                                            />
                                        )}
                                    </Box>
                                    <Box sx={{ p: 3 }}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={6} sm={3}>
                                                <Box sx={styles.statBox}>
                                                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                                        {team.matches?.matchesWon || 0}
                                                    </Typography>
                                                    <Typography color="text.secondary">Wins</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Box sx={styles.statBox}>
                                                    <Typography variant="h4" sx={{ color: '#c62828', fontWeight: 'bold' }}>
                                                        {team.matches?.matchesLost || 0}
                                                    </Typography>
                                                    <Typography color="text.secondary">Losses</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Box sx={styles.statBox}>
                                                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                        {team.matches?.matchesTied || 0}
                                                    </Typography>
                                                    <Typography color="text.secondary">Ties</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6} sm={3}>
                                                <Box sx={styles.statBox}>
                                                    <Typography variant="h4" sx={{ color: '#6a1b9a', fontWeight: 'bold' }}>
                                                        {calculateWinRate(team.matches || {})}%
                                                    </Typography>
                                                    <Typography color="text.secondary">Win Rate</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
} 