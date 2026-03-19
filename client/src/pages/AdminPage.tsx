import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Search as SearchIcon,
  Agriculture as SeasonIcon,
  Waves as PondIcon,
  CloudDownload as ExportIcon
} from '@mui/icons-material';
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Tooltip,
  MenuItem,
  InputAdornment,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Skeleton,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { format } from 'date-fns';
import Papa from 'papaparse';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import ResponsiveTable from '../components/features/farm/ResponsiveTable';
import { useApiData, useApiMutation } from '../hooks/useApi';
import { useSeason } from '../context/SeasonContext';
import {
  getSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
  getPonds,
  createPond,
  updatePond,
  deletePond,
  copyPondDetails
} from '../services/api';

const AdminPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { refreshSeasons: refreshGlobalSeasons } = useSeason();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'season', 'pond'
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [sourceSeason, setSourceSeason] = useState('');
  const [targetSeason, setTargetSeason] = useState('');
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: '',
    size: '',
    capacity: '',
    seasonId: ''
  });

  // Fetch seasons
  const {
    data: seasonsData,
    loading: seasonsLoading,
    error: seasonsError,
    refetch: refetchSeasons
  } = useApiData(getSeasons, [], 'seasons', 1);

  // Fetch ponds
  const {
    data: pondsData,
    loading: pondsLoading,
    error: pondsError,
    refetch: refetchPonds
  } = useApiData(getPonds, [], 'ponds', 1);

  // Mutations
  const { mutate: createSeasonMutation } = useApiMutation(createSeason);
  const { mutate: updateSeasonMutation } = useApiMutation(updateSeason);
  const { mutate: deleteSeasonMutation } = useApiMutation(deleteSeason);
  const { mutate: createPondMutation } = useApiMutation(createPond);
  const { mutate: updatePondMutation } = useApiMutation(updatePond);
  const { mutate: deletePondMutation } = useApiMutation(deletePond);
  const { mutate: copyPondDetailsMutation } = useApiMutation(copyPondDetails);

  const handleTabChange = (event: any, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm('');
    setFilter('all');
    setPage(1);
  };

  const handleOpenDialog = (type: string, item: any = null) => {
    setDialogType(type);
    setEditingItem(item);

    if (item) {
      if (type === 'season') {
        setFormData({
          name: typeof item.name === 'object' ? item.name.en || '' : item.name || '',
          startDate: item.startDate ? format(new Date(item.startDate), 'yyyy-MM-dd') : '',
          endDate: item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '',
          status: item.status || '',
          size: '',
          capacity: '',
          seasonId: ''
        });
      } else if (type === 'pond') {
        setFormData({
          name: typeof item.name === 'object' ? item.name.en || '' : item.name || '',
          size: item.size || '',
          capacity: item.capacity || '',
          seasonId: item.seasonId?._id || item.seasonId || item.season?._id || item.season || '',
          status: item.status || '',
          startDate: '',
          endDate: ''
        });
      }
    } else {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: '',
        size: '',
        capacity: '',
        seasonId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const getFilteredData = useMemo(
    () => (data: any[]) => {
      let filtered = data || [];
      if (searchTerm) {
        filtered = filtered.filter(item =>
          Object.values(item).some(
            val => val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
      }
      if (filter !== 'all') {
        filtered = filtered.filter(
          item =>
            (item.status && item.status.toLowerCase() === filter) ||
            (item.type && item.type.toLowerCase() === filter)
        );
      }
      return filtered;
    },
    [searchTerm, filter]
  );

  const getPagedData = useMemo(
    () => (data: any[]) => {
      const filtered = getFilteredData(data);
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filtered.slice(startIndex, endIndex);
    },
    [getFilteredData, page, itemsPerPage]
  );

  const getTotalPages = useMemo(
    () => (data: any[]) => {
      const filtered = getFilteredData(data);
      return Math.ceil(filtered.length / itemsPerPage);
    },
    [getFilteredData, itemsPerPage]
  );

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event: any, newFilter: string | null) => {
    if (newFilter !== null) setFilter(newFilter);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (dialogType === 'season') {
        const seasonData = {
          name: { en: formData.name },
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status
        };
        if (editingItem) {
          await updateSeasonMutation(editingItem._id || editingItem.id, seasonData);
        } else {
          await createSeasonMutation(seasonData);
        }
        refetchSeasons();
        refreshGlobalSeasons();
      } else if (dialogType === 'pond') {
        const pondData = {
          name: { en: formData.name },
          size: parseFloat(formData.size),
          capacity: parseInt(formData.capacity),
          seasonId: formData.seasonId,
          status: formData.status
        };
        if (editingItem) {
          await updatePondMutation(editingItem._id || editingItem.id, pondData);
        } else {
          await createPondMutation(pondData);
        }
        refetchPonds();
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!id) return;
    if (window.confirm(`${t('are_you_sure')} ${t('delete')} ${type}?`)) {
      try {
        if (type === 'season') {
          await deleteSeasonMutation(id);
          refetchSeasons();
          refreshGlobalSeasons();
        } else if (type === 'pond') {
          await deletePondMutation(id);
          refetchPonds();
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleCopyPondDetails = async () => {
    if (!sourceSeason || !targetSeason) {
      alert(t('select_source_target_seasons'));
      return;
    }
    try {
      await copyPondDetailsMutation(sourceSeason, targetSeason);
      alert(t('pond_details_copied_successfully'));
      refetchPonds();
    } catch (error) {
      console.error('Error copying pond details:', error);
      alert(t('failed_to_copy_pond_details'));
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const yieldData = useMemo(
    () =>
      (seasonsData || [])
        .filter((season: any) => season.status === 'Completed')
        .map((season: any) => ({
          name: typeof season.name === 'object' ? season.name.en : season.name,
          yield: season.yield ? parseFloat(season.yield.toString().replace(' tons', '')) || 0 : 0
        })),
    [seasonsData]
  );

  const seasons = seasonsData || [];
  const ponds = pondsData || [];

  if (seasonsLoading || pondsLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {t('admin_panel')}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ExportIcon />}
          onClick={() =>
            exportToCSV(activeTab === 0 ? seasons : activeTab === 1 ? ponds : [], 'admin-data')
          }
        >
          {t('export_data')}
        </Button>
      </Box>

      <Card elevation={3}>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab icon={<SeasonIcon />} label={t('seasons')} iconPosition="start" />
            <Tab icon={<PondIcon />} label={t('ponds')} iconPosition="start" />
            <Tab icon={<CopyIcon />} label={t('copy_pond_details')} iconPosition="start" />
          </Tabs>

          {activeTab !== 2 && (
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                placeholder={t('search')}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 200 }}
              />

              <ToggleButtonGroup
                size="small"
                value={filter}
                exclusive
                onChange={handleFilterChange}
              >
                <ToggleButton value="all">{t('all')}</ToggleButton>
                {(activeTab === 0 || activeTab === 1) && (
                  <>
                    <ToggleButton value="active">{t('active')}</ToggleButton>
                    <ToggleButton value="planning">{t('planning')}</ToggleButton>
                    {activeTab === 0 ? (
                      <ToggleButton value="completed">{t('completed')}</ToggleButton>
                    ) : (
                      <ToggleButton value="inactive">{t('inactive')}</ToggleButton>
                    )}
                  </>
                )}
              </ToggleButtonGroup>
            </Box>
          )}

          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title={t('manage_seasons')}
                      action={
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog('season')}
                        >
                          {t('add_new_season')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <Box sx={{ height: 300, mb: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={yieldData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="yield" name={t('season_yield')} fill="#2563EB" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>

                      <ResponsiveTable
                        columns={[
                          {
                            id: 'name',
                            label: t('name'),
                            render: (value: any) =>
                              typeof value === 'object' ? value[i18n.language] || value.en : value
                          },
                          {
                            id: 'startDate',
                            label: t('startDate'),
                            render: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A')
                          },
                          {
                            id: 'endDate',
                            label: t('endDate'),
                            render: (value: any) => (value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A')
                          },
                          {
                            id: 'status',
                            label: t('status'),
                            render: (value: any) => (
                              <Chip
                                label={value || 'N/A'}
                                size="small"
                                color={
                                  value === 'Active' ? 'success' : value === 'Planning' ? 'warning' : 'default'
                                }
                              />
                            )
                          },
                          {
                            id: 'actions',
                            label: t('actions'),
                            render: (_: any, row: any) => (
                              <Box sx={{ display: 'flex' }}>
                                <IconButton size="small" onClick={() => handleOpenDialog('season', row)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete('season', row._id || row.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            )
                          }
                        ]}
                        data={getPagedData(seasons)}
                        rowKey="_id"
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                          count={getTotalPages(seasons)}
                          page={page}
                          onChange={(e, v) => setPage(v)}
                          color="primary"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardHeader
                      title={t('manage_ponds')}
                      action={
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleOpenDialog('pond')}
                        >
                          {t('add_new_pond')}
                        </Button>
                      }
                    />
                    <CardContent>
                      <ResponsiveTable
                        columns={[
                          {
                            id: 'name',
                            label: t('name'),
                            render: (value: any, row: any) => (
                              <Typography
                                onClick={() => navigate(`/pond/${row._id || row.id}`)}
                                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                              >
                                {typeof value === 'object' ? value[i18n.language] || value.en : value}
                              </Typography>
                            )
                          },
                          { id: 'size', label: t('size_m2') },
                          { id: 'capacity', label: t('capacity') },
                          {
                            id: 'seasonId',
                            label: t('season'),
                            render: (value: any) => {
                              if (!value) return 'N/A';
                              const nameObj = typeof value === 'object' ? value.name : null;
                              if (nameObj && typeof nameObj === 'object') {
                                return nameObj[i18n.language] || nameObj.en || 'Unnamed Season';
                              }
                              return value.name || value || 'Unnamed Season';
                            }
                          },
                          {
                            id: 'status',
                            label: t('status'),
                            render: (value: any) => (
                              <Chip
                                label={value || 'N/A'}
                                size="small"
                                color={
                                  value === 'Active' ? 'success' : value === 'Planning' ? 'warning' : 'default'
                                }
                              />
                            )
                          },
                          {
                            id: 'actions',
                            label: t('actions'),
                            render: (_: any, row: any) => (
                              <Box sx={{ display: 'flex' }}>
                                <IconButton size="small" onClick={() => handleOpenDialog('pond', row)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleDelete('pond', row._id || row.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            )
                          }
                        ]}
                        data={getPagedData(ponds)}
                        rowKey="_id"
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                          count={getTotalPages(ponds)}
                          page={page}
                          onChange={(e, v) => setPage(v)}
                          color="primary"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Card variant="outlined">
                <CardHeader title={t('copy_pond_details')} />
                <CardContent>
                  <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>{t('source_season')}</InputLabel>
                        <Select
                          value={sourceSeason}
                          label={t('source_season')}
                          onChange={(e) => setSourceSeason(e.target.value as string)}
                        >
                          {seasons.map((s: any) => (
                            <MenuItem key={s._id} value={s._id}>
                              {typeof s.name === 'object' ? s.name[i18n.language] || s.name.en : s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>{t('target_season')}</InputLabel>
                        <Select
                          value={targetSeason}
                          label={t('target_season')}
                          onChange={(e) => setTargetSeason(e.target.value as string)}
                        >
                          {seasons.map((s: any) => (
                            <MenuItem key={s._id} value={s._id}>
                              {typeof s.name === 'object' ? s.name[i18n.language] || s.name.en : s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleCopyPondDetails}
                        disabled={!sourceSeason || !targetSeason}
                      >
                        {t('copy_ponds')}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {(editingItem ? t('edit') : t('add')) + ' ' + (dialogType === 'season' ? t('season') : t('pond'))}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('name')}
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              {dialogType === 'season' ? (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('startDate')}
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('endDate')}
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('size_m2')}
                      name="size"
                      type="number"
                      value={formData.size}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={t('capacity')}
                      name="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>{t('season')}</InputLabel>
                      <Select
                        name="seasonId"
                        value={formData.seasonId}
                        label={t('season')}
                        onChange={handleInputChange}
                      >
                        {seasons.map((s: any) => (
                          <MenuItem key={s._id} value={s._id}>
                            {typeof s.name === 'object' ? s.name[i18n.language] || s.name.en : s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>{t('status')}</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label={t('status')}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Active">{t('active')}</MenuItem>
                    <MenuItem value="Planning">{t('planning')}</MenuItem>
                    {dialogType === 'season' && <MenuItem value="Completed">{t('completed')}</MenuItem>}
                    {dialogType === 'pond' && <MenuItem value="Inactive">{t('inactive')}</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
            <Button type="submit" variant="contained">{t('save')}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default AdminPage;
