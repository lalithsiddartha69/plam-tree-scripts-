/**
 * PALM GUARD IoT - API Service
 * Centralized HTTP client for backend REST communication with fallback & error handling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.detail || `HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`[API] Request failed for ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Health and System Diagnostics
  async getHealth() {
    return this.request('/api/health');
  }

  // Telemetry APIs
  async getLatestTelemetry() {
    return this.request('/api/latest');
  }

  async getTelemetryHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.hours) query.append('hours', params.hours);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/telemetry${queryString}`);
  }

  async postTelemetry(payload) {
    return this.request('/api/telemetry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Risk Engine APIs
  async getLatestRisk() {
    return this.request('/api/risk/latest');
  }

  async getRiskHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.hours) query.append('hours', params.hours);
    if (params.limit) query.append('limit', params.limit);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/risk${queryString}`);
  }

  async assessRisk(payload) {
    return this.request('/api/risk/assess', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Alert Management APIs
  async getAlerts(acknowledged = null) {
    const query = new URLSearchParams();
    if (acknowledged !== null) query.append('acknowledged', acknowledged);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/api/alerts${queryString}`);
  }

  async acknowledgeAlert(alertId) {
    return this.request(`/api/alerts/${alertId}/acknowledge`, {
      method: 'PUT',
    });
  }

  // Camera Visual Condition Inspection
  async getCameraStatus() {
    return this.request('/api/camera');
  }

  // Trigger Demo Presets (for Hackathon live presentation)
  async triggerDemoScenario(scenarioName) {
    return this.request(`/api/demo/scenario/${scenarioName}`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
export default api;
