import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where, or, and } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import {
    Container,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Avatar,
    Chip,
    Grid,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import Header from "../components/Header";
import Title from "../components/Title";

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
    backButton: {
        borderRadius: '8px',
        textTransform: 'none',
        py: 1,
        px: 2,
        color: '#666',
        '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-1px)'
        },
        transition: 'all 0.2s ease-in-out'
    },
    section: {
        mb: 3,
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
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        '& .MuiSvgIcon-root': {
            color: '#2CBB34'
        },
        fontFamily: 'Russo One'
    },
    statCard: {
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
    playerList: {
        p: 0
    },
    playerItem: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        '&:last-child': {
            borderBottom: 'none'
        },
        '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.01)'
        }
    },
    matchItem: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        '&:last-child': {
            borderBottom: 'none'
        },
        '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.01)'
        }
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

export default function TeamDetailsPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [matchHistory, setMatchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                // Fetch team details
                const teamDoc = await getDoc(doc(db, 'teams', teamId));
                if (!teamDoc.exists()) {
                    throw new Error('Team not found');
                }
                setTeam(teamDoc.data());

                // Fetch match history - update query to find all matches for this team
                const matchesRef = collection(db, 'matches');
                const matchesQuery = query(
                    matchesRef,
                    and(
                        where('status', '==', 'accepted'),
                        where('scoreConfirmed', '==', true),
                        or(
                            where('teamA', '==', teamId),
                            where('teamB', '==', teamId)
                        )
                    )
                );
                const matchesSnapshot = await getDocs(matchesQuery);
                const matchesData = matchesSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        opponentTeamName: data.teamA === teamId ? data.teamBName : data.teamAName,
                        result: data.finalScore.teamA === data.finalScore.teamB ? 'tie' :
                               (data.teamA === teamId && data.finalScore.teamA > data.finalScore.teamB) ||
                               (data.teamB === teamId && data.finalScore.teamB > data.finalScore.teamA) ? 'won' : 'lost'
                    };
                });
                setMatchHistory(matchesData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching team details:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTeamDetails();
    }, [teamId]);

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
                    <Button 
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/leagues')}
                        sx={styles.backButton}
                    >
                        Back to Leagues
                    </Button>
                </Container>
            </Box>
        );
    }

    if (!team) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header />
            <Title />
            <Container maxWidth="lg" sx={styles.container}>
                <Box sx={styles.header}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/leagues')}
                        sx={styles.backButton}
                    >
                        Back to Leagues
                    </Button>
                </Box>

                {/* Team Header */}
                <Card sx={styles.section}>
                    <Box sx={styles.sectionTitle}>
                        <Typography variant="h5" sx={{ fontFamily: 'Russo One', color: '#333' }}>
                            {team.teamName.toUpperCase()}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Chip
                            icon={<SportsIcon />}
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
                    </Box>

                    <Box sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Box sx={styles.statCard}>
                                    <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                        {team.matches?.matchesWon || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Wins</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={styles.statCard}>
                                    <Typography variant="h4" sx={{ color: '#c62828', fontWeight: 'bold' }}>
                                        {team.matches?.matchesLost || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Losses</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Box sx={styles.statCard}>
                                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                        {team.matches?.matchesTied || 0}
                                    </Typography>
                                    <Typography color="text.secondary">Ties</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                {/* Team Members */}
                <Card sx={styles.section}>
                    <Box sx={styles.sectionTitle}>
                        <PersonIcon />
                        <Typography variant="h6" sx={{ fontFamily: 'Russo One' }}>
                            Team Members
                        </Typography>
                    </Box>
                    <List sx={styles.playerList}>
                        {Object.entries(team.players || {}).map(([name, player], index) => (
                            <ListItem key={name} sx={styles.playerItem}>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {name}
                                            </Typography>
                                            {player.isCaptain && (
                                                <Chip
                                                    size="small"
                                                    label="Captain"
                                                    sx={{
                                                        borderRadius: '8px',
                                                        bgcolor: '#fff3e0',
                                                        color: '#e65100',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={player.email}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Card>

                {/* Match History */}
                <Card sx={styles.section}>
                    <Box sx={styles.sectionTitle}>
                        <EmojiEventsIcon />
                        <Typography variant="h6" sx={{ fontFamily: 'Russo One' }}>
                            Match History
                        </Typography>
                    </Box>
                    {matchHistory.length > 0 ? (
                        <List sx={styles.playerList}>
                            {matchHistory.map((match, index) => (
                                <ListItem key={match.id} sx={styles.matchItem}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ fontWeight: 'bold', color: '#333' }}>
                                                   { team.teamName.toUpperCase() } vs {match.opponentTeamName.toUpperCase()}
                                                </Typography>
                                                <Chip
                                                    size="small"
                                                    label={match.result === 'won' ? 'Won' : match.result === 'tie' ? 'Tied' : 'Lost'}
                                                    sx={{
                                                        borderRadius: '8px',
                                                        bgcolor: match.result === 'won' ? '#e8f5e9' : match.result === 'tie' ? '#fff3e0' : '#ffebee',
                                                        color: match.result === 'won' ? '#2e7d32' : match.result === 'tie' ? '#e65100' : '#c62828',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(match.dateTime).toLocaleDateString()} - Score: {
                                                    match.teamA === teamId ? 
                                                    `${match.finalScore.teamA} - ${match.finalScore.teamB}` :
                                                    `${match.finalScore.teamB} - ${match.finalScore.teamA}`
                                                }
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No matches played yet
                            </Typography>
                        </Box>
                    )}
                </Card>
            </Container>
        </Box>
    );
} 