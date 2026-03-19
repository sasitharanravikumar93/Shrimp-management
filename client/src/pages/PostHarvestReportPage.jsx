import { Print as PrintIcon } from '@mui/icons-material';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

import { useSeason } from '../context/SeasonContext';
import { getHarvests, getProfitAndLoss } from '../services/api';

const PostHarvestReportPage = () => {
  const { selectedSeason } = useSeason();
  const [loading, setLoading] = useState(true);
  const [harvests, setHarvests] = useState([]);
  const [financials, setFinancials] = useState(null);

  useEffect(() => {
    if (selectedSeason?.id) {
      setLoading(true);
      Promise.all([getHarvests(selectedSeason.id), getProfitAndLoss(selectedSeason.id)])
        .then(([hRes, fRes]) => {
          setHarvests(hRes);
          setFinancials(fRes);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedSeason]);

  const handlePrint = () => {
    window.print();
  };

  if (!selectedSeason)
    return (
      <Container>
        <Typography mt={5}>Select a season first.</Typography>
      </Container>
    );

  if (loading)
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );

  const totalBiomass = harvests.reduce((sum, h) => sum + h.totalBiomass, 0);
  const avgFCR =
    harvests.length > 0
      ? harvests.reduce((sum, h) => sum + (h.fcr || 0), 0) / harvests.filter(h => h.fcr).length
      : 0;
  const avgSurvival =
    harvests.length > 0
      ? harvests.reduce((sum, h) => sum + (h.survivalRate || 0), 0) /
        harvests.filter(h => h.survivalRate).length
      : 0;

  return (
    <Container maxWidth='lg' sx={{ mt: 4, mb: 4, '@media print': { mt: 0, p: 0, width: '100vw' } }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          '@media print': { display: 'none' }
        }}
      >
        <Typography variant='h4' component='h1'>
          Post-Harvest Report
        </Typography>
        <Button variant='contained' startIcon={<PrintIcon />} onClick={handlePrint}>
          Print / Export PDF
        </Button>
      </Box>

      {/* Main Print Container */}
      <Card
        elevation={0}
        variant='outlined'
        sx={{ p: 4, '@media print': { border: 'none', p: 0 } }}
      >
        <Typography variant='h3' align='center' gutterBottom>
          Season Summary Report
        </Typography>
        <Typography variant='h5' align='center' color='text.secondary' gutterBottom>
          Season: {selectedSeason.name}
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              variant='outlined'
              sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}
            >
              <CardContent>
                <Typography variant='h6'>Total Yield</Typography>
                <Typography variant='h3'>{totalBiomass.toLocaleString()} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              variant='outlined'
              sx={{
                height: '100%',
                bgcolor: financials?.netProfitLoss >= 0 ? 'success.light' : 'error.light',
                color: 'white'
              }}
            >
              <CardContent>
                <Typography variant='h6'>Net Profit/Loss</Typography>
                <Typography variant='h3'>
                  $
                  {Math.abs(financials?.netProfitLoss || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2
                  })}
                </Typography>
                <Typography variant='subtitle1'>
                  ({financials?.netProfitLoss >= 0 ? '+' : '-'}
                  {financials?.margin?.toFixed(2)}%)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant='outlined' sx={{ height: '100%', bgcolor: 'info.light', color: 'white' }}>
              <CardContent>
                <Typography variant='h6'>Farm Averages</Typography>
                <Typography variant='body1' fontSize={20}>
                  Survival Rate: {avgSurvival.toFixed(2)}%
                </Typography>
                <Typography variant='body1' fontSize={20}>
                  FCR: {avgFCR.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 5 }}>
          <Typography variant='h5' gutterBottom>
            Financials Breakdown
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography variant='body1'>Total Revenue from Sales</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body1' color='success.main' fontWeight='bold'>
                      $
                      {(financials?.totalRevenue || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant='body1'>Total Operational Cost (OPEX)</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body1' color='error.main' fontWeight='bold'>
                      -$
                      {(financials?.totalCost || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography variant='h6'>Net Margin</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography
                      variant='h6'
                      color={financials?.netProfitLoss >= 0 ? 'success.main' : 'error.main'}
                    >
                      $
                      {(financials?.netProfitLoss || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 5 }}>
          <Typography variant='h5' gutterBottom>
            Pond-by-Pond Harvest KPIs
          </Typography>
          <TableContainer component={Paper} variant='outlined'>
            <Table size='small'>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Pond</TableCell>
                  <TableCell align='right'>Biomass (kg)</TableCell>
                  <TableCell align='right'>ABW (g)</TableCell>
                  <TableCell align='right'>Survival (%)</TableCell>
                  <TableCell align='right'>FCR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {harvests.map(row => (
                  <TableRow key={row._id}>
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                    <TableCell>{row.pondId?.name || '-'}</TableCell>
                    <TableCell align='right'>{row.totalBiomass.toLocaleString()}</TableCell>
                    <TableCell align='right'>{row.finalABW.toFixed(2)}</TableCell>
                    <TableCell align='right'>{row.survivalRate?.toFixed(2) || '-'}</TableCell>
                    <TableCell align='right'>{row.fcr?.toFixed(2) || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box
          sx={{
            mt: 8,
            display: 'flex',
            justifyContent: 'space-between',
            '@media print': { pageBreakInside: 'avoid' }
          }}
        >
          <Box sx={{ width: '200px', borderTop: '1px solid black', pt: 1, textAlign: 'center' }}>
            <Typography variant='body2'>Manager Signature</Typography>
          </Box>
          <Box sx={{ width: '200px', borderTop: '1px solid black', pt: 1, textAlign: 'center' }}>
            <Typography variant='body2'>Owner Signature</Typography>
          </Box>
        </Box>
      </Card>
    </Container>
  );
};

export default PostHarvestReportPage;
