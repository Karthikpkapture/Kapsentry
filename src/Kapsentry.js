const axios = require("axios");

class Kapsentry {
  constructor({
    projectId,
    apiKey,
    apiHost = "https://kapsentrynode-production.up.railway.app/api",
  }) {
    if (!projectId || !apiHost) {
      throw new Error(
        "Kapsentry config missing: projectId and apiHost are required."
      );
    }

    this.projectId = projectId;
    this.apiKey = apiKey; // apiKey is optional per your request
    this.apiHost = apiHost.replace(/\/+$/, ""); // remove trailing slash if any
  }

  /**
   * Internal helper to POST to Kapsentry API
   */
  async #post(path, payload) {
    const url = `${this.apiHost}${path}`;
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await axios.post(url, payload, { headers });
      // Optionally log: console.log(`[Kapsentry] Success: ${path}`, response.status);
      return response.data;
    } catch (err) {
      // Optionally log: console.error(`[Kapsentry] Failed: ${path}`, err.message);
      return null;
    }
  }

  /**
   * Create a log
   */
  async createLog(logData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      ...logData,
    };

    return this.#post("/log", payload);
  }

  /**
   * Track a custom event
   */
  async trackEvent(eventData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      level: "custom_event",
      ...eventData,
    };

    return this.#post("/event", payload);
  }
}

module.exports = { Kapsentry };
