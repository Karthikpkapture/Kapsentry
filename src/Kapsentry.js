// const axios = require("axios");

// class Kapsentry {
//   constructor({ projectId, apiKey, apiHost }) {
//     if (!projectId || !apiKey || !apiHost) {
//       throw new Error(
//         "Kapsentry config missing: projectId, apiKey, and apiHost are required."
//       );
//     }

//     this.projectId = projectId;
//     this.apiKey = apiKey;
//     this.apiHost = "https://api.kapsentry.com"; // remove trailing slash
//   }

//   async createLog(logData = {}) {
//     const payload = {
//       projectId: this.projectId,
//       timestamp: new Date().toISOString(),
//       ...logData,
//     };

//     try {
//       await axios.post(`${this.apiHost}/log`, payload, {
//         headers: {
//           Authorization: `Bearer ${this.apiKey}`,
//           "Content-Type": "application/json",
//         },
//       });
//     } catch (err) {
//       // Optionally log error: console.error('[Kapsentry] Log failed:', err.message);
//     }
//   }

//   async trackEvent(eventData = {}) {
//     const payload = {
//       projectId: this.projectId,
//       timestamp: new Date().toISOString(),
//       type: "custom_event",
//       ...eventData,
//     };

//     try {
//       await axios.post(`${this.apiHost}/event`, payload, {
//         headers: {
//           Authorization: `Bearer ${this.apiKey}`,
//           "Content-Type": "application/json",
//         },
//       });
//     } catch (err) {
//       // Optionally log error: console.error('[Kapsentry] Event log failed:', err.message);
//     }
//   }
// }

// module.exports = { Kapsentry };

const axios = require("axios");

class Kapsentry {
  constructor({
    projectId,
    apiKey,
    apiHost = "https://api.kapsentry.com",
    options = {},
  }) {
    if (!projectId || !apiKey) {
      throw new Error(
        "Kapsentry config missing: projectId and apiKey are required."
      );
    }

    this.projectId = projectId;
    this.apiKey = apiKey;
    this.apiHost = apiHost.replace(/\/$/, ""); // remove trailing slash if present

    // Additional configuration options
    this.options = {
      timeout: 5000, // request timeout in ms
      retryAttempts: 3,
      silent: false, // whether to suppress error logging
      batchSize: 1, // number of logs to batch before sending
      ...options,
    };

    this.batchedLogs = [];
  }

  async validateConnection() {
    try {
      await axios.post(
        `${this.apiHost}/validate`,
        {
          projectId: this.projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: this.options.timeout,
        }
      );
      return true;
    } catch (err) {
      this._handleError("Validation failed", err);
      return false;
    }
  }

  async createLog(logData = {}, level = "info") {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      level,
      ...logData,
    };

    return this._sendPayload("/log", payload);
  }

  async trackEvent(eventData = {}) {
    const payload = {
      projectId: this.projectId,
      timestamp: new Date().toISOString(),
      type: "custom_event",
      ...eventData,
    };

    return this._sendPayload("/event", payload);
  }

  // Private methods
  async _sendPayload(endpoint, payload) {
    if (this.options.batchSize > 1) {
      this.batchedLogs.push({ endpoint, payload });
      if (this.batchedLogs.length >= this.options.batchSize) {
        return this._sendBatch();
      }
      return;
    }

    let attempts = 0;
    while (attempts < this.options.retryAttempts) {
      try {
        return await axios.post(`${this.apiHost}${endpoint}`, payload, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: this.options.timeout,
        });
      } catch (err) {
        attempts++;
        if (attempts === this.options.retryAttempts) {
          this._handleError(`Failed to send to ${endpoint}`, err);
        }
      }
    }
  }

  async _sendBatch() {
    if (this.batchedLogs.length === 0) return;

    try {
      await axios.post(
        `${this.apiHost}/batch`,
        {
          logs: this.batchedLogs,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: this.options.timeout,
        }
      );
      this.batchedLogs = [];
    } catch (err) {
      this._handleError("Batch send failed", err);
    }
  }

  _handleError(message, error) {
    if (!this.options.silent) {
      console.error(`[Kapsentry] ${message}:`, error.message);
    }
    // You could also emit events here if you implement an event emitter
  }
}

module.exports = { Kapsentry };
