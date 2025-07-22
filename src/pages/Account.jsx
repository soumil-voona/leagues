import Menu from '../components/menu/Menu';
import { getAuth } from 'firebase/auth';
import { useState } from 'react';
import { useEffect } from 'react';
import { 
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    List,
    Grid,
    ListItem,
    ListItemText,
    Paper,
    TextField,
    Typography,
    Alert,
    Snackbar,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Edit as EditIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { 
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';
import { doc, updateDoc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Header from "../components/Header";

const styles = {
    container: {
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#f8f9fa',
        position: 'relative',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: "40px",
            left: 0,
            right: 0,
            height: '300px',
            background: 'linear-gradient(135deg, #2CBB34 0%, #25a32a 100%)',
            zIndex: 0
        }
    },
    profileHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mb: 4,
        position: 'relative',
        width: '100%',
        marginTop: "10px",
        py: 4,
        color: 'white',
        zIndex: 1
    },
    avatar: {
        width: 150,
        height: 150,
        fontSize: '3.5rem',
        fontWeight: 500,
        marginTop: "30px",
        backgroundColor: '#25a32a',
        border: '4px solid white',
        boxShadow: '0 8px 20px rgba(44, 187, 52, 0.15)',
        marginBottom: 3
    },
    mainContent: {
        width: '100%',
        maxWidth: 800,
        mt: -2,
        zIndex: 1,
        px: { xs: 2, sm: 3, md: 4 }
    },
    section: {
        p: 3,
        mb: 3,
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
        backgroundColor: 'white',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            transform: 'translateY(-2px)'
        }
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 3,
        color: '#333',
        fontWeight: 'bold',
        fontSize: { xs: '1.2rem', sm: '1.4rem' },
        position: 'relative',
        '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '40px',
            height: '3px',
            backgroundColor: '#2CBB34',
            borderRadius: '2px'
        }
    },
    listItem: {
        borderRadius: '8px',
        mb: 2,
        p: 2,
        backgroundColor: '#f8f9fa',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: '#f3f4f6',
            transform: 'translateY(-1px)'
        }
    },
    statsCard: {
        textAlign: 'center',
        p: 3,
        background: 'linear-gradient(135deg, #2CBB34 0%, #25a32a 100%)',
        color: 'white',
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(44, 187, 52, 0.15)'
        }
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 700,
        mb: 1,
        color: 'white'
    },
    statLabel: {
        fontSize: '0.9rem',
        opacity: 0.9,
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
    },
    actionButton: {
        borderRadius: '8px',
        textTransform: 'none',
        py: 1.5,
        px: 3,
        fontWeight: 'bold',
        transition: 'all 0.2s ease-in-out',
        bgcolor: '#2CBB34',
        color: 'white',
        boxShadow: '0 2px 12px rgba(44, 187, 52, 0.3)',
        '&:hover': {
            bgcolor: '#25a32a',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(44, 187, 52, 0.4)'
        }
    },
    dangerZone: {
        borderColor: 'error.main',
        borderWidth: 1,
        borderStyle: 'solid',
        backgroundColor: '#fff5f5',
        '& .MuiTypography-root': {
            color: 'error.main'
        },
        '&:hover': {
            backgroundColor: '#fff1f1',
            borderColor: 'error.dark'
        }
    },
    dialog: {
        '& .MuiDialog-paper': {
            borderRadius: '8px',
            padding: 2
        }
    },
    dialogTitle: {
        borderBottom: '1px solid #eee',
        pb: 2,
        fontWeight: 'bold',
        color: '#333'
    },
    dialogContent: {
        py: 3
    },
    dialogActions: {
        borderTop: '1px solid #eee',
        pt: 2
    }
};

