import { useState } from 'react';
import { db } from '../firebaseConfig';
import Header from "../components/Header";
import TeamList from "../components/team/TeamList";
import Title from "../components/Title";
import CreateTeamModal from "../components/team/CreateTeamModal";
import { Button, Box, Container, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import "../styles/teams.css";

export default function Teams() {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                        fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}>
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
                        Create Team
                    </Button>
                </Box>

                <TeamList />
            </Container>

            <CreateTeamModal 
                open={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            />
        </Box>
    );
}