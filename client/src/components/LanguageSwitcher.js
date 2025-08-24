import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    
    // Change the language in the UI
    i18n.changeLanguage(newLanguage);
    
    // Save the language preference to localStorage
    localStorage.setItem('i18nextLng', newLanguage);
    
    // TODO: In a real application, you would also save the language preference to the backend
    // by making an API call to the PUT /api/settings/language endpoint
    console.log('Language changed to:', newLanguage);
  };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="language-select-label">{t('language')}</InputLabel>
      <Select
        labelId="language-select-label"
        value={i18n.language}
        onChange={handleLanguageChange}
        label={t('language')}
      >
        <MenuItem value="en">{t('english')}</MenuItem>
        <MenuItem value="hi">{t('hindi')}</MenuItem>
        <MenuItem value="ta">{t('tamil')}</MenuItem>
        <MenuItem value="kn">{t('kannada')}</MenuItem>
        <MenuItem value="te">{t('telugu')}</MenuItem>
        <MenuItem value="th">{t('thai')}</MenuItem>
        <MenuItem value="vi">{t('vietnamese')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSwitcher;