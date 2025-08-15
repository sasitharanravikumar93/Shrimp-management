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

const FeedViewPage = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pond, setPond] = useState('');
  const [search, setSearch] = useState('');

  // Placeholder data for feed entries
  const feedEntries = [
    { id: 1, date: '2023-06-15', time: '08:00', pond: 'Pond A', feedType: 'Standard Pellet', quantity: 50 },
    { id: 2, date: '2023-06-15', time: '16:00', pond: 'Pond A', feedType: 'Standard Pellet', quantity: 45 },
    { id: 3, date: '2023-06-15', time: '08:30', pond: 'Pond B', feedType: 'High Protein Pellet', quantity: 60 },
    { id: 4, date: '2023-06-16', time: '08:00', pond: 'Pond A', feedType: 'Standard Pellet', quantity: 52 },
  ];

  // Placeholder data for ponds
  const ponds = [
    { id: 1, name: 'Pond A' },
    { id: 2, name: 'Pond B' },
    { id: 3, name: 'Pond C' }
  ];

  const handleFilter = () => {
    // Implementation for filtering feed entries would go here
    console.log({ startDate, endDate, pond, search });
  };

  const handleExport = () => {
    // Implementation for exporting data would go here
    console.log('Exporting data');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Feed History
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export Data
        </Button>
      </Box>
      
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader
          title="Filter Feed Data"
          subheader="Search and filter historical feed entries"
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
          title="Feed Entries"
          subheader="Historical feed input records"
        />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Pond</TableCell>
                  <TableCell>Feed Type</TableCell>
                  <TableCell>Quantity (kg)</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {feedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.time}</TableCell>
                    <TableCell>{entry.pond}</TableCell>
                    <TableCell>{entry.feedType}</TableCell>
                    <TableCell>{entry.quantity}</TableCell>
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

export default FeedViewPage;