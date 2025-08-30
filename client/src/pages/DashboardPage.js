import React from 'react';
import { useParams } from 'react-router-dom';

import FarmOverview from '../components/features/farm/FarmOverview';
import PondDetail from '../components/features/ponds/PondDetail';

const DashboardPage = () => {
  const { pondId } = useParams();

  return pondId ? <PondDetail pondId={pondId} /> : <FarmOverview />;
};

export default DashboardPage;
