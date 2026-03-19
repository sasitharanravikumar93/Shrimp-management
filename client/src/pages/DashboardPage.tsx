import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

const FarmOverview = lazy(() => import('../components/features/farm/FarmOverview'));
const PondDetail = lazy(() => import('../components/features/ponds/PondDetail'));

const DashboardPage: React.FC = () => {
  const { pondId } = useParams<{ pondId: string }>();

  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      {pondId ? <PondDetail pondId={pondId} /> : <FarmOverview />}
    </Suspense>
  );
};

export default DashboardPage;
