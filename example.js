// const { Kapsentry } = require("./src/Kapsentry");

// const logger = new Kapsentry({
//   projectId: "abc123",
//   apiKey: "xyz789",
//   apiHost: "http://localhost:3000",
// });

// logger.createLog({
//   method: "GET",
//   path: "/api/test",
//   status: 200,
//   responseTime: 95,
// });

// logger.trackEvent({
//   event: "user_signup",
//   metadata: { userId: "u123" },
// });

const { Kapsentry } = require("kapsentry");

// Initialize with minimal configuration
const logger = new Kapsentry({
  projectId: "your-project-id",
  apiKey: "your-api-key",
});

// Or with advanced options
const loggerWithOptions = new Kapsentry({
  projectId: "your-project-id",
  apiKey: "your-api-key",
  apiHost: "https://your-custom-host.com", // optional
  options: {
    timeout: 10000,
    retryAttempts: 5,
    silent: true,
    batchSize: 10,
  },
});

// Validate connection
await logger.validateConnection();

// Create logs with different levels
await logger.createLog({ message: "User logged in", userId: "123" }, "info");
await logger.createLog(
  { message: "Operation failed", error: "Details" },
  "error"
);

// Track custom events
await logger.trackEvent({
  name: "button_click",
  properties: {
    buttonId: "submit",
    page: "checkout",
  },
});
