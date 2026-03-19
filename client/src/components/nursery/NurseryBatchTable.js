import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import StatusChip from './StatusChip';

const NurseryBatchTable = ({ batches, seasons, onEdit, onDelete, onView, deleteLoading }) => {
  const { t, i18n } = useTranslation();

  const getSeasonName = seasonId => {
    if (!seasonId) return 'N/A';
    const season = seasons.find(s => s._id === seasonId || s.id === seasonId);
    if (!season) return 'N/A';
    if (typeof season.name === 'object') {
      return season.name[i18n.language] || season.name.en;
    }
    return season.name;
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('batchName')}</TableCell>
            <TableCell>{t('startDate')}</TableCell>
            <TableCell>{t('initialCount')}</TableCell>
            <TableCell>{t('species')}</TableCell>
            <TableCell>{t('source')}</TableCell>
            <TableCell>{t('size')}</TableCell>
            <TableCell>{t('capacity')}</TableCell>
            <TableCell>{t('season.season')}</TableCell>
            <TableCell>{t('status')}</TableCell>
            <TableCell>{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {batches.map(batch => (
            <TableRow key={batch._id || batch.id}>
              <TableCell>
                {typeof batch.batchName === 'object'
                  ? batch.batchName[i18n.language] || batch.batchName.en
                  : batch.batchName}
              </TableCell>
              <TableCell>
                {batch.startDate ? format(new Date(batch.startDate), 'yyyy-MM-dd') : 'N/A'}
              </TableCell>
              <TableCell>{batch.initialCount}</TableCell>
              <TableCell>{batch.species}</TableCell>
              <TableCell>{batch.source}</TableCell>
              <TableCell>{batch.size}</TableCell>
              <TableCell>{batch.capacity}</TableCell>
              <TableCell>{getSeasonName(batch.seasonId)}</TableCell>
              <TableCell>
                <StatusChip status={batch.status} />
              </TableCell>
              <TableCell>
                <Tooltip title={t('view')}>
                  <IconButton size='small' onClick={() => onView(batch._id || batch.id)}>
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('edit')}>
                  <IconButton size='small' onClick={() => onEdit(batch)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('delete')}>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => onDelete(batch._id || batch.id)}
                    disabled={deleteLoading}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

NurseryBatchTable.propTypes = {
  batches: PropTypes.array.isRequired,
  seasons: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  deleteLoading: PropTypes.bool
};

export default NurseryBatchTable;
