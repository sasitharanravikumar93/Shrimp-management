import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Typography,
  Box,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const ResponsiveTable = ({ columns, data, onRowClick, rowKey }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (isMobile) {
    // Render as cards on mobile
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {data.map((row, index) => (
          <Card
            key={rowKey ? row[rowKey] : index}
            variant='outlined'
            onClick={() => onRowClick && onRowClick(row)}
            sx={{
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': onRowClick ? { boxShadow: 3 } : {}
            }}
          >
            <CardContent>
              {columns.map(column => (
                <Box key={column.id} sx={{ mb: 1 }}>
                  <Typography variant='caption' color='text.secondary'>
                    {column.label}
                  </Typography>
                  <Typography variant='body2' sx={{ wordBreak: 'break-word' }}>
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Render as table on desktop
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell key={column.id} sx={{ fontWeight: 'bold' }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={rowKey ? row[rowKey] : index}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? { backgroundColor: 'action.hover' } : {}
              }}
            >
              {columns.map(column => (
                <TableCell key={column.id}>
                  {column.render ? column.render(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;
