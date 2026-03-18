import React from 'react';
import { 
  Skeleton, 
  Card, 
  CardContent, 
  Box, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@mui/material';

// KPI Card skeleton
export const KPICardSkeleton = () => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={36} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="circular" width={50} height={50} />
      </Box>
    </CardContent>
  </Card>
);

// Chart card skeleton
export const ChartCardSkeleton = ({ height = 280 }) => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width="40%" height={28} />
        <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 2 }} />
      </Box>
      <Skeleton variant="rounded" width="100%" height={height} sx={{ borderRadius: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" width="30%" height={16} />
        <Skeleton variant="text" width="30%" height={16} />
      </Box>
    </CardContent>
  </Card>
);

// Pond card skeleton
export const PondCardSkeleton = () => (
  <Card elevation={0} sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Skeleton variant="text" width={120} height={28} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
        <Skeleton variant="circular" width={40} height={40} />
      </Box>
      <Skeleton variant="text" width="100%" height={16} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" width="100%" height={8} sx={{ mt: 1, borderRadius: 1 }} />
      <Skeleton variant="text" width="60%" height={16} sx={{ mt: 2 }} />
    </CardContent>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
      <Skeleton variant="text" width={60} height={30} />
      <Skeleton variant="text" width={60} height={30} />
    </Box>
  </Card>
);

// Table skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <Table>
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton variant="text" width="80%" height={20} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

// Dashboard skeleton — full page
export const DashboardSkeleton = () => (
  <Box sx={{ p: 0 }}>
    {/* Header */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      <Box>
        <Skeleton variant="text" width={200} height={36} />
        <Skeleton variant="text" width={340} height={20} sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton variant="rounded" width={160} height={40} sx={{ borderRadius: 2 }} />
    </Box>

    {/* KPI Cards */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
          <KPICardSkeleton />
        </Grid>
      ))}
    </Grid>

    {/* Charts */}
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <ChartCardSkeleton />
      </Grid>
      <Grid item xs={12} md={6}>
        <ChartCardSkeleton />
      </Grid>
    </Grid>

    {/* Pond cards */}
    <Card elevation={0} sx={{ mb: 4 }}>
      <CardContent>
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}>
              <PondCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  </Box>
);

export default DashboardSkeleton;
