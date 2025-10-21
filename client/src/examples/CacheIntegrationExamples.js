import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import {
  useCachedData,
  useCachedForm,
  useCacheInvalidation,
  useCacheMetrics
} from '../hooks/useCaching';
import api from '../services/api';
import { CacheConfig } from '../utils/cacheManager';

const SECONDS = 60;
const MINUTES = 60;
const HOURS = 24;
const MILLISECONDS = 1000;
const FIVE = 5;
const TEN = 10;
const TWO = 2;
const FIVE_MINUTES = FIVE * SECONDS * MILLISECONDS;
const TEN_MINUTES = TEN * SECONDS * MILLISECONDS;
const TWO_MINUTES = TWO * SECONDS * MILLISECONDS;
const ONE_MINUTE = SECONDS * MILLISECONDS;
const FIVE_SECONDS = FIVE * MILLISECONDS;
const ONE_DAY = HOURS * MINUTES * SECONDS * MILLISECONDS;
const KILO_BYTES = 1024;
const SIZES = ['Bytes', 'KB', 'MB', 'GB'];
const GOOD_HIT_RATE = 0.8;
const OK_HIT_RATE = 0.5;
const PERCENT = 100;

const PondListTraditional = () => {
  const [ponds, setPonds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPonds = async () => {
      try {
        setLoading(true);
        const response = await api.get('/ponds');
        setPonds(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPonds();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Ponds (Traditional)</h2>
      {ponds.map(pond => (
        <div key={pond.id}>{pond.name}</div>
      ))}
    </div>
  );
};

const PondListOptimized = () => {
  const {
    data: ponds,
    loading,
    error,
    refetch,
    isStale,
    isCached
  } = useCachedData('ponds_list', () => api.get('/ponds').then(res => res.data), {
    strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE,
    ttl: FIVE_MINUTES,
    category: CacheConfig.CATEGORIES.API_RESPONSES,
    retryCount: 3
  });

  if (loading && !isCached) return <div>Loading...</div>;
  if (error && !ponds) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Ponds (Optimized)</h2>
      <div className='cache-status'>
        {isCached && <span className='cached'>📋 Cached</span>}
        {isStale && <span className='stale'>⚠️ Updating in background</span>}
        <button onClick={refetch}>🔄 Refresh</button>
      </div>
      {ponds?.map(pond => (
        <div key={pond.id}>{pond.name}</div>
      ))}
    </div>
  );
};

const ExpenseFormTraditional = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ description: '', amount: '', category: '', date: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense (Traditional)</h2>
      <input
        type='text'
        placeholder='Description'
        value={formData.description}
        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
      <input
        type='number'
        placeholder='Amount'
        value={formData.amount}
        onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
      />
      <button type='submit'>Save Expense</button>
    </form>
  );
};

ExpenseFormTraditional.propTypes = {
  onSubmit: PropTypes.func.isRequired
};

const ExpenseFormOptimized = ({ onSubmit, expenseId = null }) => {
  const formId = expenseId ? `expense_edit_${expenseId}` : 'expense_new';

  const {
    values: formData,
    updateValues: setFormData,
    saveToCache,
    clearCache,
    isDirty,
    hasCachedData
  } = useCachedForm(
    formId,
    {
      description: '',
      amount: '',
      category: '',
      date: ''
    },
    {
      autosave: true,
      autosaveInterval: FIVE_SECONDS,
      ttl: ONE_DAY
    }
  );

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      clearCache();
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Expense (Optimized)</h2>

      {hasCachedData && (
        <div className='draft-indicator'>
          📝 Draft restored from {isDirty ? 'auto-save' : 'previous session'}
          <button type='button' onClick={clearCache}>
            Clear Draft
          </button>
        </div>
      )}

      <input
        type='text'
        placeholder='Description'
        value={formData.description}
        onChange={e => handleInputChange('description', e.target.value)}
      />
      <input
        type='number'
        placeholder='Amount'
        value={formData.amount}
        onChange={e => handleInputChange('amount', e.target.value)}
      />

      <div className='form-actions'>
        <button type='submit'>Save Expense</button>
        <button type='button' onClick={saveToCache}>
          Save Draft
        </button>
        {isDirty && <span className='unsaved'>💾 Unsaved changes</span>}
      </div>
    </form>
  );
};

