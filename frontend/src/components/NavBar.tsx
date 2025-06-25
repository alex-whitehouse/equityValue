import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Switch,
  FormControlLabel,
  Box,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useTheme as useAppTheme } from '../context/ThemeContext';

interface NavBarProps {
  onPortfolioToggle: (show: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({ onPortfolioToggle }) => {
  const [showPortfolio, setShowPortfolio] = useState(false);
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useAppTheme();

  const handlePortfolioToggle = () => {
    const newShowPortfolio = !showPortfolio;
    setShowPortfolio(newShowPortfolio);
    onPortfolioToggle(newShowPortfolio);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: isDarkMode ? theme.palette.background.paper : theme.palette.primary.main,
        color: theme.palette.getContrastText(
          isDarkMode ? theme.palette.background.paper : theme.palette.primary.main
        ),
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            ASIC Margin
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={showPortfolio} 
                onChange={handlePortfolioToggle}
                color="secondary"
              />
            }
            label="Show Portfolio"
            labelPlacement="start"
            sx={{ color: 'inherit' }}
          />

          <FormControlLabel
            control={
              <Switch 
                checked={isDarkMode} 
                onChange={toggleTheme}
                color="secondary"
              />
            }
            label="Dark Mode"
            labelPlacement="start"
            sx={{ color: 'inherit' }}
          />

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;