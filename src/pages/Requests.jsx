import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    serverTimestamp,
    Timestamp,
    or
} from 'firebase/firestore';
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
    CardContent,
    Button,
    Stack,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    Snackbar,
    Tabs,
    Tab,
    FormControl,
    InputLabel,
    Select,
    MenuItem as MUIMenuItem
} from '@mui/material';
import {
    SportsScore as SportsScoreIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as LocationIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    CallMade as OutgoingIcon,
    CallReceived as IncomingIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const styles = {
    container: {
        py: 4,
        px: { xs: 2, sm: 3, md: 4 }
    },
    card: {
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        },
        transition: 'all 0.2s ease'
    },
    cardContent: {
        p: 3,
        '&:last-child': { pb: 3 }
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
    },
    teamName: {
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1a237e'
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
        color: '#5c6bc0'
    },
    statusChip: {
        fontWeight: 500
    },
    actionButtons: {
        display: 'flex',
        gap: 1,
        mt: 2
    }
};

const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Date not set';
    
    // Handle both Firestore Timestamp and regular Date objects
    const date = timestamp instanceof Timestamp ? 
        timestamp.toDate() : 
        (timestamp instanceof Date ? timestamp : new Date(timestamp));
    
    try {
        return format(date, 'PPp');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

export default function Requests() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [userTeams, setUserTeams] = useState([]);
    const { user } = useAuth();

    const fetchUserTeams = async () => {
        if (!user?.uid) return [];
        
        try {
            // First get all teams
            const teamsRef = collection(db, 'teams');
            const teamsSnapshot = await getDocs(teamsRef);
            
            // Filter teams where user is either captain or player
            const teams = teamsSnapshot.docs
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

            console.log('User teams:', teams); // Debug log
            setUserTeams(teams);
            return teams;
        } catch (error) {
            console.error('Error fetching user teams:', error);
            setError('Failed to fetch teams. Please try again.');
            return [];
        }
    };

    const isTeamCaptain = (request, type) => {
        if (!user?.uid) return false;
        return type === 'incoming' ? 
            request.teamBCaptainId === user.uid :
            request.teamACaptainId === user.uid;
    };

    const fetchRequests = async () => {
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
                setIncomingRequests([]);
                setOutgoingRequests([]);
                setLoading(false);
                return;
            }

            const userTeamIds = teams.map(team => team.id);
            console.log('User team IDs:', userTeamIds); // Debug log

            // Fetch incoming requests
            const matchesRef = collection(db, 'matches');
            const incomingQuery = query(matchesRef, where('teamB', 'in', userTeamIds));
            const incomingSnapshot = await getDocs(incomingQuery);
            console.log('Incoming requests:', incomingSnapshot.docs.length); // Debug log
            
            const incomingData = incomingSnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Processing incoming request:', data); // Debug log
                return {
                    id: doc.id,
                    ...data,
                    requestId: doc.id,
                    type: 'incoming',
                    canManage: isTeamCaptain(data, 'incoming')
                };
            });

            // Fetch outgoing requests
            const outgoingQuery = query(matchesRef, where('teamA', 'in', userTeamIds));
            const outgoingSnapshot = await getDocs(outgoingQuery);
            console.log('Outgoing requests:', outgoingSnapshot.docs.length); // Debug log
            
            const outgoingData = outgoingSnapshot.docs.map(doc => {
                const data = doc.data();
                console.log('Processing outgoing request:', data); // Debug log
                return {
                    id: doc.id,
                    ...data,
                    requestId: doc.id,
                    type: 'outgoing',
                    canManage: isTeamCaptain(data, 'outgoing')
                };
            });

            console.log('Setting requests:', { incoming: incomingData, outgoing: outgoingData }); // Debug log
            setIncomingRequests(incomingData);
            setOutgoingRequests(outgoingData);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setError('Failed to load match requests. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [user]);

    const handleAction = (request, action) => {
        if (!request.canManage) {
            setError('Only team captains can perform this action');
            return;
        }
        setSelectedRequest(request);
        setDialogAction(action);
        setOpenDialog(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedRequest || !selectedRequest.canManage) return;

        try {
            const requestRef = doc(db, 'matches', selectedRequest.requestId);

            if (dialogAction === 'accept') {
                await updateDoc(requestRef, {
                    status: 'accepted',
                    acceptedAt: serverTimestamp()
                });
                setSuccess('Match request accepted');
            } else if (dialogAction === 'decline' || dialogAction === 'cancel') {
                await deleteDoc(requestRef);
                setSuccess(dialogAction === 'decline' ? 'Match request declined' : 'Match request cancelled');
            }

            setOpenDialog(false);
            fetchRequests(); // Refresh the list
        } catch (error) {
            console.error('Error updating request:', error);
            setError('Failed to update match request');
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getTeamName = (teamId) => {
        const team = userTeams.find(t => t.id === teamId);
        return team ? team.name : 'Unknown Team';
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
                <Header />
                <Title />
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            </Box>
        );
    }

    const currentRequests = activeTab === 0 ? incomingRequests : outgoingRequests;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
            <Header />
            <Title />
            <Container maxWidth="lg" sx={styles.container}>
                <Box sx={styles.header}>
                    <Typography variant="h4" component="h1" sx={{
                        fontWeight: 'bold',
                        color: '#333',
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
                        Match Requests
                    </Typography>
                </Box>

                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    sx={{ mb: 3 }}
                >
                    <Tab 
                        icon={<IncomingIcon />} 
                        label="Incoming" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<OutgoingIcon />} 
                        label="Outgoing" 
                        iconPosition="start"
                    />
                </Tabs>

                {currentRequests.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">
                            No {activeTab === 0 ? 'incoming' : 'outgoing'} match requests found
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {currentRequests.map((request) => (
                            <Card key={request.id} sx={styles.card}>
                                <CardContent sx={styles.cardContent}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Typography sx={styles.teamName}>
                                            {request.teamAName.toUpperCase()} vs {request.teamBName.toUpperCase()}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {request.canManage && (
                                                <Chip
                                                    label="Team Captain"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: '#e3f2fd',
                                                        color: '#1976d2',
                                                        fontWeight: 'bold',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                            )}
                                            <Chip
                                                label={request.status}
                                                color={request.status === 'pending' ? 'warning' : 'success'}
                                                sx={styles.statusChip}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ my: 2 }}>
                                        <Box sx={styles.infoRow}>
                                            <SportsScoreIcon sx={styles.icon} />
                                            <Typography>{request.sport}</Typography>
                                        </Box>
                                        <Box sx={styles.infoRow}>
                                            <CalendarIcon sx={styles.icon} />
                                            <Typography>
                                                {formatDateTime(request.dateTime)}
                                            </Typography>
                                        </Box>
                                        <Box sx={styles.infoRow}>
                                            <LocationIcon sx={styles.icon} />
                                            <Typography>{request.venue}</Typography>
                                        </Box>
                                    </Box>

                                    {request.status === 'pending' && request.canManage && (
                                        <Box sx={styles.actionButtons}>
                                            {activeTab === 0 ? (
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        startIcon={<CheckIcon />}
                                                        onClick={() => handleAction(request, 'accept')}
                                                        sx={{
                                                            bgcolor: '#2CBB34',
                                                            fontWeight: 'bold',
                                                            textTransform: 'none',
                                                            borderRadius: '8px',
                                                            '&:hover': {
                                                                bgcolor: '#25a32a'
                                                            }
                                                        }}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        startIcon={<CloseIcon />}
                                                        onClick={() => handleAction(request, 'decline')}
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            textTransform: 'none',
                                                            borderRadius: '8px'
                                                        }}
                                                    >
                                                        Decline
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    startIcon={<CloseIcon />}
                                                    onClick={() => handleAction(request, 'cancel')}
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        textTransform: 'none',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    Cancel Request
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                    {request.status === 'pending' && !request.canManage && (
                                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: '8px' }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                Only the team captain can {activeTab === 0 ? 'respond to' : 'cancel'} this request
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>
                        {dialogAction === 'accept' ? 'Accept Match Request' :
                         dialogAction === 'decline' ? 'Decline Match Request' :
                         'Cancel Match Request'}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to {dialogAction} this match request?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>No</Button>
                        <Button onClick={handleConfirmAction} autoFocus>
                            Yes
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
                        sx={{ width: '100%' }}
                    >
                        {success || error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
} 