import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function ForgotPasswordModal({ open, onClose, onSwitchToSignIn }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1 = email step, 2 = code and password step
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    
    try {
      await forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        setStep(2);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to send reset code. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await resetPassword(email, code, newPassword);
      setSuccess(true);
    } catch (err) {
      setError('Failed to reset password. Please check the code and try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setCode('');
    setNewPassword('');
    setStep(1);
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Reset Password
        <IconButton 
          aria-label="close" 
          onClick={handleClose} 
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {success && step === 1 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Reset Code Sent!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              A password reset code has been sent to your email.
            </Typography>
          </Box>
        ) : success ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Password Reset!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Your password has been successfully reset.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                handleClose();
                onSwitchToSignIn();
              }}
            >
              Sign In Now
            </Button>
          </Box>
        ) : step === 1 ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email address to receive a password reset code.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            <Button
              fullWidth
              variant="contained"
              disabled={loading || !email}
              onClick={handleSendCode}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Sending Code...' : 'Send Reset Code'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              A reset code has been sent to {email}. Enter the code and your new password below.
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Reset Code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            <Button
              fullWidth
              variant="contained"
              disabled={loading || !code || !newPassword}
              onClick={handleResetPassword}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}