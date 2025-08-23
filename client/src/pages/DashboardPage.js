import React from 'react';

import { useParams } from 'react-router-dom';
import FarmOverview from '../components/FarmOverview';
import PondDetail from '../components/PondDetail';

const DashboardPage = () => {
  const { pondId } = useParams();
  console.log('DashboardPage - pondId:', pondId);

  return pondId ? <PondDetail pondId={pondId} /> : <FarmOverview />;
};

export default DashboardPage;
