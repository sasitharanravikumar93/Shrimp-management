import PropTypes from 'prop-types';
import React from 'react';

import NurseryBatchFormSection from './NurseryBatchFormSection';

const NurseryBatchFormFields = ({ formData, onInputChange, onDateChange, seasons }) => {
  const formSections = [
    [
      { name: 'batchName', label: 'batchName', type: 'text', required: true },
      { name: 'startDate', label: 'startDate', type: 'date', required: true }
    ],
    [
      { name: 'initialCount', label: 'initialCount', type: 'number', required: true },
      { name: 'species', label: 'species', type: 'text', required: true }
    ],
    [
      { name: 'source', label: 'source', type: 'text', required: true },
      { name: 'size', label: 'size', type: 'number', required: true }
    ],
    [
      { name: 'capacity', label: 'capacity', type: 'number', required: true },
      { name: 'seasonId', label: 'season', type: 'seasonSelect', required: true, options: seasons },
      {
        name: 'status',
        label: 'status',
        type: 'select',
        required: false,
        options: [
          { value: 'Planning', label: 'planning' },
          { value: 'Active', label: 'active' },
          { value: 'Inactive', label: 'inactive' },
          { value: 'Completed', label: 'completed' }
        ]
      }
    ]
  ];

  return (
    <>
      {formSections.map(section => (
        <NurseryBatchFormSection
          key={section[0].name}
          formData={formData}
          onInputChange={onInputChange}
          onDateChange={onDateChange}
          seasons={seasons}
          section={section}
        />
      ))}
    </>
  );
};

NurseryBatchFormFields.propTypes = {
  formData: PropTypes.object.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  seasons: PropTypes.array.isRequired
};

export default NurseryBatchFormFields;
