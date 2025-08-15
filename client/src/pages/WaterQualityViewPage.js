import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Container,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const WaterQualityViewPage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pond, setPond] = useState('');
  const [parameter, setParameter] = useState('');
  const [search, setSearch] = useState('');

  // Placeholder data for water quality entries
  const waterQualityEntries = [
    { 
      id: 1, 
      date: '2023-06-15', 
      time: '08:00', 
      pond: 'Pond A', 
      pH: 7.2, 
      dissolvedOxygen: 5.5, 
      temperature: 28.5, 
      salinity: 25.0,
      ammonia: 0.1,
      nitrite: 0.05,
      alkalinity: 120
    },
    { 
      id: 2, 
      date: '2023-06-15', 
      time: '16:00', 
      pond: 'Pond A', 
      pH: 7.1, 
      dissolvedOxygen: 5.2, 
      temperature: 29.0, 
      salinity: 25.2,
      ammonia: 0.12,
      nitrite: 0.06,
      alkalinity: 118
    },
    { 
      id: 3, 
      date: '2023-06-15', 
      time: '08:30', 
      pond: 'Pond B', 
      pH: 7.3, 
      dissolvedOxygen: 5.8, 
      temperature: 28.0, 
      salinity: 24.8,
      ammonia: 0.08,
      nitrite: 0.04,
      alkalinity: 125
    },
  ];

  // Placeholder data for ponds
  const ponds = [
    { id: 1, name: 'Pond A' },
    { id: 2, name: 'Pond B' },
    { id: 3, name: 'Pond C' }
  ];

  // Water quality parameters
  const parameters = [
    'pH',
    'Dissolved Oxygen',
    'Temperature',
    'Salinity',
    'Ammonia',
    'Nitrite',
    'Alkalinity'
  ];

  const handleFilter = () => {
    // Implementation for filtering water quality entries would go here
    console.log({ startDate, endDate, pond, parameter, search });
  };

  const handleExport = () => {
    // Implementation for exporting data would go here
    console.log('Exporting data');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Water Quality History
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export Data
        </Button>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Filter Water Quality Data"
          subheader="Search and filter historical water quality entries"
          action={
            <IconButton>
              <FilterIcon />
            </IconButton>
          }
        />
        <CardContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="pond-select-label">Pond</InputLabel>
                  <Select
                    labelId="pond-select-label"
                    value={pond}
                    label="Pond"
                    onChange={(e) => setPond(e.target.value)}
                  >
                    <MenuItem value=""><em>All Ponds</em></MenuItem>
                    {ponds.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="parameter-select-label">Parameter</InputLabel>
                  <Select
                    labelId="parameter-select-label"
                    value={parameter}
                    label="Parameter"
                    onChange={(e) => setParameter(e.target.value)}
                  >
                    <MenuItem value=""><em>All Parameters</em></MenuItem>
                    {parameters.map((param, index) => (
                      <MenuItem key={index} value={param}>{param}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <IconButton>
                        <SearchIcon />
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />} 
                  onClick={handleFilter} 
                  size="large"
                  fullWidth
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>
      
      <Card elevation={3}>
        <CardHeader
          title="Water Quality Entries"
          subheader="Historical water quality records"
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Pond</TableCell>
                  <TableCell>pH</TableCell>
                  <TableCell>DO (mg/L)</TableCell>
                  <TableCell>Temp (°C)</TableCell>
                  <TableCell>Salinity (ppt)</TableCell>
                  <TableCell>Ammonia (mg/L)</TableCell>
                  <TableCell>Nitrite (mg/L)</TableCell>
                  <TableCell>Alkalinity (mg/L)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {waterQualityEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.pond}</TableCell>
                    <TableCell>{entry.pH}</TableCell>
                    <TableCell>{entry.dissolvedOxygen}</TableCell>
                    <TableCell>{entry.temperature}</TableCell>
                    <TableCell>{entry.salinity}</TableCell>
                    <TableCell>{entry.ammonia}</TableCell>
                    <TableCell>{entry.nitrite}</TableCell>
                    <TableCell>{entry.alkalinity}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small">
                          <SearchIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default WaterQualityViewPage;