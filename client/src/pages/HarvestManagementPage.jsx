import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Divider
} from '@mui/material';
import { Add as AddIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSeason } from '../context/SeasonContext';
import { getHarvests, createHarvest, getPonds, getSales, createSale } from '../services/api';

const HarvestManagementPage = () => {
  const { selectedSeason } = useSeason();
  const [harvests, setHarvests] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Harvest Modal
  const [openHarvest, setOpenHarvest] = useState(false);
  const [ponds, setPonds] = useState([]);
  const [harvestForm, setHarvestForm] = useState({
    pondId: '',
    date: new Date(),
    totalBiomass: '',
    finalABW: '',
    notes: ''
  });

  // Sale Modal
  const [openSale, setOpenSale] = useState(false);
  const [selectedHarvestId, setSelectedHarvestId] = useState('');
  const [saleForm, setSaleForm] = useState({
    date: new Date(),
    buyerName: '',
    quantitySold: '',
    pricePerKg: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [harvestRes, saleRes, pondsRes] = await Promise.all([
        getHarvests(selectedSeason?.id),
        getSales(),
        getPonds()
      ]);
      setHarvests(harvestRes);
      // Filter sales to match only current season's harvests
      const validHarvestIds = harvestRes.map(h => h._id);
      setSales(saleRes.filter(s => s.harvestId && validHarvestIds.includes(s.harvestId._id)));
      setPonds(pondsRes.filter(p => !selectedSeason || p.seasonId === selectedSeason.id));
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSeason]);

  const handleHarvestSubmit = async (e) => {
    e.preventDefault();
    try {
      await createHarvest({
        pondId: harvestForm.pondId,
        seasonId: selectedSeason.id,
        date: harvestForm.date,
        totalBiomass: Number(harvestForm.totalBiomass),
        finalABW: Number(harvestForm.finalABW),
        notes: harvestForm.notes
      });
      setOpenHarvest(false);
      fetchData();
    } catch (err) {
      alert('Error creating harvest: ' + err.message);
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSale({
        harvestId: selectedHarvestId,
        date: saleForm.date,
        buyerName: saleForm.buyerName,
        quantitySold: Number(saleForm.quantitySold),
        pricePerKg: Number(saleForm.pricePerKg),
        notes: saleForm.notes
      });
      setOpenSale(false);
      fetchData();
    } catch (err) {
      alert('Error logging sale: ' + err.message);
    }
  };

  const openLogSale = (harvestId) => {
    setSelectedHarvestId(harvestId);
    setOpenSale(true);
  };

  if (loading) return <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Container>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Harvest & Sales Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenHarvest(true)}>
          Log Harvest
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Harvests Table */}
      <Typography variant="h5" sx={{ mb: 2 }}>Recorded Harvests</Typography>
      <Card elevation={3} sx={{ mb: 5 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Pond</TableCell>
                <TableCell align="right">Biomass (kg)</TableCell>
                <TableCell align="right">Final ABW (g)</TableCell>
                <TableCell align="right">Survival Rate (%)</TableCell>
                <TableCell align="right">FCR</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {harvests.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No harvests recorded yet.</TableCell></TableRow>
              ) : (
                harvests.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{row.pondId?.name || '-'}</TableCell>
                    <TableCell align="right">{row.totalBiomass.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.finalABW.toFixed(2)}</TableCell>
                    <TableCell align="right">{row.survivalRate?.toFixed(2) || '-'}</TableCell>
                    <TableCell align="right">{row.fcr?.toFixed(2) || '-'}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" startIcon={<MoneyIcon />} onClick={() => openLogSale(row._id)}>
                        Log Sale
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Sales Table */}
      <Typography variant="h5" sx={{ mb: 2 }}>Sales Records</Typography>
      <Card elevation={3}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Pond / Harvest</TableCell>
                <TableCell align="right">Qty Sold (kg)</TableCell>
                <TableCell align="right">Price / kg</TableCell>
                <TableCell align="right">Total Revenue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center">No sales recorded yet.</TableCell></TableRow>
              ) : (
                sales.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{row.buyerName}</TableCell>
                    <TableCell>{row.harvestId?.pondId?.name || 'Unknown'}</TableCell>
                    <TableCell align="right">{row.quantitySold.toLocaleString()}</TableCell>
                    <TableCell align="right">${row.pricePerKg.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      ${row.totalRevenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Harvest Modal */}
      <Dialog open={openHarvest} onClose={() => setOpenHarvest(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log New Harvest</DialogTitle>
        <form onSubmit={handleHarvestSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Pond" required value={harvestForm.pondId} onChange={e => setHarvestForm({...harvestForm, pondId: e.target.value})}>
                  {ponds.map(p => <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker label="Harvest Date" value={harvestForm.date} onChange={date => setHarvestForm({...harvestForm, date})} renderInput={(params) => <TextField {...params} fullWidth required />} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Total Biomass (kg)" type="number" required value={harvestForm.totalBiomass} onChange={e => setHarvestForm({...harvestForm, totalBiomass: e.target.value})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Final ABW (g)" type="number" required value={harvestForm.finalABW} onChange={e => setHarvestForm({...harvestForm, finalABW: e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={3} value={harvestForm.notes} onChange={e => setHarvestForm({...harvestForm, notes: e.target.value})} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHarvest(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Sale Modal */}
      <Dialog open={openSale} onClose={() => setOpenSale(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Sale for Harvest</DialogTitle>
        <form onSubmit={handleSaleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Buyer Name" required value={saleForm.buyerName} onChange={e => setSaleForm({...saleForm, buyerName: e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker label="Sale Date" value={saleForm.date} onChange={date => setSaleForm({...saleForm, date})} renderInput={(params) => <TextField {...params} fullWidth required />} />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Quantity Sold (kg)" type="number" required value={saleForm.quantitySold} onChange={e => setSaleForm({...saleForm, quantitySold: e.target.value})} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Price per kg ($)" type="number" required inputProps={{ step: "0.01" }} value={saleForm.pricePerKg} onChange={e => setSaleForm({...saleForm, pricePerKg: e.target.value})} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={3} value={saleForm.notes} onChange={e => setSaleForm({...saleForm, notes: e.target.value})} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSale(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Sale</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default HarvestManagementPage;
