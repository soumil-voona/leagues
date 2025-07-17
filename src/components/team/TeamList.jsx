import { useState, useEffect } from 'react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import Team from './Team';
import { Grid, Typography, Box, CircularProgress } from '@mui/material';

export default function TeamList() {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchTeams = async () => {
            if (!user?.uid) return;

            try {
                setLoading(true);
                const teamsRef = collection(db, 'teams');
                const querySnapshot = await getDocs(teamsRef);

                // Filter teams where the user's UID appears in playerUids values
                const teamsData = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(team => {
                        // Check if user's UID is in playerUids values
                        return Object.values(team.playerUids || {}).includes(user.uid);
                    });

                setTeams(teamsData);
            } catch (error) {
                console.error('Error fetching teams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeams();
    }, [user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (teams.length === 0) {
        return (
            <Box textAlign="center" py={4}>
                <Typography variant="h6" color="textSecondary">
                    No teams found
                </Typography>
            </Box>
        );
    }

    return (
        <Grid 
            container 
            spacing={3} 
            justifyContent="center"
            sx={{
                width: '100%',
                margin: '0 auto',
                '& .MuiGrid-item': {
                    display: 'flex',
                    justifyContent: 'center'
                }
            }}
        >
            {teams.map(team => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={team.id}>
                    <Team team={team} />
                </Grid>
            ))}
        </Grid>
    );
} 