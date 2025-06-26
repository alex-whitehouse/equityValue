import { useState } from 'react';
import { Box, Button, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import SignInModal from '../components/auth/SignInModal';
import SignUpModal from '../components/auth/SignUpModal';
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal';

export default function LandingPage() {
  const theme = useTheme();
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  return (
    <Container maxWidth="xl">
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            StockInsight
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              sx={{ mr: 1 }}
              onClick={() => setOpenSignIn(true)}
            >
              Sign In
            </Button>
            <Button 
              variant="contained"
              onClick={() => setOpenSignUp(true)}
            >
              Sign Up
            </Button>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
          <Box sx={{ flex: 1, maxWidth: { md: '50%' } }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Advanced Stock Analysis at Your Fingertips
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Unlock powerful insights with our comprehensive suite of financial tools and real-time market data.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                sx={{ mr: 2 }}
                onClick={() => setOpenSignUp(true)}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setOpenSignIn(true)}
              >
                Sign In
              </Button>
            </Box>
          </Box>
          <Box sx={{ flex: 1, maxWidth: { md: '50%' }, width: '100%' }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4, bgcolor: theme.palette.background.paper }}>
              <Typography variant="h6" gutterBottom>Dashboard Preview</Typography>
              <Box sx={{ height: 300, bgcolor: theme.palette.grey[800], borderRadius: 2 }} />
            </Paper>
          </Box>
        </Box>

        <SignInModal 
          open={openSignIn} 
          onClose={() => setOpenSignIn(false)} 
          onSwitchToSignUp={() => {
            setOpenSignIn(false);
            setOpenSignUp(true);
          }}
          onSwitchToForgotPassword={() => {
            setOpenSignIn(false);
            setOpenForgotPassword(true);
          }}
        />
        
        <SignUpModal 
          open={openSignUp} 
          onClose={() => setOpenSignUp(false)} 
          onSwitchToSignIn={() => {
            setOpenSignUp(false);
            setOpenSignIn(true);
          }} 
        />
        
        <ForgotPasswordModal 
          open={openForgotPassword} 
          onClose={() => setOpenForgotPassword(false)}
          onSwitchToSignIn={() => {
            setOpenForgotPassword(false);
            setOpenSignIn(true);
          }}
        />
      </Box>
    </Container>
  );
}