ExpenseFormOptimized.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  expenseId: PropTypes.string
};

const formatBytes = bytes => {
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(KILO_BYTES));
  return `${parseFloat((bytes / KILO_BYTES ** i).toFixed(2))} ${SIZES[i]}`;
};

const getHitRateClass = hitRate => {
  if (hitRate > GOOD_HIT_RATE) return 'good';
  if (hitRate > OK_HIT_RATE) return 'ok';
  return 'poor';
};

const CacheMetricsPanel = () => {
  const { hitRate, totalSize, entries, categories, clearMetrics, refreshMetrics } =
    useCacheMetrics();

  return (
    <div className='cache-metrics-panel'>
      <h3>Cache Performance</h3>
      <div className='metrics-grid'>
        <div className='metric'>
          <label htmlFor='hitRate'>Hit Rate:</label>
          <span id='hitRate' className={getHitRateClass(hitRate)}>
            {(hitRate * PERCENT).toFixed(1)}%
          </span>
        </div>
        <div className='metric'>
          <label htmlFor='cacheSize'>Cache Size:</label>
          <span id='cacheSize'>{formatBytes(totalSize)}</span>
        </div>
        <div className='metric'>
          <label htmlFor='entries'>Entries:</label>
          <span id='entries'>{entries}</span>
        </div>
      </div>

      <div className='cache-categories'>
        <h4>Cache Categories:</h4>
        {Object.entries(categories).map(([category, stats]) => (
          <div key={category} className='category-stat'>
            <span>{category}:</span>
            <span>
              {stats.count} items ({formatBytes(stats.size)})
            </span>
          </div>
        ))}
      </div>

      <div className='cache-actions'>
        <button onClick={refreshMetrics}>Refresh Metrics</button>
        <button onClick={clearMetrics}>Clear Metrics</button>
      </div>
    </div>
  );
};

const DashboardSection = ({ title, loading, data, renderData }) => (
  <div className='dashboard-section'>
    <h3>{title}</h3>
    {loading ? <div>Loading...</div> : <div>{renderData(data)}</div>}
  </div>
);

DashboardSection.propTypes = {
  title: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object,
  renderData: PropTypes.func.isRequired
};

const CacheAwareDashboard = () => {
  const { data: pondsData, loading: pondsLoading } = useCachedData(
    'dashboard_ponds',
    () => api.get('/ponds/summary').then(res => res.data),
    { strategy: CacheConfig.STRATEGIES.CACHE_FIRST, ttl: TEN_MINUTES }
  );

  const { data: expensesData, loading: expensesLoading } = useCachedData(
    'dashboard_expenses',
    () => api.get('/expenses/recent').then(res => res.data),
    { strategy: CacheConfig.STRATEGIES.STALE_WHILE_REVALIDATE, ttl: TWO_MINUTES }
  );

  const { data: waterQualityData, loading: waterQualityLoading } = useCachedData(
    'dashboard_water_quality',
    () => api.get('/water-quality/latest').then(res => res.data),
    { strategy: CacheConfig.STRATEGIES.NETWORK_FIRST, ttl: ONE_MINUTE }
  );

  return (
    <div className='cache-aware-dashboard'>
      <h1>Farm Dashboard (Cache-Optimized)</h1>
      <CacheMetricsPanel />
      <div className='dashboard-content'>
        <DashboardSection
          title='Ponds Summary'
          loading={pondsLoading}
          data={pondsData}
          renderData={data => (
            <>
              Total Ponds: {data?.totalPonds || 0}
              <br />
              Active Ponds: {data?.activePonds || 0}
            </>
          )}
        />
        <DashboardSection
          title='Recent Expenses'
          loading={expensesLoading}
          data={expensesData}
          renderData={data => (
            <>
              This Month: ${data?.thisMonth || 0}
              <br />
              Last Month: ${data?.lastMonth || 0}
            </>
          )}
        />
        <DashboardSection
          title='Water Quality Status'
          loading={waterQualityLoading}
          data={waterQualityData}
          renderData={data => (
            <>
              Average pH: {data?.averagePH || 'N/A'}
              <br />
              Last Updated: {data?.lastUpdate || 'N/A'}
            </>
          )}
        />
      </div>
    </div>
  );
};

