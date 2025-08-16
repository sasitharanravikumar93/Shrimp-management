import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSeasons } from '../services/api';

const SeasonContext = createContext();

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};

export const SeasonProvider = ({ children }) => {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        setLoading(true);
        const data = await getSeasons();
        setSeasons(data);
        
        // Set the first season as selected by default if none is selected
        if (!selectedSeason && data.length > 0) {
          // Find the active season or use the first one
          const activeSeason = data.find(season => season.status === 'Active') || data[0];
          setSelectedSeason(activeSeason);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [selectedSeason]);

  const selectSeason = (season) => {
    setSelectedSeason(season);
  };

  return (
    <SeasonContext.Provider value={{ 
      seasons, 
      selectedSeason, 
      selectSeason, 
      setSelectedSeason,
      loading, 
      error 
    }}>
      {children}
    </SeasonContext.Provider>
  );
};