const { Kapsentry } = require("./kapsentry");

// Replace these with your actual values
const kapsentry = new Kapsentry({
  projectId: "your-project-id",
  apiKey: "your-api-key", // optional now
  apiHost: "https://api.kapsentry.com",
});

async function testKapsentry() {
  console.log("Sending log...");
  const logResult = await kapsentry.createLog({
    level: "info",
    message: "Test log from Kapsentry client",
    extra: { foo: "bar" },
  });

  if (logResult) {
    console.log("✅ Log created:", logResult);
  } else {
    console.log("❌ Failed to create log");
  }

  console.log("Sending event...");
  const eventResult = await kapsentry.trackEvent({
    name: "test_event",
    properties: { key1: "value1", key2: "value2" },
  });

  if (eventResult) {
    console.log("✅ Event tracked:", eventResult);
  } else {
    console.log("❌ Failed to track event");
  }
}

testKapsentry().catch((err) => {
  console.error("Unexpected error:", err);
});
