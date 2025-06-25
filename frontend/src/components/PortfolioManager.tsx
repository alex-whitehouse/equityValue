import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useTheme as useAppTheme } from '../context/ThemeContext';

interface Holding {
  id: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  notes: string;
}

const PortfolioManager: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [newHolding, setNewHolding] = useState<Omit<Holding, 'id'>>({ symbol: '', shares: 0, avgPrice: 0, notes: '' });
  const [editHolding, setEditHolding] = useState<Holding | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  const { isDarkMode } = useAppTheme();

  useEffect(() => {
    const savedHoldings = localStorage.getItem('portfolioHoldings');
    if (savedHoldings) {
      try {
        setHoldings(JSON.parse(savedHoldings));
      } catch (e) {
        console.error('Failed to parse saved holdings', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolioHoldings', JSON.stringify(holdings));
  }, [holdings]);

  const handleAddHolding = () => {
    if (!newHolding.symbol.trim()) return;
    
    const holding: Holding = {
      ...newHolding,
      id: Date.now().toString()
    };
    
    setHoldings([...holdings, holding]);
    setNewHolding({ symbol: '', shares: 0, avgPrice: 0, notes: '' });
    setOpenDialog(false);
  };

  const handleUpdateHolding = () => {
    if (!editHolding) return;
    
    setHoldings(holdings.map(h => 
      h.id === editHolding.id ? editHolding : h
    ));
    setEditHolding(null);
    setOpenDialog(false);
  };

  const handleDeleteHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const handleOpenDialog = (holding?: Holding) => {
    if (holding) {
      setEditHolding(holding);
      setNewHolding({ 
        symbol: holding.symbol, 
        shares: holding.shares, 
        avgPrice: holding.avgPrice, 
        notes: holding.notes 
      });
    } else {
      setEditHolding(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewHolding({ symbol: '', shares: 0, avgPrice: 0, notes: '' });
  };

  const totalValue = holdings.reduce((sum, holding) => 
    sum + (holding.shares * holding.avgPrice), 0
  );

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        backgroundColor: isDarkMode ? theme.palette.background.paper : theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h6" fontWeight={600}>
          Portfolio Manager
        </Typography>
        <Tooltip title="Add new holding">
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ textTransform: 'none' }}
          >
            Add Holding
          </Button>
        </Tooltip>
      </Box>

      {holdings.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: 200,
          textAlign: 'center'
        }}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Your portfolio is empty
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => handleOpenDialog()}
          >
            Add your first holding
          </Button>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Shares</TableCell>
                  <TableCell align="right">Avg Price</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.id}>
                    <TableCell sx={{ fontWeight: 500 }}>{holding.symbol}</TableCell>
                    <TableCell align="right">{holding.shares}</TableCell>
                    <TableCell align="right">${holding.avgPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">${(holding.shares * holding.avgPrice).toFixed(2)}</TableCell>
                    <TableCell sx={{ 
                      maxWidth: 150, 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {holding.notes}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(holding)}
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteHolding(holding.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              Total Holdings:
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              ${totalValue.toFixed(2)}
            </Typography>
          </Box>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editHolding ? 'Edit Holding' : 'Add New Holding'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: 2, 
            mt: 1,
            '& .MuiTextField-root': { mt: 1 }
          }}>
            <TextField
              autoFocus
              label="Stock Symbol"
              value={newHolding.symbol}
              onChange={(e) => setNewHolding({...newHolding, symbol: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Shares"
              type="number"
              value={newHolding.shares}
              onChange={(e) => setNewHolding({...newHolding, shares: Number(e.target.value)})}
              fullWidth
              required
            />
            <TextField
              label="Average Price"
              type="number"
              value={newHolding.avgPrice}
              onChange={(e) => setNewHolding({...newHolding, avgPrice: Number(e.target.value)})}
              fullWidth
              required
            />
            <TextField
              label="Notes"
              value={newHolding.notes}
              onChange={(e) => setNewHolding({...newHolding, notes: e.target.value})}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={editHolding ? handleUpdateHolding : handleAddHolding} 
            color="primary"
            variant="contained"
            disabled={!newHolding.symbol.trim()}
          >
            {editHolding ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PortfolioManager;