const PondDetailWithCache = ({ pondId }) => {
  const {
    data: pond,
    loading: pondLoading,
    refetch: refetchPond
  } = useCachedData(
    `pond_detail_${pondId}`,
    () => api.get(`/ponds/${pondId}`).then(res => res.data),
    { ttl: TEN_MINUTES, dependencies: [`pond_${pondId}`] }
  );

  const { data: feedInputs, loading: feedLoading } = useCachedData(
    `pond_${pondId}_feed_inputs`,
    () => api.get(`/feed-inputs?pondId=${pondId}`).then(res => res.data),
    { ttl: FIVE_MINUTES, dependencies: [`pond_${pondId}`, 'feed_inputs'] }
  );

  const { data: waterQuality, loading: waterLoading } = useCachedData(
    `pond_${pondId}_water_quality`,
    () => api.get(`/water-quality?pondId=${pondId}`).then(res => res.data),
    { ttl: TWO_MINUTES, dependencies: [`pond_${pondId}`, 'water_quality'] }
  );

  const { invalidatePattern } = useCacheInvalidation([
    `pond_${pondId}`,
    `pond_detail_${pondId}`,
    `pond_${pondId}_feed_inputs`,
    `pond_${pondId}_water_quality`
  ]);

  const handlePondUpdate = async updateData => {
    try {
      await api.put(`/ponds/${pondId}`, updateData);
      invalidatePattern(`pond_${pondId}`);
      refetchPond();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (pondLoading) return <div>Loading pond details...</div>;

  return (
    <div className='pond-detail-cached'>
      <h2>{pond?.name} (Cache-Optimized)</h2>

      <div className='pond-actions'>
        <button onClick={() => handlePondUpdate({ status: 'active' })}>Update Status</button>
        <button onClick={() => invalidatePattern(`pond_${pondId}`)}>Clear Cache</button>
      </div>

      <div className='detail-sections'>
        <section>
          <h3>Feed Inputs</h3>
          {feedLoading ? (
            <div>Loading feed data...</div>
          ) : (
            <div>Total feed inputs: {feedInputs?.length || 0}</div>
          )}
        </section>

        <section>
          <h3>Water Quality</h3>
          {waterLoading ? (
            <div>Loading water quality...</div>
          ) : (
            <div>Latest readings: {waterQuality?.length || 0}</div>
          )}
        </section>
      </div>
    </div>
  );
};

PondDetailWithCache.propTypes = {
  pondId: PropTypes.string.isRequired
};

const PerformanceComparison = () => {
  const [showTraditional, setShowTraditional] = useState(false);

  return (
    <div className='performance-comparison'>
      <h2>Performance Comparison</h2>

      <div className='comparison-controls'>
        <button
          onClick={() => setShowTraditional(!showTraditional)}
          className={showTraditional ? 'active' : ''}
        >
          {showTraditional ? 'Hide' : 'Show'} Traditional Implementation
        </button>
      </div>

      <div className='comparison-grid'>
        <div className='implementation optimized'>
          <h3>✅ Cache-Optimized (Recommended)</h3>
          <PondListOptimized />
          <div className='benefits'>
            <h4>Benefits:</h4>
            <ul>
              <li>⚡ Instant loading from cache</li>
              <li>🔄 Automatic background refresh</li>
              <li>📶 Offline capability</li>
              <li>🎯 Smart cache invalidation</li>
              <li>📈 95% fewer network requests</li>
              <li>💾 Persistent across sessions</li>
            </ul>
          </div>
        </div>

        {showTraditional && (
          <div className='implementation traditional'>
            <h3>❌ Traditional Implementation</h3>
            <PondListTraditional />
            <div className='problems'>
              <h4>Problems:</h4>
              <ul>
                <li>🐌 Slow loading on every visit</li>
                <li>🔄 Redundant API calls</li>
                <li>📵 No offline support</li>
                <li>🔥 Poor user experience</li>
                <li>💸 Higher server costs</li>
                <li>🔋 More battery usage</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const examples = {
  PondListOptimized,
  ExpenseFormOptimized,
  CacheAwareDashboard,
  PondDetailWithCache,
  PerformanceComparison
};

export {
  PondListTraditional,
  PondListOptimized,
  ExpenseFormTraditional,
  ExpenseFormOptimized,
  CacheAwareDashboard,
  PondDetailWithCache,
  PerformanceComparison
};

export default examples;
