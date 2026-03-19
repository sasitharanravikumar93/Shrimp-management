import * as api from './api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('apiCall helper function', () => {
    it('makes GET request successfully', async () => {
      const mockResponse = { data: 'test' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getSeasons();

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/seasons', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(result).toEqual(mockResponse);
    });

    it('makes POST request successfully', async () => {
      const mockData = { name: 'Test Season' };
      const mockResponse = { id: '1', ...mockData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.createSeason(mockData);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5001/api/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(mockData)
      });

      expect(result).toEqual(mockResponse);
    });

    it('handles HTTP errors with JSON error response', async () => {
      const errorResponse = { message: 'Season not found' };

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(JSON.stringify(errorResponse))
      });

      await expect(api.getSeasonById('invalid-id')).rejects.toThrow('Season not found');
    });

    it('handles HTTP errors with plain text error response', async () => {
      const errorResponse = 'Not Found';

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve(errorResponse)
      });

      await expect(api.getSeasonById('invalid-id')).rejects.toThrow('Not Found');
    });

    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(api.getSeasons()).rejects.toThrow('Network error');
    });

    it('handles non-JSON responses', async () => {
      const mockResponse = 'Success message';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'text/plain'
        },
        text: () => Promise.resolve(mockResponse)
      });

      const result = await api.getSeasons();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Season API calls', () => {
    it('calls getSeasons endpoint', async () => {
      const mockResponse = [{ id: '1', name: 'Test Season' }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getSeasons();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/seasons',
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('calls getSeasonById endpoint', async () => {
      const seasonId = '1';
      const mockResponse = { id: seasonId, name: 'Test Season' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getSeasonById(seasonId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/seasons/${seasonId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('calls createSeason endpoint', async () => {
      const seasonData = { name: 'New Season' };
      const mockResponse = { id: '2', ...seasonData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.createSeason(seasonData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/seasons',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(seasonData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('calls updateSeason endpoint', async () => {
      const seasonId = '1';
      const seasonData = { name: 'Updated Season' };
      const mockResponse = { id: seasonId, ...seasonData };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.updateSeason(seasonId, seasonData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/seasons/${seasonId}`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(seasonData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('calls deleteSeason endpoint', async () => {
      const seasonId = '1';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve({})
      });

      await api.deleteSeason(seasonId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/seasons/${seasonId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });

  describe('Pond API calls', () => {
    it('calls getPonds endpoint', async () => {
      const mockResponse = [{ id: '1', name: 'Pond A' }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getPonds();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/ponds',
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('calls getPondById endpoint', async () => {
      const pondId = '1';
      const mockResponse = { id: pondId, name: 'Pond A' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getPondById(pondId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/ponds/${pondId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Feed Input API calls', () => {
    it('calls getFeedInputsByPondId endpoint', async () => {
      const pondId = '1';
      const mockResponse = [{ id: '1', pondId, quantity: 50 }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getFeedInputsByPondId(pondId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/feed-inputs/pond/${pondId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Growth Sampling API calls', () => {
    it('calls getGrowthSamplingsByPondId endpoint', async () => {
      const pondId = '1';
      const mockResponse = [{ id: '1', pondId, totalWeight: 500 }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getGrowthSamplingsByPondId(pondId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/growth-samplings/pond/${pondId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Water Quality Input API calls', () => {
    it('calls getWaterQualityInputsByPondId endpoint', async () => {
      const pondId = '1';
      const mockResponse = [{ id: '1', pondId, pH: 7.2 }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getWaterQualityInputsByPondId(pondId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/water-quality-inputs/pond/${pondId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Event API calls', () => {
    it('calls getEventsByPondId endpoint', async () => {
      const pondId = '1';
      const mockResponse = [{ id: '1', pondId, title: 'Feeding' }];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.getEventsByPondId(pondId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:5001/api/events/pond/${pondId}`,
        expect.objectContaining({
          method: 'GET'
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });
});
