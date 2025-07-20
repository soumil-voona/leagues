import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
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
    List,
    ListItem,
    ListItemText,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    Button
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    EmojiEvents as TrophyIcon,
    SportsScore as SportsScoreIcon
} from '@mui/icons-material';

const styles = {
    container: {
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
    },
    sportSection: {
        mb: 4
    },
    leagueCard: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        mb: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'visible'
    },
    leagueTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        '& .MuiSvgIcon-root': {
            color: '#2CBB34'
        }
    },
    teamList: {
        py: 0
    },
    teamItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        px: 3,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        '&:last-child': {
            borderBottom: 'none'
        },
        '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.01)'
        }
    },
    rank: {
        minWidth: '30px',
        fontWeight: 'bold',
        color: '#666'
    },
    teamName: {
        flex: 1,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'Russo One',
        cursor: 'pointer',
        '&:hover': {
            color: '#2CBB34',
            textDecoration: 'underline'
        }
    },
    stats: {
        display: 'flex',
        gap: 2,
        alignItems: 'center'
    },
    statChip: {
        borderRadius: '8px',
        fontWeight: 'bold'
    },
    sportTitle: {
        fontFamily: 'Russo One',
        color: '#333',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '& .MuiSvgIcon-root': {
            color: '#2CBB34'
        }
    },
    noLeagues: {
        textAlign: 'center',
        py: 4,
        color: '#666'
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
    }
};

export default function Leagues() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leagueData, setLeagueData] = useState({});
    const { user } = useAuth();

    const fetchLeagueData = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);

            // Get all teams
            const teamsRef = collection(db, 'teams');
            const teamsSnapshot = await getDocs(teamsRef);
            const allTeams = teamsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Find user's teams to get their leagues
            const userTeams = allTeams.filter(team => {
                const players = team.players || {};
                return Object.values(players).some(player => player.userId === user.uid);
            });

            // Group teams by sport and league
            const leaguesBySport = {};
            userTeams.forEach(userTeam => {
                const { sport, leagueNumber } = userTeam;
                if (!leaguesBySport[sport]) {
                    leaguesBySport[sport] = new Set();
                }
                leaguesBySport[sport].add(leagueNumber);
            });

            // For each sport and league, get all teams and sort by wins
            const leagueData = {};
            Object.entries(leaguesBySport).forEach(([sport, leagues]) => {
                leagueData[sport] = {};
                leagues.forEach(leagueNumber => {
                    const teamsInLeague = allTeams.filter(team => 
                        team.sport === sport && team.leagueNumber === leagueNumber
                    );

                    // Sort teams by wins (and other criteria for ties)
                    const sortedTeams = teamsInLeague.sort((a, b) => {
                        const aMatches = a.matches || { matchesWon: 0, matchesTied: 0, matchesLost: 0 };
                        const bMatches = b.matches || { matchesWon: 0, matchesTied: 0, matchesLost: 0 };
                        
                        // Compare by wins first
                        if (bMatches.matchesWon !== aMatches.matchesWon) {
                            return bMatches.matchesWon - aMatches.matchesWon;
                        }
                        // If wins are equal, compare by ties
                        if (bMatches.matchesTied !== aMatches.matchesTied) {
                            return bMatches.matchesTied - aMatches.matchesTied;
                        }
                        // If ties are equal, compare by losses (fewer losses is better)
                        return aMatches.matchesLost - bMatches.matchesLost;
                    });

                    leagueData[sport][leagueNumber] = sortedTeams;
                });
            });

            setLeagueData(leagueData);
        } catch (error) {
            console.error('Error fetching league data:', error);
            setError('Failed to load league data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeagueData();
    }, [user]);

    const handleTeamClick = (teamId) => {
        navigate(`/teams/${teamId}`);
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
                    <Typography color="error" sx={styles.noLeagues}>
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
                <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    fontFamily: 'Russo One',
                    mb: 4
                }}>
                    League Standings
                </Typography>

                {Object.keys(leagueData).length === 0 ? (
                    <Typography sx={styles.noLeagues}>
                        You are not part of any leagues yet. Join a team to see league standings!
                    </Typography>
                ) : (
                    Object.entries(leagueData).map(([sport, leagues]) => (
                        <Box key={sport} sx={styles.sportSection}>
                            <Typography variant="h5" sx={styles.sportTitle}>
                                <SportsScoreIcon /> {sport}
                            </Typography>
                            {Object.entries(leagues).map(([leagueNumber, teams]) => (
                                <Card key={`${sport}-${leagueNumber}`} sx={styles.leagueCard}>
                                    <Box sx={styles.leagueTitle}>
                                        <TrophyIcon />
                                        <Typography variant="h6" sx={{ fontFamily: 'Russo One' }}>
                                            League {leagueNumber}
                                        </Typography>
                                    </Box>
                                    <List sx={styles.teamList}>
                                        {teams.map((team, index) => {
                                            const matches = team.matches || { matchesWon: 0, matchesTied: 0, matchesLost: 0 };
                                            const totalMatches = matches.matchesWon + matches.matchesTied + matches.matchesLost;
                                            return (
                                                <ListItem key={team.id} sx={styles.teamItem}>
                                                    <Typography sx={styles.rank}>
                                                        #{index + 1}
                                                    </Typography>
                                                    <Typography 
                                                        sx={styles.teamName}
                                                        onClick={() => handleTeamClick(team.id)}
                                                    >
                                                        {team.teamName.toUpperCase()}
                                                    </Typography>
                                                    <Box sx={styles.stats}>
                                                        <Chip
                                                            label={`${matches.matchesWon}W`}
                                                            sx={{
                                                                ...styles.statChip,
                                                                bgcolor: '#e8f5e9',
                                                                color: '#2e7d32'
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${matches.matchesTied}D`}
                                                            sx={{
                                                                ...styles.statChip,
                                                                bgcolor: '#fff3e0',
                                                                color: '#e65100'
                                                            }}
                                                        />
                                                        <Chip
                                                            label={`${matches.matchesLost}L`}
                                                            sx={{
                                                                ...styles.statChip,
                                                                bgcolor: '#ffebee',
                                                                color: '#c62828'
                                                            }}
                                                        />
                                                        {totalMatches > 0 && (
                                                            <Chip
                                                                label={`${((matches.matchesWon / totalMatches) * 100).toFixed(0)}%`}
                                                                sx={{
                                                                    ...styles.statChip,
                                                                    bgcolor: '#e3f2fd',
                                                                    color: '#1976d2'
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </Card>
                            ))}
                        </Box>
                    ))
                )}
            </Container>
        </Box>
    );
}