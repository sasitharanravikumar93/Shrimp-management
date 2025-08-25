/**
 * RTL Demo Component
 * Demonstrates right-to-left language support functionality
 */

import {
  Language as LanguageIcon,
  Settings as SettingsIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  Grid
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRTL, RTLContainer, LanguageSwitcherRTL } from '../../utils/rtlUtils';
import { StyledCard, PrimaryButton, StatusChip } from '../ui/StyledComponents';

const RTLDemo = () => {
  const { t, i18n } = useTranslation();
  const { isRTL, direction, toggleDirection } = useRTL();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('home');

  // Available languages for demo
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
  ];

  const handleLanguageChange = languageCode => {
    i18n.changeLanguage(languageCode);
  };

  const demoContent = {
    en: {
      title: 'RTL Language Support Demo',
      description:
        'This demo showcases right-to-left (RTL) language support with proper text alignment, icon positioning, and layout mirroring.',
      features: [
        'Automatic text direction detection',
        'Icon and button mirroring',
        'Proper spacing and margins',
        'Theme integration with RTL'
      ],
      form: {
        name: 'Full Name',
        email: 'Email Address',
        message: 'Message',
        submit: 'Send Message'
      },
      navigation: ['Dashboard', 'Settings', 'Profile', 'Reports'],
      status: 'Active'
    },
    ar: {
      title: 'عرض توضيحي لدعم اللغات من اليمين إلى اليسار',
      description:
        'يعرض هذا العرض التوضيحي دعم اللغات من اليمين إلى اليسار مع محاذاة النص المناسبة وتموضع الأيقونات وانعكاس التخطيط.',
      features: [
        'اكتشاف اتجاه النص تلقائيًا',
        'انعكاس الأيقونات والأزرار',
        'التباعد والهوامش المناسبة',
        'تكامل المظهر مع RTL'
      ],
      form: {
        name: 'الاسم الكامل',
        email: 'عنوان البريد الإلكتروني',
        message: 'الرسالة',
        submit: 'إرسال الرسالة'
      },
      navigation: ['لوحة القيادة', 'الإعدادات', 'الملف الشخصي', 'التقارير'],
      status: 'نشط'
    }
  };

  const currentLang = isRTL ? 'ar' : 'en';
  const content = demoContent[currentLang];

  return (
    <RTLContainer>
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        {/* Demo Header */}
        <AppBar position='static' sx={{ mb: 3 }}>
          <Toolbar>
            <IconButton
              color='inherit'
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant='h6' sx={{ flexGrow: 1 }}>
              {content.title}
            </Typography>
            <LanguageSwitcherRTL
              languages={languages}
              currentLanguage={i18n.language}
              onLanguageChange={handleLanguageChange}
            />
          </Toolbar>
        </AppBar>

        <Grid container spacing={3}>
          {/* Language Controls */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Language & Direction Controls
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Switch checked={isRTL} onChange={toggleDirection} />}
                    label={`RTL Mode: ${isRTL ? 'ON' : 'OFF'}`}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    Current Direction: {direction.toUpperCase()}
                  </Typography>
                  <StatusChip label={content.status} status='success' size='small' />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Description */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Typography variant='h5' gutterBottom>
                  {content.title}
                </Typography>
                <Typography variant='body1' paragraph>
                  {content.description}
                </Typography>
                <Typography variant='h6' gutterBottom>
                  Key Features:
                </Typography>
                <List>
                  {content.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <StarIcon color='primary' />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Demo Form */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {isRTL ? 'نموذج تجريبي' : 'Demo Form'}
                </Typography>
                <Box component='form' sx={{ '& .MuiTextField-root': { mb: 2 } }}>
                  <TextField
                    fullWidth
                    label={content.form.name}
                    variant='outlined'
                    placeholder={content.form.name}
                  />
                  <TextField
                    fullWidth
                    label={content.form.email}
                    variant='outlined'
                    type='email'
                    placeholder={content.form.email}
                  />
                  <TextField
                    fullWidth
                    label={content.form.message}
                    variant='outlined'
                    multiline
                    rows={3}
                    placeholder={content.form.message}
                  />
                  <PrimaryButton
                    variant='contained'
                    fullWidth
                    endIcon={isRTL ? <ArrowBackIcon /> : <ArrowForwardIcon />}
                  >
                    {content.form.submit}
                  </PrimaryButton>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Navigation Demo */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {isRTL ? 'قائمة التنقل' : 'Navigation Menu'}
                </Typography>
                <List>
                  {content.navigation.map((item, index) => (
                    <ListItem
                      button
                      key={index}
                      selected={selectedItem === item}
                      onClick={() => setSelectedItem(item)}
                    >
                      <ListItemIcon>
                        {index === 0 && <HomeIcon />}
                        {index === 1 && <SettingsIcon />}
                        {index === 2 && <PersonIcon />}
                        {index === 3 && <LanguageIcon />}
                      </ListItemIcon>
                      <ListItemText primary={item} />
                      <ArrowForwardIcon />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Icons and Chips Demo */}
          <Grid item xs={12} md={6}>
            <StyledCard>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {isRTL ? 'الأيقونات والعلامات' : 'Icons & Chips'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <Chip
                    avatar={<Avatar>A</Avatar>}
                    label={isRTL ? 'نشط' : 'Active'}
                    color='success'
                    onDelete={() => {}}
                  />
                  <Chip
                    icon={<SettingsIcon />}
                    label={isRTL ? 'الإعدادات' : 'Settings'}
                    color='primary'
                    variant='outlined'
                  />
                  <Chip
                    avatar={<Avatar>U</Avatar>}
                    label={isRTL ? 'مستخدم' : 'User'}
                    color='secondary'
                  />
                </Box>
                <Alert severity='info' sx={{ mb: 2 }}>
                  {isRTL
                    ? 'تم تطبيق دعم RTL بنجاح على جميع المكونات!'
                    : 'RTL support has been successfully applied to all components!'}
                </Alert>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button startIcon={<ArrowBackIcon />} variant='outlined'>
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                  <Button endIcon={<ArrowForwardIcon />} variant='contained'>
                    {isRTL ? 'التالي' : 'Next'}
                  </Button>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>

      {/* Demo Drawer */}
      <Drawer
        anchor={isRTL ? 'right' : 'left'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Typography variant='h6' sx={{ flexGrow: 1 }}>
              {isRTL ? 'القائمة' : 'Menu'}
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {content.navigation.map((item, index) => (
              <ListItem button key={index}>
                <ListItemIcon>
                  {index === 0 && <HomeIcon />}
                  {index === 1 && <SettingsIcon />}
                  {index === 2 && <PersonIcon />}
                  {index === 3 && <LanguageIcon />}
                </ListItemIcon>
                <ListItemText primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </RTLContainer>
  );
};

export default RTLDemo;