export default function Account() {
    const { user, signOut } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
        newPassword: '',
        currentPassword: ''
    });
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const [openEmailDialog, setOpenEmailDialog] = useState(false);
    const [teams, setTeams] = useState([]);

    // Function to get user's initials
    const getInitials = () => {
        if (!user) return '';
        
        // Try to get initials from displayName
        if (user.displayName) {
            const names = user.displayName.split(' ');
            if (names.length >= 2) {
                return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
            }
            return user.displayName[0].toUpperCase();
        }
        
        // Fallback to email
        if (user.email) {
            return user.email[0].toUpperCase();
        }
        
        return '?';
    };  

    const fetchTeams = async () => {
        if (!user?.uid) return;

        try {
        setLoading(true);
        setError(null);
        const teamsRef = collection(db, 'teams');
        const querySnapshot = await getDocs(teamsRef);

        const teamsData = querySnapshot.docs
            .map(doc => ({
            id: doc.id,
            ...doc.data()
            }))
            .filter(team => {
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
        fetchTeams(); // Call it here
    }, [user]); // Dependency: only refetch when user changes

    // const handleImageUpload = async (event) => {
    //     try {
    //         setLoading(true);
    //         setError('');
    //         const file = event.target.files[0];
    //         if (!file) {
    //             setError('No file selected');
    //             setLoading(false);
    //             return;
    //         }

    //         // Validate file type and size
    //         const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    //         if (!validTypes.includes(file.type)) {
    //             setError('Please upload a valid image file (JPEG, PNG, or GIF)');
    //             setLoading(false);
    //             return;
    //         }

    //         if (file.size > 5 * 1024 * 1024) { // 5MB limit
    //             setError('Image size should be less than 5MB');
    //             setLoading(false);
    //             return;
    //         }

    //         console.log('Starting image upload process...');
    //         console.log('File details:', {
    //             name: file.name,
    //             type: file.type,
    //             size: file.size
    //         });

    //         // Delete old profile picture if exists
    //         if (user?.photoURL) {
    //             try {
    //                 console.log('Attempting to delete old profile picture...');
    //                 // const oldImageRef = ref(storage, `profilePictures/${user.uid}/profile`); // This line is removed as per the new_code
    //                 // await deleteObject(oldImageRef); // This line is removed as per the new_code
    //                 console.log('Old profile picture deleted successfully');
    //             } catch (error) {
    //                 console.log('No old image found or error deleting:', error);
    //                 // Continue with upload even if delete fails
    //             }
    //         }

    //         // Create storage reference
    //         console.log('Creating new storage reference...');
    //         // const storageRef = ref(storage, `profilePictures/${user.uid}/profile`); // This line is removed as per the new_code
            
    //         // Upload new image
    //         console.log('Starting file upload...');
    //         // const uploadResult = await uploadBytes(storageRef, file); // This line is removed as per the new_code
    //         console.log('File uploaded successfully:', 'dummy_upload_result'); // Placeholder for uploadResult

    //         // Get download URL
    //         console.log('Getting download URL...');
    //         // const downloadURL = await getDownloadURL(uploadResult.ref); // This line is removed as per the new_code
    //         const downloadURL = 'https://via.placeholder.com/150'; // Placeholder for downloadURL
    //         console.log('Got download URL:', downloadURL);

    //         // Update user profile
    //         console.log('Updating user profile...');
    //         await updateProfile(user, {
    //             photoURL: downloadURL
    //         });
    //         console.log('Profile updated successfully');

    //         setSuccess('Profile picture updated successfully');
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Error in image upload process:', error);
    //         let errorMessage = 'Failed to update profile picture';
            
    //         // More specific error messages based on the error
    //         if (error.code === 'storage/unauthorized') {
    //             errorMessage = 'Permission denied. Please try logging out and back in.';
    //         } else if (error.code === 'storage/quota-exceeded') {
    //             errorMessage = 'Storage quota exceeded. Please contact support.';
    //         } else if (error.code === 'storage/invalid-url') {
    //             errorMessage = 'Invalid storage location. Please try again.';
    //         } else if (error.code === 'storage/unknown') {
    //             errorMessage = 'An unknown error occurred. Please try again.';
    //         }
            
    //         setError(errorMessage);
    //         setLoading(false);
    //     }
    // };

    // const handleRemovePhoto = async () => {
    //     try {
    //         setLoading(true);
            
    //         // Delete profile picture from storage
    //         if (user.photoURL) {
    //             // const imageRef = ref(storage, `profilePictures/${user.uid}/profile`); // This line is removed as per the new_code
    //             // try {
    //             //     await deleteObject(imageRef);
    //             // } catch (error) {
    //             //     console.log("No image found in storage");
    //             // }
    //         }

    //         // Remove photo URL from profile
    //         await updateProfile(user, {
    //             photoURL: null
    //         });

    //         setSuccess('Profile picture removed successfully');
    //         // setOpenRemovePhotoDialog(false); // This line is removed as per the new_code
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Error removing profile picture:', error);
    //         setError('Failed to remove profile picture');
    //         setLoading(false);
    //     }
    // };

    

    const handleSave = async () => {
        try {
            setLoading(true);
            setError('');

            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) throw new Error("User not logged in");

            if (formData.displayName !== currentUser.displayName) {
                await updateProfile(currentUser, {
                    displayName: formData.displayName
                });

                // Update display name in any teams where user is a member
                const teamsRef = collection(db, 'teams');
                const teamsQuery = query(teamsRef, where('playerUids', 'array-contains', currentUser.uid));
                const teamsSnapshot = await getDocs(teamsQuery);

                const updatePromises = teamsSnapshot.docs.map(async (teamDoc) => {
                    const teamData = teamDoc.data();
                    if (teamData.players) {
                        const updatedPlayers = { ...teamData.players };
                        Object.keys(updatedPlayers).forEach(playerName => {
                            if (updatedPlayers[playerName].userId === currentUser.uid) {
                                updatedPlayers[playerName].name = formData.displayName;
                            }
                        });
                        await updateDoc(doc(db, 'teams', teamDoc.id), {
                            players: updatedPlayers
                        });
                    }
                });

                await Promise.all(updatePromises);
            }

            setSuccess('Profile updated successfully');
            setEditMode(false);
            setLoading(false);
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
            setLoading(false);
        }
    };

    const handleEmailChange = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setError('Please enter a valid email address');
                setLoading(false);
                return;
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update email
            await updateEmail(user, formData.email);

            setSuccess('Email updated successfully');
            setOpenEmailDialog(false);
            setLoading(false);
        } catch (error) {
            console.error('Error updating email:', error);
            setError('Failed to update email. Please check your password and try again.');
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate password strength
            if (formData.newPassword.length < 8) {
                setError('New password must be at least 8 characters long');
                setLoading(false);
                return;
            }

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, formData.newPassword);

            setSuccess('Password updated successfully');
            setOpenPasswordDialog(false);
            setFormData(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
            setLoading(false);
        } catch (error) {
            console.error('Error updating password:', error);
            setError('Failed to update password. Please check your current password and try again.');
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            setLoading(true);
            setError('');

            // Reauthenticate user
            const credential = EmailAuthProvider.credential(
                user.email,
                formData.currentPassword
            );
            await reauthenticateWithCredential(user, credential);

            // Delete user data from Firestore
            await deleteDoc(doc(db, 'users', user.uid));

            // Delete profile picture if exists
            if (user.photoURL) {
                // const imageRef = ref(storage, `profilePictures/${user.uid}/profile`); // This line is removed as per the new_code
                // try {
                //     await deleteObject(imageRef);
                // } catch (error) {
                //     console.log("No profile picture found");
                // }
            }

            // Delete user account
            await deleteUser(user);
            await signOut();

        } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to delete account. Please check your password and try again.');
            setLoading(false);
        }
    };

    // console.log(user);
    // console.log(teams);

    const totalMatches = teams?.reduce((arc, team) => team.matches.matchesWon + team.matches.matchesTied + team.matches.matchesLost + arc, 0);
    const userWins = teams?.reduce((arc, team) => team.matches.matchesWon + arc, 0);

    return (
        <Box sx={styles.container}>
            <Header />
            {/* Profile Header */}
            <Box sx={styles.profileHeader}>
                <Avatar sx={styles.avatar}>
                    {getInitials()}
                </Avatar>
                <Typography variant="h4" sx={{ 
                    mb: 1, 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                }}>
                    {user?.displayName.toUpperCase() || user?.name.toUpperCase() || "User Undefined"}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                    {user?.email}
                </Typography>
            </Box>

            {/* Main Content */}
            <Container sx={styles.mainContent}>
                <Grid item xs={12}>
                    <Grid container spacing={3} justifyContent="center" mb={5}>
                        <Grid item xs={12} md={8}>
                        <Paper sx={styles.statsCard}>
                            <Typography sx={styles.statValue}>
                            {teams.length || 0}
                            </Typography>
                            <Typography sx={styles.statLabel}>Teams Joined</Typography>
                        </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                        <Paper sx={styles.statsCard}>
                            <Typography sx={styles.statValue}>
                            {totalMatches || 0}
                            </Typography>
                            <Typography sx={styles.statLabel}>Matches Played</Typography>
                        </Paper>
                        </Grid>
                        <Grid item xs={12} md={8}>
                        <Paper sx={styles.statsCard}>
                            <Typography sx={styles.statValue}>
                            {userWins || 0}
                            </Typography>
                            <Typography sx={styles.statLabel}>Matches Won</Typography>
                        </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                    {/* Profile Information */}
                    <Grid item xs={12}>
                        <Card sx={styles.section}>
                            <Typography sx={styles.sectionTitle}>
                                <PersonIcon sx={{ color: '#2CBB34' }} /> Profile Information
                            </Typography>
                            <List>
                                <ListItem sx={styles.listItem}>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold" color="#333">Display Name</Typography>}
                                        secondary={
                                            editMode ? (
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={formData.displayName}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                                    margin="dense"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: '8px'
                                                        }
                                                    }}
                                                />
                                            ) : user?.displayName
                                        }
                                    />
                                    {!editMode ? (
                                        <Button
                                            startIcon={<EditIcon />}
                                            onClick={() => setEditMode(true)}
                                            sx={styles.actionButton}
                                        >
                                            Edit
                                        </Button>
                                    ) : (
                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                onClick={handleSave}
                                                disabled={loading}
                                                startIcon={<SaveIcon />}
                                                sx={styles.actionButton}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setFormData(prev => ({ ...prev, displayName: user?.displayName || '' }));
                                                }}
                                                startIcon={<CancelIcon />}
                                                sx={{
                                                    ...styles.actionButton,
                                                    bgcolor: '#666',
                                                    '&:hover': {
                                                        bgcolor: '#555'
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Stack>
                                    )}
                                </ListItem>

                                <ListItem sx={styles.listItem}>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold" color="#333">Email</Typography>}
                                        secondary={user?.email}
                                    />
                                    <Button
                                        startIcon={<EmailIcon />}
                                        onClick={() => setOpenEmailDialog(true)}
                                        sx={styles.actionButton}
                                    >
                                        Change Email
                                    </Button>
                                </ListItem>

                                <ListItem sx={styles.listItem}>
                                    <ListItemText
                                        primary={<Typography fontWeight="bold" color="#333">Password</Typography>}
                                        secondary="Change your password"
                                    />
                                    <Button
                                        startIcon={<LockIcon />}
                                        onClick={() => setOpenPasswordDialog(true)}
                                        sx={styles.actionButton}
                                    >
                                        Change Password
                                    </Button>
                                </ListItem>
                            </List>
                        </Card>

                    

                    {/* Logout Section */}
                    <Grid item xs={12}>
                        <Card sx={{
                            ...styles.section,
                            background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)',
                            border: '1px solid rgba(0, 0, 0, 0.05)'
                        }}>
                            <Typography sx={styles.sectionTitle}>
                                <LogoutIcon sx={{ color: '#666' }} /> Session Management
                            </Typography>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                                borderRadius: '8px'
                            }}>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                        Current Session
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Logged in as {user?.email}
                                    </Typography>
                                </Box>
                                <Button
                                    startIcon={<LogoutIcon />}
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await signOut();
                                        } catch (error) {
                                            setError('Failed to logout. Please try again.');
                                            console.log(error);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    sx={{
                                        ...styles.actionButton,
                                        bgcolor: '#666',
                                        '&:hover': {
                                            bgcolor: '#555',
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                        }
                                    }}
                                >
                                    {loading ? 'Logging out...' : 'Logout'}
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* Danger Zone */}
                <Grid item xs={12}>
                    <Card sx={{ ...styles.section, ...styles.dangerZone }}>
                        <Typography sx={styles.sectionTitle}>
                            <DeleteIcon sx={{ color: 'error.main' }} /> Danger Zone
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setOpenDeleteDialog(true)}
                            sx={{
                                ...styles.actionButton,
                                bgcolor: 'transparent',
                                color: 'error.main',
                                border: '1px solid',
                                borderColor: 'error.main',
                                '&:hover': {
                                    bgcolor: '#fff1f1',
                                    borderColor: 'error.dark',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
                                }
                            }}
                        >
                            Delete Account
                        </Button>
                    </Card>
                </Grid>
            </Container>
            
            {/* Dialogs */}
            <Dialog 
                open={openEmailDialog} 
                onClose={() => setOpenEmailDialog(false)}
                sx={styles.dialog}
            >
                <DialogTitle sx={styles.dialogTitle}>
                    Change Email
                </DialogTitle>
                <DialogContent sx={styles.dialogContent}>
                    <DialogContentText>
                        To change your email, please enter your new email and current password.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="New Email"
                        type="email"
                        fullWidth
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Current Password"
                        type="password"
                        fullWidth
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setOpenEmailDialog(false)}
                        sx={{
                            ...styles.actionButton,
                            bgcolor: '#666',
                            '&:hover': {
                                bgcolor: '#555'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleEmailChange} 
                        disabled={loading}
                        sx={styles.actionButton}
                    >
                        Update Email
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={openPasswordDialog} 
                onClose={() => setOpenPasswordDialog(false)}
                sx={styles.dialog}
            >
                <DialogTitle sx={styles.dialogTitle}>Change Password</DialogTitle>
                <DialogContent sx={styles.dialogContent}>
                    <DialogContentText>
                        To change your password, please enter your current password and new password.
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        label="Current Password"
                        type="password"
                        fullWidth
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="New Password"
                        type="password"
                        fullWidth
                        value={formData.newPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setOpenPasswordDialog(false)}
                        sx={{
                            ...styles.actionButton,
                            bgcolor: '#666',
                            '&:hover': {
                                bgcolor: '#555'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePasswordChange} 
                        disabled={loading}
                        sx={styles.actionButton}
                    >
                        Update Password
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog 
                open={openDeleteDialog} 
                onClose={() => setOpenDeleteDialog(false)}
                sx={styles.dialog}
            >
                <DialogTitle sx={styles.dialogTitle}>Delete Account</DialogTitle>
                <DialogContent sx={styles.dialogContent}>
                    <DialogContentText>
                        Are you sure you want to delete your account? This action cannot be undone.
                        Please enter your password to confirm.
                    </DialogContentText>
                    <TextField
                        margin="dense"
                        label="Current Password"
                        type="password"
                        fullWidth
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px'
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions sx={styles.dialogActions}>
                    <Button 
                        onClick={() => setOpenDeleteDialog(false)}
                        sx={{
                            ...styles.actionButton,
                            bgcolor: '#666',
                            '&:hover': {
                                bgcolor: '#555'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteAccount} 
                        color="error" 
                        disabled={loading}
                        sx={{
                            ...styles.actionButton,
                            bgcolor: 'error.main',
                            '&:hover': {
                                bgcolor: 'error.dark'
                            }
                        }}
                    >
                        Delete Account
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Success/Error Snackbar */}
            <Snackbar
                open={!!success || !!error}
                autoHideDuration={6000}
                onClose={() => {
                    setSuccess('');
                    setError('');
                }}
            >
                <Alert
                    onClose={() => {
                        setSuccess('');
                        setError('');
                    }}
                    severity={success ? "success" : "error"}
                    sx={{ 
                        width: '100%',
                        borderRadius: '8px'
                    }}
                >
                    {success || error}
                </Alert>
            </Snackbar>
        </Box>
    );
}