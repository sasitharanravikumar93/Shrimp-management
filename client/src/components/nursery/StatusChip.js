import { Chip } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

const StatusChip = ({ status }) => {
  let color = 'primary';
  if (status === 'Active') {
    color = 'success';
  } else if (status === 'Completed') {
    color = 'default';
  } else if (status === 'Inactive') {
    color = 'warning';
  }

  return <Chip label={status || 'Planning'} size='small' color={color} />;
};

StatusChip.propTypes = {
  status: PropTypes.string
};

export default StatusChip;
