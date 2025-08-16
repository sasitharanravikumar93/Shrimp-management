import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import api from '../services/api';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    
    // Change the language in the UI
    i18n.changeLanguage(newLanguage);
    
    // Save the language preference to the backend
    try {
      await api.put('/settings/language', { language: newLanguage });
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  return (
    <FormControl fullWidth size="small">
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
      >
        <MenuItem value="en">{t('english')}</MenuItem>
        <MenuItem value="hi">{t('hindi')}</MenuItem>
        <MenuItem value="ta">{t('tamil')}</MenuItem>
        <MenuItem value="kn">{t('kannada')}</MenuItem>
        <MenuItem value="te">{t('telugu')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;