/**
 * Parse Cloud Code
 * Server-side logic for BAYYTI Smart Irrigation
 */

Parse.Cloud.define("hello", async (request) => {
  return "Hello from BAYYTI Cloud!";
});

/**
 * Before Save Hook for Device
 * Ensures device data integrity
 */
Parse.Cloud.beforeSave("Device", async (request) => {
  const device = request.object;
  
  // Ensure deviceId is unique
  if (device.isNew()) {
    const query = new Parse.Query("Device");
    query.equalTo("deviceId", device.get("deviceId"));
    const existing = await query.first({ useMasterKey: true });
    
    if (existing) {
      throw new Parse.Error(400, "Device ID already exists");
    }
  }
  
  // Set default status
  if (!device.get("status")) {
    device.set("status", "offline");
  }
});

/**
 * After Save Hook for SensorLog
 * Triggers AI decision making if needed
 */
Parse.Cloud.afterSave("SensorLog", async (request) => {
  const sensorLog = request.object;
  
  // Check if AI decision should be triggered
  const soilMoisture = sensorLog.get("soilMoisture");
  const temperature = sensorLog.get("temperature");
  
  if (soilMoisture < 30 || temperature > 35) {
    // Create AI input for processing
    const AIInput = Parse.Object.extend("AIInput");
    const aiInput = new AIInput();
    
    aiInput.set("device", sensorLog.get("device"));
    aiInput.set("deviceId", sensorLog.get("deviceId"));
    aiInput.set("sensorLog", sensorLog);
    aiInput.set("trigger", soilMoisture < 30 ? "low_moisture" : "high_temp");
    aiInput.set("processed", false);
    aiInput.set("timestamp", new Date());
    
    await aiInput.save(null, { useMasterKey: true });
  }
});

/**
 * Cloud Function: Get Device Statistics
 */
Parse.Cloud.define("getDeviceStats", async (request) => {
  const { deviceId } = request.params;
  const user = request.user;
  
  if (!user) {
    throw new Parse.Error(401, "Authentication required");
  }
  
  // Get device
  const Device = Parse.Object.extend("Device");
  const deviceQuery = new Parse.Query(Device);
  deviceQuery.equalTo("deviceId", deviceId);
  deviceQuery.equalTo("owner", user);
  
  const device = await deviceQuery.first({ useMasterKey: true });
  
  if (!device) {
    throw new Parse.Error(404, "Device not found");
  }
  
  // Get sensor logs count
  const SensorLog = Parse.Object.extend("SensorLog");
  const sensorQuery = new Parse.Query(SensorLog);
  sensorQuery.equalTo("device", device);
  const sensorCount = await sensorQuery.count({ useMasterKey: true });
  
  // Get irrigation logs count
  const IrrigationLog = Parse.Object.extend("IrrigationLog");
  const irrigationQuery = new Parse.Query(IrrigationLog);
  irrigationQuery.equalTo("device", device);
  const irrigationCount = await irrigationQuery.count({ useMasterKey: true });
  
  // Get alerts count
  const Alert = Parse.Object.extend("Alert");
  const alertQuery = new Parse.Query(Alert);
  alertQuery.equalTo("device", device);
  const alertCount = await alertQuery.count({ useMasterKey: true });
  
  return {
    deviceId: deviceId,
    sensorLogs: sensorCount,
    irrigationEvents: irrigationCount,
    alerts: alertCount,
    status: device.get("status"),
    lastSeen: device.get("lastSeen")
  };
});

/**
 * Cloud Function: Process AI Decisions
 */
Parse.Cloud.define("processAIDecisions", async (request) => {
  const { limit = 10 } = request.params;
  
  // Get unprocessed AI inputs
  const AIInput = Parse.Object.extend("AIInput");
  const query = new Parse.Query(AIInput);
  query.equalTo("processed", false);
  query.ascending("timestamp");
  query.limit(limit);
  
  const inputs = await query.find({ useMasterKey: true });
  
  const results = [];
  
  for (const input of inputs) {
    // Simple AI logic (replace with actual ML model)
    const trigger = input.get("trigger");
    let recommendation = "monitor";
    
    if (trigger === "low_moisture") {
      recommendation = "irrigate";
    } else if (trigger === "high_temp") {
      recommendation = "irrigate_evening";
    }
    
    // Mark as processed
    input.set("processed", true);
    input.set("recommendation", recommendation);
    input.set("processedAt", new Date());
    
    await input.save(null, { useMasterKey: true });
    
    results.push({
      id: input.id,
      deviceId: input.get("deviceId"),
      trigger: trigger,
      recommendation: recommendation
    });
  }
  
  return {
    processed: results.length,
    results: results
  };
});
