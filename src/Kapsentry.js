const axios = require("axios");

class Kapsentry {
  constructor({ projectId, apiKey, apiHost }) {
    if (!projectId || !apiKey || !apiHost) {
      throw new Error(
        "Kapsentry config missing: projectId, apiKey, and apiHost are required."
      );
    }

    this.projectId = projectId;
    this.apiKey = apiKey;
    this.apiHost = "https://api.kapsentry.com"; // remove trailing slash
  }

  async createLog(logData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      ...logData,
    };

    try {
      await axios.post(`${this.apiHost}/log`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      // Optionally log error: console.error('[Kapsentry] Log failed:', err.message);
    }
  }

  async trackEvent(eventData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      type: "custom_event",
      ...eventData,
    };

    try {
      await axios.post(`${this.apiHost}/event`, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      // Optionally log error: console.error('[Kapsentry] Event log failed:', err.message);
    }
  }
}

module.exports = { Kapsentry };
