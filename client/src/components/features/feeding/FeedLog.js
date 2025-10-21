import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Collapse,
  useTheme,
  Skeleton
} from '@mui/material';
import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

// Feed type color palette
const FEED_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
  '#8dd1e1',
  '#d084d0',
  '#ffb347',
  '#ff6b9d',
  '#87ceeb',
  '#32cd32'
];

const FeedLog = ({ seasonId, pondId }) => {
  const [feedData, setFeedData] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generate date range for the current view
  const dateRange = useMemo(() => {
    const today = new Date();
    const days = expanded ? 90 : 7; // 90 days expanded view, 7 days default
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  }, [expanded]);

  // Fetch feed data
  useEffect(() => {
    // Only fetch if we have both seasonId and pondId
    if (!seasonId || !pondId) {
      setFeedData(null);
      setLoading(false);
      return;
    }

    const fetchFeedData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          seasonId: seasonId,
          pondId: pondId
        });

        const baseUrl = 'http://localhost:5001/api';
        const response = await fetch(`${baseUrl}/feed-inputs/histogram?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (response.ok) {
          setFeedData(data);
        } else {
          console.error('API Error:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch feed data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [dateRange, seasonId, pondId]);

  // Calculate summary statistics
  const statistics = useMemo(() => {
    if (!feedData?.data?.length) return null;

    const recentDays = Math.min(7, feedData.data.length);
    const recentData = feedData.data.slice(-recentDays);

    const today = feedData.data.length > 0 ? feedData.data[feedData.data.length - 1] : null;
    const yesterday = feedData.data.length > 1 ? feedData.data[feedData.data.length - 2] : null;

    return {
      todaysTotal: today
        ? Object.values(today)
            .filter(val => typeof val === 'number')
            .reduce((sum, val) => sum + val, 0)
        : 0,
      yesterdaysTotal: yesterday
        ? Object.values(yesterday)
            .filter(val => typeof val === 'number')
            .reduce((sum, val) => sum + val, 0)
        : 0,
      weekAverage: feedData.data.length > 0 ? feedData.summary?.averageDaily?.toFixed(1) : 0,
      totalQuantity: feedData.summary?.totalQuantity || 0
    };
  }, [feedData]);

  // Create color mapping for feed types
  const feedTypeColors = useMemo(() => {
    if (!feedData?.summary?.feedTypes) return {};

    const colorMap = {};
    feedData.summary.feedTypes.forEach((type, index) => {
      colorMap[type] = FEED_COLORS[index % FEED_COLORS.length];
    });
    return colorMap;
  }, [feedData]);

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <Box
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 'bold' }}>
            Date: {new Date(label).toLocaleDateString()}
          </Typography>
          <Typography variant='body2' sx={{ mb: 1, fontWeight: 'bold' }}>
            Total: {total.toFixed(1)} kg
          </Typography>
          {payload.map(
            (entry, index) =>
              entry.value > 0 && (
                <Typography key={index} variant='body2' sx={{ color: entry.color }}>
                  {entry.dataKey}: {entry.value.toFixed(1)} kg
                </Typography>
              )
          )}
        </Box>
      );
    }
    return null;
  };

  // Create fallback empty data for chart
  const getChartData = () => {
    if (feedData?.data?.length > 0) {
      return feedData.data;
    }

    // Create empty data structure for proper chart rendering
    const emptyData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      emptyData.push({ date: dateKey });
    }
    return emptyData;
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (loading && !feedData?.data?.length) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant='h6'>Feed Log</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3, textAlign: 'center' }}>
            {[1, 2, 3].map((_, index) => (
              <Box key={index} sx={{ width: '30%' }}>
                <Skeleton height={40} />
                <Skeleton variant='text' width={80} />
              </Box>
            ))}
          </Box>
          <Skeleton height={300} />
        </CardContent>
      </Card>
    );
  }

  if (!seasonId || !pondId) {
    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant='h6'>Feed Log</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
            Select a pond and season to view feed history data.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6'>Feed Log - Pond {pondId}</Typography>
          <Button
            onClick={toggleExpanded}
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size='small'
            variant='outlined'
          >
            {expanded ? 'Show 7 Days' : 'Expand Timeline'}
          </Button>
        </Box>

        {statistics && (
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3, textAlign: 'center' }}>
            <Box>
              <Typography variant='h5'>{statistics.todaysTotal.toFixed(1)} kg</Typography>
              <Typography variant='body2' color='text.secondary'>
                Today&apos;s Total Feed
              </Typography>
            </Box>
            <Box>
              <Typography variant='h5'>{statistics.yesterdaysTotal.toFixed(1)} kg</Typography>
              <Typography variant='body2' color='text.secondary'>
                Yesterday&apos;s Total Feed
              </Typography>
            </Box>
            <Box>
              <Typography variant='h5'>{statistics.weekAverage} kg</Typography>
              <Typography variant='body2' color='text.secondary'>
                {expanded ? '90-Day' : '7-Day'} Average
              </Typography>
            </Box>
          </Box>
        )}

        <Collapse in={expanded} timeout='auto' unmountOnExit>
          <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle1' gutterBottom>
              Full Timeline View (Last 90 Days)
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              Total Quantity: {statistics?.totalQuantity.toFixed(1)} kg
            </Typography>
          </Box>
        </Collapse>

        {!expanded && (
          <Typography variant='subtitle1' gutterBottom>
            Daily Feed Quantity (Last 7 Days)
          </Typography>
        )}

        <ResponsiveContainer width='100%' height={expanded ? 400 : 300}>
          {expanded ? (
            <LineChart data={getChartData()}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='date' tick={{ fontSize: 12 }} interval='preserveStartEnd' />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(feedData?.summary?.feedTypes?.length > 0
                ? feedData.summary.feedTypes
                : ['Starter Feed']
              ).map((type, index) => (
                <Line
                  key={type}
                  type='monotone'
                  dataKey={type}
                  stroke={feedTypeColors[type] || FEED_COLORS[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={getChartData()}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tick={{ fontSize: 12 }}
                tickFormatter={value => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {(feedData?.summary?.feedTypes?.length > 0
                ? feedData.summary.feedTypes
                : ['Starter Feed']
              ).map((type, index) => (
                <Bar
                  key={type}
                  dataKey={type}
                  stackId='feed'
                  fill={feedTypeColors[type] || FEED_COLORS[0]}
                  name={type}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>

        {!loading && feedData?.data?.length === 0 && (
          <Box
            sx={{
              mt: 2,
              p: 3,
              backgroundColor: 'background.paper',
              borderRadius: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              No feed data found for this pond and season combination. This could mean no feed
              inputs have been recorded yet for this time period.
            </Typography>
          </Box>
        )}

        {expanded && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              This timeline shows all feed types stacked/color-coded for the complete 90-day period.
              Use the expand/collapse button to switch between detailed histogram (7 days) and full
              timeline (90 days) views.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedLog;
