import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PropTypes from 'prop-types';
import { Box, CircularProgress } from '@mui/material';

export default function AuthRedirect({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (user) {
        return <Navigate to="/teams" replace />;
    }

    return children;
}

AuthRedirect.propTypes = {
    children: PropTypes.node.isRequired
}; 