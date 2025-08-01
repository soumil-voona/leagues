import { useState, useEffect } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from "../components/Header";
import TeamList from "../components/team/TeamList";
import Title from "../components/Title";
import CreateTeamModal from "../components/team/CreateTeamModal";
import TeamInvites from "../components/team/TeamInvites";
import { Button, Box, Container, Typography, CircularProgress, Badge } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../hooks/useAuth';
import "../styles/teams.css";

export default function Teams() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingInvites, setPendingInvites] = useState(0);
    const { user } = useAuth();

    const fetchPendingInvites = async () => {
        if (!user?.uid) return;

        try {
            const invitesRef = collection(db, 'teamInvites');
            const invitesQuery = query(
                invitesRef,
                where('invitedUserId', '==', user.uid),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(invitesQuery);
            setPendingInvites(snapshot.size);
        } catch (error) {
            console.error('Error fetching pending invites:', error);
        }
    };

    const fetchTeams = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            setError(null);
            const teamsRef = collection(db, 'teams');
            const querySnapshot = await getDocs(teamsRef);

            // Filter teams where the user's UID appears in playerUids values
            const teamsData = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(team => {
                    // Check if user is captain or player
                    const players = team.players || {};
                    return Object.values(players).some(player => player.userId === user.uid);
                });

            setTeams(teamsData);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setError('Failed to load teams. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchPendingInvites();
    }, [user]);

    const handleTeamCreated = () => {
        setIsModalOpen(false);
        fetchTeams();
        window.location.reload();
    };

    const handleInviteAction = () => {
        fetchPendingInvites();
        fetchTeams();
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header pendingInvites={pendingInvites} />
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
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }} className='title'>
                        My Teams
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsModalOpen(true)}
                        sx={{
                            bgcolor: '#2CBB34',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '8px',
                            px: 3,
                            py: 1,
                            boxShadow: '0 2px 12px rgba(44, 187, 52, 0.3)',
                            '&:hover': {
                                bgcolor: '#25a32a',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(44, 187, 52, 0.4)'
                            },
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        Create a Team
                    </Button>
                </Box>

                {/* Team Invites Section */}
                <TeamInvites onInviteAction={handleInviteAction} />

                {/* Teams List */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" textAlign="center" py={4}>
                        {error}
                    </Typography>
                ) : teams.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="textSecondary">
                            You haven't joined any teams yet.
                        </Typography>
                    </Box>
                ) : (
                    <TeamList teams={teams} onTeamUpdate={fetchTeams} userId={user?.uid} />
                )}

                <CreateTeamModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onTeamCreated={handleTeamCreated}
                />
            </Container>
        </Box>
    );
}