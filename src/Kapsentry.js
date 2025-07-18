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
    this.apiKey = apiKey;
    this.apiHost = apiHost.replace(/\/+$/, ""); // remove trailing slash
  }

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
      console.log(`[Kapsentry] Sent log to: ${url}`, response.status);
      return response.data;
    } catch (err) {
      console.error(`[Kapsentry] Failed to send log to: ${url}`, err.message);
      return null;
    }
  }

  async createLog(logData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      ...logData,
    };

    return this.#post("/log", payload);
  }

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
