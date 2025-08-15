import React, { createContext, useContext, useState } from 'react';

const SeasonContext = createContext();

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (!context) {
    throw new Error('useSeason must be used within a SeasonProvider');
  }
  return context;
};

export const SeasonProvider = ({ children }) => {
  const [selectedSeason, setSelectedSeason] = useState('Season 2023');

  return (
    <SeasonContext.Provider value={{ selectedSeason, setSelectedSeason }}>
      {children}
    </SeasonContext.Provider>
  );
};