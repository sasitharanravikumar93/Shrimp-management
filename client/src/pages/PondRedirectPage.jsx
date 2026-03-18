import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSeason } from '../context/SeasonContext';
import { getPonds } from '../services/api';

const PondRedirectPage = () => {
  const { selectedSeason } = useSeason();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      if (!selectedSeason) {
        setLoading(false);
        return;
      }
      try {
        const url = `/ponds${selectedSeason._id ? `?seasonId=${selectedSeason._id}` : `?seasonId=${selectedSeason.id}`}`;
        const data = await window.fetch(`http://localhost:5001/api${url}`).then(r => r.json()); // using raw fetch or api layer?
        
        // Actually better to use getPonds from api
        const response = await getPonds(); 
        const seasonPonds = response.filter(p => p.seasonId === (selectedSeason._id || selectedSeason.id) || p.seasonId?._id === (selectedSeason._id || selectedSeason.id));

        if (seasonPonds.length > 0) {
          navigate(`/pond/${seasonPonds[0]._id || seasonPonds[0].id}`, { replace: true });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAndRedirect();
  }, [selectedSeason, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        No Ponds Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        There are no ponds configured for the currently selected season. 
        You must create a Pond via the Admin control panel before you can log metrics.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/admin')}>
        Go to Admin Settings
      </Button>
    </Container>
  );
};

export default PondRedirectPage;
