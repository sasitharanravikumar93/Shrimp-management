import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NurseryBatchForm = ({ formData, onInputChange, onDateChange, seasons }) => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <TextField
        margin='dense'
        label={t('batchName')}
        type='text'
        fullWidth
        variant='outlined'
        value={formData.batchName}
        onChange={onInputChange}
        name='batchName'
        required
      />
      <DatePicker
        label={t('startDate')}
        value={formData.startDate}
        onChange={onDateChange}
        renderInput={params => (
          <TextField {...params} fullWidth variant='outlined' sx={{ mt: 2 }} required />
        )}
      />
      <TextField
        margin='dense'
        name='initialCount'
        label={t('initialCount')}
        type='number'
        fullWidth
        variant='outlined'
        sx={{ mt: 2 }}
        value={formData.initialCount}
        onChange={onInputChange}
        required
      />
      <TextField
        margin='dense'
        name='species'
        label={t('species')}
        type='text'
        fullWidth
        variant='outlined'
        sx={{ mt: 2 }}
        value={formData.species}
        onChange={onInputChange}
        required
      />
      <TextField
        margin='dense'
        name='source'
        label={t('source')}
        type='text'
        fullWidth
        variant='outlined'
        sx={{ mt: 2 }}
        value={formData.source}
        onChange={onInputChange}
        required
      />
      <TextField
        margin='dense'
        name='size'
        label={t('size')}
        type='number'
        fullWidth
        variant='outlined'
        sx={{ mt: 2 }}
        value={formData.size}
        onChange={onInputChange}
        required
      />
      <TextField
        margin='dense'
        name='capacity'
        label={t('capacity')}
        type='number'
        fullWidth
        variant='outlined'
        sx={{ mt: 2 }}
        value={formData.capacity}
        onChange={onInputChange}
        required
      />
      <FormControl fullWidth variant='outlined' margin='dense' sx={{ mt: 2 }}>
        <InputLabel id='season-select-label'>{t('season')}</InputLabel>
        <Select
          labelId='season-select-label'
          name='seasonId'
          value={formData.seasonId}
          onChange={onInputChange}
          label={t('season')}
          required
        >
          {seasons.map(season => (
            <MenuItem key={season._id || season.id} value={season._id || season.id}>
              {typeof season.name === 'object'
                ? season.name[i18n.language] || season.name.en
                : season.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth variant='outlined' margin='dense' sx={{ mt: 2 }}>
        <InputLabel id='status-select-label'>{t('status')}</InputLabel>
        <Select
          labelId='status-select-label'
          name='status'
          value={formData.status}
          onChange={onInputChange}
          label={t('status')}
        >
          <MenuItem value='Planning'>{t('planning')}</MenuItem>
          <MenuItem value='Active'>{t('active')}</MenuItem>
          <MenuItem value='Inactive'>{t('inactive')}</MenuItem>
          <MenuItem value='Completed'>{t('completed')}</MenuItem>
        </Select>
      </FormControl>
    </>
  );
};

NurseryBatchForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  seasons: PropTypes.array.isRequired
};

export default NurseryBatchForm;
