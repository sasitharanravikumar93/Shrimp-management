import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Link, Box } from '@mui/material';
import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';

const routeLabels = {
  '': 'Dashboard',
  admin: 'Administration',
  pond: 'Pond Management',
  'feed-view': 'Feed History',
  'water-quality-view': 'Water Quality History',
  nursery: 'Nursery Management',
  'inventory-management': 'Inventory',
  harvest: 'Harvest & Sales',
  'historical-insights': 'Historical Insights'
};

const AppBreadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0) return null;

  const breadcrumbs = [
    { label: 'Dashboard', path: '/', isLast: pathSegments.length === 0 },
    ...pathSegments.map((segment, idx) => {
      const path = `/${pathSegments.slice(0, idx + 1).join('/')}`;
      const label =
        routeLabels[segment] ||
        (segment.match(/^[0-9a-fA-F]{24}$/)
          ? `Details`
          : segment.charAt(0).toUpperCase() + segment.slice(1));
      return {
        label,
        path,
        isLast: idx === pathSegments.length - 1
      };
    })
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}
        aria-label='breadcrumb'
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 0.5,
            color: 'text.secondary'
          }
        }}
      >
        {breadcrumbs.map((crumb, idx) => {
          if (crumb.isLast) {
            return (
              <Typography key={idx} color='text.primary' variant='body2' sx={{ fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            );
          }
          return (
            <Link
              key={idx}
              component={RouterLink}
              to={crumb.path}
              underline='hover'
              color='text.secondary'
              variant='body2'
              sx={{
                display: 'flex',
                alignItems: 'center',
                '&:hover': { color: 'primary.main' }
              }}
            >
              {idx === 0 && <HomeIcon sx={{ fontSize: 16, mr: 0.5 }} />}
              {crumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default AppBreadcrumbs;
