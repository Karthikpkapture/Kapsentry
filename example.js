const { Kapsentry } = require("./src/Kapsentry");

const logger = new Kapsentry({
  projectId: "abc123",
  apiKey: "xyz789",
  apiHost: "http://localhost:3000",
});

logger.createLog({
  method: "GET",
  path: "/api/test",
  status: 200,
  responseTime: 95,
});

logger.trackEvent({
  event: "user_signup",
  metadata: { userId: "u123" },
});
