import React, { useState } from 'react';
import { Container, Typography, Box, Tabs, Tab } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';

import ExpenseDashboard from '../components/ExpenseDashboard';
import ExpenseList from '../components/ExpenseList';
import SalaryManagement from '../components/SalaryManagement';
import ExpenseReports from '../components/ExpenseReports';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`expense-tabpanel-${index}`}
      aria-labelledby={`expense-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ExpenseManagementPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Expense Management
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} aria-label="expense management tabs">
            <Tab label="Dashboard" icon={<AccountBalanceWalletIcon />} iconPosition="start" />
            <Tab label="Culture Expenses" icon={<BusinessCenterIcon />} iconPosition="start" />
            <Tab label="Farm Expenses" icon={<BusinessCenterIcon />} iconPosition="start" />
            <Tab label="Salaries" icon={<PeopleIcon />} iconPosition="start" />
            <Tab label="Reports" icon={<AssessmentIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        <TabPanel value={tabIndex} index={0}>
          <ExpenseDashboard />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <ExpenseList category="Culture" />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <ExpenseList category="Farm" />
        </TabPanel>
        <TabPanel value={tabIndex} index={3}>
          <SalaryManagement />
        </TabPanel>
        <TabPanel value={tabIndex} index={4}>
          <ExpenseReports />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ExpenseManagementPage;