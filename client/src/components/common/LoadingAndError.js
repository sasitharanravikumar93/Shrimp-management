import { Container, CircularProgress, Alert } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingAndError = ({ loading, error, children }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <Container
        maxWidth='lg'
        sx={{
          mt: 4,
          mb: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Alert severity='error'>
          {t('error_loading_data')}: {error}
        </Alert>
      </Container>
    );
  }

  return children;
};

LoadingAndError.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.object,
  children: PropTypes.node.isRequired
};

export default LoadingAndError;
