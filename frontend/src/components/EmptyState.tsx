import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AddCircleOutline } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionText, 
  onAction,
  icon = <AddCircleOutline fontSize="large" color="action" />
}) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        height: '100%'
      }}
    >
      <Box sx={{ color: 'text.secondary', mb: 2 }}>
        {icon}
      </Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 400, mb: 2 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button 
          variant="contained" 
          onClick={onAction}
          startIcon={<AddCircleOutline />}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;