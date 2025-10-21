import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

const NurseryBatchFormSection = ({ formData, onInputChange, onDateChange, seasons, section }) => {
  const { t, i18n } = useTranslation();

  const renderField = field => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <TextField
            margin='dense'
            name={field.name}
            label={t(field.label)}
            type={field.type}
            fullWidth
            variant='outlined'
            sx={{ mt: 2 }}
            value={formData[field.name]}
            onChange={onInputChange}
            required={field.required}
          />
        );
      case 'date':
        return (
          <DatePicker
            label={t(field.label)}
            value={formData[field.name]}
            onChange={onDateChange}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                variant='outlined'
                sx={{ mt: 2 }}
                required={field.required}
              />
            )}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth variant='outlined' margin='dense' sx={{ mt: 2 }}>
            <InputLabel id={`${field.name}-select-label`}>{t(field.label)}</InputLabel>
            <Select
              labelId={`${field.name}-select-label`}
              name={field.name}
              value={formData[field.name]}
              onChange={onInputChange}
              label={t(field.label)}
              required={field.required}
            >
              {field.options.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'seasonSelect':
        return (
          <FormControl fullWidth variant='outlined' margin='dense' sx={{ mt: 2 }}>
            <InputLabel id='season-select-label'>{t('season.select_season')}</InputLabel>
            <Select
              labelId='season-select-label'
              name='seasonId'
              value={formData.seasonId}
              onChange={onInputChange}
              label={t('season.select_season')}
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
        );
      default:
        return null;
    }
  };

  return (
    <>
      {section.map(field => (
        <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
      ))}
    </>
  );
};

NurseryBatchFormSection.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  seasons: PropTypes.array.isRequired,
  section: PropTypes.array.isRequired
};

export default NurseryBatchFormSection;
