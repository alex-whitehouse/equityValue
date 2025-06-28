import { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  IconButton,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

interface ConfirmSignUpModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onConfirm: () => void;
  onResendCode: () => void;
}

export default function ConfirmSignUpModal({ 
  open, 
  email,
  onClose, 
  onConfirm,
  onResendCode
}: ConfirmSignUpModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { confirmSignUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await confirmSignUp(email, code);
      onConfirm();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    
    try {
      await onResendCode();
    } catch (error) {
      setError('Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Verify Your Email
        <IconButton 
          aria-label="close" 
          onClick={onClose} 
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            A verification code has been sent to <strong>{email}</strong>. 
            Please enter the code below to verify your account.
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              margin="normal"
              required
              autoFocus
            />
            
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !code}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify Account'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button 
                onClick={handleResendCode}
                disabled={resending}
                sx={{ textTransform: 'none' }}
              >
                {resending ? 'Sending...' : "Didn't receive a code? Resend"}
              </Button>
            </Box>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
}