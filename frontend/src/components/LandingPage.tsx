import React, { useState } from 'react';
import { Button, Typography, Box, Container } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import SignInModal from './auth/SignInModal';
import SignUpModal from './auth/SignUpModal';
import ForgotPasswordModal from './auth/ForgotPasswordModal';

const LandingPage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const [activeModal, setActiveModal] = useState<'signIn' | 'signUp' | 'forgotPassword' | null>(null);

  const handleOpenModal = (type: 'signIn' | 'signUp' | 'forgotPassword') => {
    setActiveModal(type);
    openAuthModal(type);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <Container maxWidth="md" style={{ textAlign: 'center', marginTop: '40px' }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Stock Analysis Dashboard
      </Typography>
      
      <Typography variant="body1" paragraph>
        Analyze stock performance and trends with real-time data.
        Sign in or create an account to get started.
      </Typography>

      <Box mt={4} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenModal('signIn')}
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenModal('signUp')}
        >
          Sign Up
        </Button>
      </Box>

      <Box mt={6}>
        <Typography variant="h6" gutterBottom>Features</Typography>
        <Box display="flex" justifyContent="space-around" mt={2}>
          <Box width="30%">
            <Typography variant="body2">Real-time stock data</Typography>
          </Box>
          <Box width="30%">
            <Typography variant="body2">Portfolio tracking</Typography>
          </Box>
          <Box width="30%">
            <Typography variant="body2">Technical indicators</Typography>
          </Box>
        </Box>
      </Box>

      <SignInModal
        open={activeModal === 'signIn'}
        onClose={handleCloseModal}
        onSwitchToSignUp={() => handleOpenModal('signUp')}
        onSwitchToForgotPassword={() => handleOpenModal('forgotPassword')}
      />
      <SignUpModal
        open={activeModal === 'signUp'}
        onClose={handleCloseModal}
        onSwitchToSignIn={() => handleOpenModal('signIn')}
      />
      <ForgotPasswordModal
        open={activeModal === 'forgotPassword'}
        onClose={handleCloseModal}
        onSwitchToSignIn={() => handleOpenModal('signIn')}
      />
    </Container>
  );
};

export default LandingPage;