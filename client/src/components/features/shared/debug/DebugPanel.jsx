/**
 * Debug Panel Component
 * Provides a floating debug interface for development
 */

import {
  BugReport,
  Close,
  Refresh,
  Download,
  Clear,
  ExpandMore,
  Speed,
  NetworkCheck,
  Person,
  Memory,
  Error as ErrorIcon,
  Info,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Alert
} from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { debugStore, DEBUG_CONFIG, DebugConsole } from '../../../utils/debugUtils';

// Debug panel is only available in development
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role='tabpanel'
    hidden={value !== index}
    id={`debug-tabpanel-${index}`}
    aria-labelledby={`debug-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const DebugPanel =
  process.env.NODE_ENV !== 'development'
    ? () => null
    : () => {
        const [open, setOpen] = useState(false);
        const [currentTab, setCurrentTab] = useState(0);
        const [entries, setEntries] = useState([]);
        const [filter, setFilter] = useState('');
        const [autoRefresh, setAutoRefresh] = useState(true);
        const [verboseMode, setVerboseMode] = useState(false);

        // Refresh debug data
        const refreshData = useCallback(() => {
          setEntries(debugStore.getEntries({ limit: 100 }));
        }, []);

        // Auto-refresh effect
        useEffect(() => {
          if (!autoRefresh) return;

          const interval = setInterval(refreshData, 1000);
          return () => clearInterval(interval);
        }, [autoRefresh, refreshData]);

        // Initial data load
        useEffect(() => {
          refreshData();
        }, [refreshData]);

        // Handle verbose mode toggle
        const handleVerboseToggle = useCallback(event => {
          const enabled = event.target.checked;
          setVerboseMode(enabled);

          if (enabled) {
            DebugConsole.enableVerboseLogging();
          } else {
            DebugConsole.disableVerboseLogging();
          }
        }, []);

        // Filter entries
        const filteredEntries = useMemo(() => {
          if (!filter) return entries;

          return entries.filter(
            entry =>
              entry.component?.toLowerCase().includes(filter.toLowerCase()) ||
              entry.type?.toLowerCase().includes(filter.toLowerCase()) ||
              JSON.stringify(entry.data).toLowerCase().includes(filter.toLowerCase())
          );
        }, [entries, filter]);

        // Get statistics
        const stats = useMemo(() => {
          const componentCounts = Object.fromEntries(debugStore.renderCounts);
          const errorCount = entries.filter(e => e.level >= 4).length;
          const warningCount = entries.filter(e => e.level === 3).length;
          const networkCalls = debugStore.networkCalls.length;
          const userActions = debugStore.userActions.length;

          return {
            componentCounts,
            errorCount,
            warningCount,
            networkCalls,
            userActions,
            totalEntries: entries.length
          };
        }, [entries]);

        const renderLogsTab = () => (
          <Box>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size='small'
                placeholder='Filter logs...'
                value={filter}
                onChange={e => setFilter(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button onClick={refreshData} startIcon={<Refresh />}>
                Refresh
              </Button>
              <Button onClick={() => debugStore.clear()} startIcon={<Clear />}>
                Clear
              </Button>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {filteredEntries.map((entry, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    {entry.level >= 4 ? (
                      <ErrorIcon color='error' />
                    ) : entry.level === 3 ? (
                      <Warning color='warning' />
                    ) : entry.level === 2 ? (
                      <Info color='info' />
                    ) : (
                      <CheckCircle color='success' />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2'>
                          {entry.component && (
                            <Chip label={entry.component} size='small' sx={{ mr: 1 }} />
                          )}
                          {entry.type}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography variant='caption' component='pre' sx={{ whiteSpace: 'pre-wrap' }}>
                        {JSON.stringify(entry.data, null, 2).substring(0, 200)}
                        {JSON.stringify(entry.data).length > 200 && '...'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

        const renderComponentsTab = () => (
          <Box>
            <Typography variant='h6' gutterBottom>
              Render Counts
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table stickyHeader size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell align='right'>Renders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(stats.componentCounts).map(([component, count]) => (
                    <TableRow key={component}>
                      <TableCell>{component}</TableCell>
                      <TableCell align='right'>
                        <Chip
                          label={count}
                          size='small'
                          color={count > 10 ? 'warning' : count > 5 ? 'info' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2 }}>
              <Typography variant='h6' gutterBottom>
                Component States
              </Typography>
              {Array.from(debugStore.componentStates.entries()).map(([component, state]) => (
                <Accordion key={component}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{component}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography component='pre' variant='caption' sx={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(state, null, 2)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        );

        const renderNetworkTab = () => (
          <Box>
            <Typography variant='h6' gutterBottom>
              Network Calls ({stats.networkCalls})
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {debugStore.networkCalls.slice(-20).map((call, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <NetworkCheck color={call.error ? 'error' : 'success'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={call.method || 'GET'} size='small' />
                        <Typography variant='body2' noWrap>
                          {call.url}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant='caption'>
                          Status: {call.status} | Duration: {call.duration?.toFixed(2)}ms
                        </Typography>
                        {call.error && (
                          <Typography variant='caption' color='error' display='block'>
                            Error: {call.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

        const renderUserActionsTab = () => (
          <Box>
            <Typography variant='h6' gutterBottom>
              User Actions ({stats.userActions})
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {debugStore.userActions.slice(-20).map((action, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant='body2'>{action.data.action}</Typography>
                        <Chip label={action.component} size='small' />
                      </Box>
                    }
                    secondary={
                      <Typography variant='caption'>
                        {new Date(action.data.timestamp).toLocaleTimeString()} | Path:{' '}
                        {action.data.path}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        );

        const renderPerformanceTab = () => (
          <Box>
            <Typography variant='h6' gutterBottom>
              Performance Marks
            </Typography>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {Array.from(debugStore.performanceMarks.entries()).map(([markId, mark]) => (
                <ListItem key={markId} divider>
                  <ListItemIcon>
                    <Speed />
                  </ListItemIcon>
                  <ListItemText
                    primary={mark.label}
                    secondary={`Started: ${(mark.startTime / 1000).toFixed(2)}s ago`}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Typography variant='h6' gutterBottom>
                Memory Usage
              </Typography>
              {performance.memory && (
                <Alert severity='info'>
                  <Typography variant='body2'>
                    Used: {(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB | Total:{' '}
                    {(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB | Limit:{' '}
                    {(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Alert>
              )}
            </Box>
          </Box>
        );

        const renderSettingsTab = () => (
          <Box>
            <Typography variant='h6' gutterBottom>
              Debug Settings
            </Typography>

            <FormControlLabel
              control={
                <Switch checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} />
              }
              label='Auto Refresh'
            />

            <FormControlLabel
              control={<Switch checked={verboseMode} onChange={handleVerboseToggle} />}
              label='Verbose Mode'
            />

            <Box sx={{ mt: 2 }}>
              <Button
                fullWidth
                variant='outlined'
                startIcon={<Download />}
                onClick={() => DebugConsole.exportDebugData()}
              >
                Export Debug Data
              </Button>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant='subtitle2' gutterBottom>
                Debug Configuration
              </Typography>
              <Typography variant='caption' component='pre' sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(DEBUG_CONFIG, null, 2)}
              </Typography>
            </Box>
          </Box>
        );

        return (
          <>
            {/* Floating Debug Button */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                zIndex: 2000
              }}
            >
              <Tooltip title='Debug Panel'>
                <IconButton
                  color='primary'
                  onClick={() => setOpen(true)}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  <Badge badgeContent={stats.errorCount} color='error'>
                    <BugReport />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>

            {/* Debug Panel Drawer */}
            <Drawer
              anchor='right'
              open={open}
              onClose={() => setOpen(false)}
              PaperProps={{
                sx: { width: 500, maxWidth: '90vw' }
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant='h6'>Debug Panel</Typography>
                  <IconButton onClick={() => setOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip label={`${stats.totalEntries} logs`} size='small' color='primary' />
                  <Chip label={`${stats.errorCount} errors`} size='small' color='error' />
                  <Chip label={`${stats.warningCount} warnings`} size='small' color='warning' />
                </Box>
              </Box>

              <Tabs
                value={currentTab}
                onChange={(e, newValue) => setCurrentTab(newValue)}
                variant='scrollable'
                scrollButtons='auto'
              >
                <Tab label='Logs' />
                <Tab label='Components' />
                <Tab label='Network' />
                <Tab label='Actions' />
                <Tab label='Performance' />
                <Tab label='Settings' />
              </Tabs>

              <TabPanel value={currentTab} index={0}>
                {renderLogsTab()}
              </TabPanel>
              <TabPanel value={currentTab} index={1}>
                {renderComponentsTab()}
              </TabPanel>
              <TabPanel value={currentTab} index={2}>
                {renderNetworkTab()}
              </TabPanel>
              <TabPanel value={currentTab} index={3}>
                {renderUserActionsTab()}
              </TabPanel>
              <TabPanel value={currentTab} index={4}>
                {renderPerformanceTab()}
              </TabPanel>
              <TabPanel value={currentTab} index={5}>
                {renderSettingsTab()}
              </TabPanel>
            </Drawer>
          </>
        );
      };

export default DebugPanel;
