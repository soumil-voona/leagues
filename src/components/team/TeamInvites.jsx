import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../hooks/useAuth';
import {
    Box,
    Typography,
    Card,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    SportsScore as SportsIcon,
    EmojiEvents as LeagueIcon,
    Check as AcceptIcon,
    Close as DeclineIcon
} from '@mui/icons-material';

const styles = {
    card: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        mb: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)'
        }
    },
    title: {
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        '& .MuiSvgIcon-root': {
            color: '#2CBB34'
        }
    },
    inviteItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        '&:last-child': {
            borderBottom: 'none'
        }
    },
    inviteInfo: {
        flex: 1
    },
    actions: {
        display: 'flex',
        gap: 1
    },
    acceptButton: {
        bgcolor: '#e8f5e9',
        color: '#2e7d32',
        '&:hover': {
            bgcolor: '#c8e6c9'
        }
    },
    declineButton: {
        bgcolor: '#ffebee',
        color: '#c62828',
        '&:hover': {
            bgcolor: '#ffcdd2'
        }
    },
    chip: {
        borderRadius: '8px',
        fontWeight: 'bold'
    }
};

export default function TeamInvites({ onInviteAction }) {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvite, setSelectedInvite] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const { user } = useAuth();

    const fetchInvites = async () => {
        if (!user?.uid) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const invitesRef = collection(db, 'teamInvites');
            const invitesQuery = query(
                invitesRef,
                where('invitedUserId', '==', user.uid),
                where('status', '==', 'pending')
            );
            const snapshot = await getDocs(invitesQuery);
            const invitesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInvites(invitesData);
        } catch (err) {
            console.error('Error fetching invites:', err);
            setError('Failed to load team invites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchInvites();
        }
    }, [user]);

    const handleAction = async (invite, action) => {
        setSelectedInvite(invite);
        setActionType(action);
        setConfirmDialogOpen(true);
    };

    const handleConfirmAction = async () => {
        try {
            const invite = selectedInvite;
            const action = actionType;

            if (action === 'accept') {
                // First get current team data
                const teamRef = doc(db, 'teams', invite.teamId);
                const teamDoc = await getDoc(teamRef);
                if (!teamDoc.exists()) {
                    throw new Error('Team not found');
                }

                const currentTeam = teamDoc.data();
                console.log('Current team data:', currentTeam);
                console.log('Current players:', currentTeam.players);

                // Ensure we have the players object
                if (!currentTeam.players) {
                    console.error('No players object found in team data');
                    throw new Error('Invalid team data');
                }

                // Create new players object with existing players - using structured clone for deep copy
                const updatedPlayers = structuredClone(currentTeam.players);
                console.log('Players after deep copy:', updatedPlayers);

                // Generate a unique key for the new player
                let newPlayerKey = invite.invitedUserName.toLowerCase();
                // If the key already exists, append a number to make it unique
                let counter = 1;
                while (updatedPlayers[newPlayerKey]) {
                    if (updatedPlayers[newPlayerKey].userId === invite.invitedUserId) {
                        console.log('Player already exists in team');
                        break;
                    }
                    newPlayerKey = `${invite.invitedUserName.toLowerCase()} ${counter}`;
                    counter++;
                }

                console.log('Using player key:', newPlayerKey);

                // Only add the player if they don't already exist
                if (!updatedPlayers[newPlayerKey] || updatedPlayers[newPlayerKey].userId !== invite.invitedUserId) {
                    console.log('Adding new player with data:', {
                        name: invite.invitedUserName,
                        userId: invite.invitedUserId,
                        email: invite.invitedUserEmail,
                        isCaptain: false,
                        status: 'accepted'
                    });

                    updatedPlayers[newPlayerKey] = {
                        name: invite.invitedUserName,
                        userId: invite.invitedUserId,
                        email: invite.invitedUserEmail,
                        isCaptain: false,
                        status: 'accepted'
                    };
                }

                console.log('Final updated players:', updatedPlayers);
                console.log('Number of players:', Object.keys(updatedPlayers).length);
                console.log('All player keys:', Object.keys(updatedPlayers));

                // Ensure captain status is preserved
                const captain = Object.entries(currentTeam.players).find(([_, p]) => p.isCaptain);
                if (captain) {
                    const [captainName, captainData] = captain;
                    // Make sure captain data is preserved
                    updatedPlayers[captainName.toLowerCase()] = {
                        ...captainData,
                        isCaptain: true  // Ensure captain status is explicitly set
                    };
                }

                console.log('Captain preserved:', Object.values(updatedPlayers).some(p => p.isCaptain));

                // Update team with merged players
                await updateDoc(teamRef, {
                    players: updatedPlayers,
                    playerCount: Object.keys(updatedPlayers).length
                });

                // Verify the update
                const verifyDoc = await getDoc(teamRef);
                const verifyData = verifyDoc.data();
                console.log('Verification - updated team data:', verifyData);
                console.log('Verification - players after update:', verifyData.players);
                console.log('Verification - number of players:', Object.keys(verifyData.players).length);
                console.log('Verification - captain exists:', Object.values(verifyData.players).some(p => p.isCaptain));
                
                if (!Object.values(verifyData.players).some(p => p.isCaptain)) {
                    console.error('Captain was lost during update! Attempting to restore...');
                    // If somehow we lost the captain, restore from original data
                    const captain = Object.entries(currentTeam.players).find(([_, p]) => p.isCaptain);
                    if (captain) {
                        const [captainName, captainData] = captain;
                        updatedPlayers[captainName.toLowerCase()] = captainData;
                        await updateDoc(teamRef, {
                            players: updatedPlayers,
                            playerCount: Object.keys(updatedPlayers).length
                        });
                        console.log('Captain restored:', captain);
                        console.log('Final player count:', Object.keys(updatedPlayers).length);
                    }
                }
            }

            // Update or delete the invite
            const inviteRef = doc(db, 'teamInvites', invite.id);
            if (action === 'accept') {
                await updateDoc(inviteRef, { status: 'accepted' });
            } else {
                await deleteDoc(inviteRef);
            }

            // Refresh invites list
            fetchInvites();
            
            // Notify parent component
            if (onInviteAction) {
                onInviteAction();
            }
        } catch (err) {
            console.error('Error handling invite:', err);
            setError(`Failed to ${actionType} invite. ${err.message}`);
        } finally {
            setConfirmDialogOpen(false);
            setSelectedInvite(null);
            setActionType(null);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (invites.length === 0) {
        return null;
    }

    return (
        <>
            <Card sx={styles.card}>
                <Box sx={styles.title}>
                    <Typography variant="h6" sx={{ fontFamily: 'Russo One' }}>
                        Team Invites
                    </Typography>
                </Box>
                <List>
                    {invites.map((invite) => (
                        <ListItem key={invite.id} sx={styles.inviteItem}>
                            <Box sx={styles.inviteInfo}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {invite.teamName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <Chip
                                        icon={<SportsIcon />}
                                        label={invite.sport}
                                        size="small"
                                        sx={{
                                            ...styles.chip,
                                            bgcolor: '#e8f5e9',
                                            color: '#2e7d32'
                                        }}
                                    />
                                    <Chip
                                        icon={<LeagueIcon />}
                                        label={`League ${invite.leagueNumber}`}
                                        size="small"
                                        sx={{
                                            ...styles.chip,
                                            bgcolor: '#e3f2fd',
                                            color: '#1976d2'
                                        }}
                                    />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Invited by {invite.captainName}
                                </Typography>
                            </Box>
                            <Box sx={styles.actions}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AcceptIcon />}
                                    onClick={() => handleAction(invite, 'accept')}
                                    sx={styles.acceptButton}
                                >
                                    Accept
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<DeclineIcon />}
                                    onClick={() => handleAction(invite, 'decline')}
                                    sx={styles.declineButton}
                                >
                                    Decline
                                </Button>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Card>

            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
            >
                <DialogTitle>
                    {actionType === 'accept' ? 'Accept Team Invite?' : 'Decline Team Invite?'}
                </DialogTitle>
                <DialogContent>
                    {actionType === 'accept'
                        ? `Are you sure you want to join ${selectedInvite?.teamName}?`
                        : `Are you sure you want to decline the invite to ${selectedInvite?.teamName}?`
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAction}
                        variant="contained"
                        color={actionType === 'accept' ? 'success' : 'error'}
                    >
                        {actionType === 'accept' ? 'Accept' : 'Decline'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
} 