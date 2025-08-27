import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { supportedLanguages } from '../../../../i18n/index';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = async event => {
    const newLanguage = event.target.value;

    // Change the language in the UI
    i18n.changeLanguage(newLanguage);

    // Save the language preference to localStorage
    localStorage.setItem('i18nextLng', newLanguage);

    // TODO: In a real application, you would also save the language preference to the backend
    // by making an API call to the PUT /api/settings/language endpoint
  };

  return (
    <FormControl fullWidth size='small'>
      <InputLabel id='language-select-label'>{t('language')}</InputLabel>
      <Select
        labelId='language-select-label'
        value={i18n.language}
        onChange={handleLanguageChange}
        label={t('language')}
      >
        {Object.values(supportedLanguages).map(language => (
          <MenuItem key={language.code} value={language.code}>
            {language.flag} {language.nativeName}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;

// Add PropTypes validation
LanguageSwitcher.propTypes = {
  // No props for this component
};
