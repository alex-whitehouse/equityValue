import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import type { SxProps, Theme, SvgIconProps } from '@mui/material';

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactElement<SvgIconProps>;
  footer?: React.ReactNode;
  headerColor?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error';
  sx?: SxProps<Theme>;
  loading?: boolean;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  children,
  icon,
  footer,
  headerColor = 'primary',
  sx,
  loading = false
}) => {
  return (
    <Paper
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...sx
      }}
      className="card"
    >
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        >
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Header with background color */}
      <Box
        sx={{
          backgroundColor: `${headerColor}.main`,
          color: `${headerColor}.contrastText`,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}
      >
        {icon && React.cloneElement(icon, {
          sx: {
            fontSize: '1.5rem',
            color: 'inherit'
          }
        })}
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      
      {/* Content area */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        {children}
      </Box>
      
      {/* Footer section */}
      {footer && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: 'background.default'
          }}
        >
          {footer}
        </Box>
      )}
    </Paper>
  );
};

export default DataCard;