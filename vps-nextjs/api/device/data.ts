/**
 * Device Data Submission API Endpoint
 * Receives sensor data from physical devices.
 * 
 * POST /api/device/data
 * 
 * Headers:
 *   Authorization: Device {apiKey}
 *   X-Device-ID: {deviceId}
 * 
 * Body:
 *   {
 *     "deviceId": "abc123...",
 *     "timestamp": "2026-01-16T08:00:00Z",
 *     "sensors": {
 *       "soil_moisture": 45.2,
 *       "temperature": 24.5,
 *       "humidity": 65.0,
 *       "water_flow": 0.0,
 *       "water_pressure": 2.5,
 *       "battery_voltage": 12.4,
 *       "solar_voltage": 18.2
 *     }
 *   }
 */

import Parse from "parse/node";

// Initialize Parse
Parse.initialize(
  process.env.PARSE_APP_ID || "YOUR_APP_ID",
  process.env.PARSE_JS_KEY || "YOUR_JS_KEY",
  process.env.PARSE_MASTER_KEY || "YOUR_MASTER_KEY"
);
Parse.serverURL = process.env.PARSE_SERVER_URL || "http://localhost:1337/parse";

async function authenticateDevice(deviceId: string, apiKey: string) {
  const Device = Parse.Object.extend("Device");
  const query = new Parse.Query(Device);
  query.equalTo("deviceId", deviceId);
  query.equalTo("apiKey", apiKey);

  const device = await query.first({ useMasterKey: true });
  
  if (!device) {
    throw new Error("Invalid device credentials");
  }

  return device;
}

export async function POST(req: Request) {
  try {
    // Parse authorization header
    const authHeader = req.headers.get("authorization");
    const deviceIdHeader = req.headers.get("x-device-id");

    if (!authHeader || !authHeader.startsWith("Device ")) {
      return Response.json(
        { success: false, error: "Invalid authorization header" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7); // Remove "Device " prefix

    if (!deviceIdHeader) {
      return Response.json(
        { success: false, error: "X-Device-ID header required" },
        { status: 400 }
      );
    }

    // Parse request body
    const { deviceId, timestamp, sensors } = await req.json();

    // Validate input
    if (!deviceId || deviceId !== deviceIdHeader) {
      return Response.json(
        { success: false, error: "Device ID mismatch" },
        { status: 400 }
      );
    }

    if (!sensors || typeof sensors !== "object") {
      return Response.json(
        { success: false, error: "Invalid sensor data" },
        { status: 400 }
      );
    }

    // Authenticate device
    let device;
    try {
      device = await authenticateDevice(deviceId, apiKey);
    } catch (error) {
      return Response.json(
        { success: false, error: "Device authentication failed" },
        { status: 401 }
      );
    }

    // Update device status
    device.set("status", "online");
    device.set("lastSeen", new Date());
    await device.save(null, { useMasterKey: true });

    // Store sensor data
    const SensorLog = Parse.Object.extend("SensorLog");
    const sensorLog = new SensorLog();
    
    sensorLog.set("device", device);
    sensorLog.set("deviceId", deviceId);
    sensorLog.set("timestamp", timestamp ? new Date(timestamp) : new Date());
    sensorLog.set("soilMoisture", sensors.soil_moisture);
    sensorLog.set("temperature", sensors.temperature);
    sensorLog.set("humidity", sensors.humidity);
    sensorLog.set("waterFlow", sensors.water_flow);
    sensorLog.set("waterPressure", sensors.water_pressure);
    sensorLog.set("batteryVoltage", sensors.battery_voltage);
    sensorLog.set("solarVoltage", sensors.solar_voltage);

    // Set ACL - same as device owner
    const deviceACL = device.getACL();
    if (deviceACL) {
      sensorLog.setACL(deviceACL);
    }

    await sensorLog.save(null, { useMasterKey: true });

    // Check for AI decision triggers (optional)
    // This can trigger AI irrigation logic based on sensor data
    const shouldTriggerAI = await checkAITriggers(device, sensors);

    return Response.json({
      success: true,
      message: "Sensor data received",
      logId: sensorLog.id,
      aiTriggered: shouldTriggerAI
    });

  } catch (error: any) {
    console.error("Device data error:", error);
    return Response.json(
      { 
        success: false, 
        error: "Internal server error",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function checkAITriggers(device: Parse.Object, sensors: any): Promise<boolean> {
  // Check if AI decision should be triggered based on sensor data
  // Example: Low soil moisture might trigger irrigation recommendation
  
  const soilMoisture = sensors.soil_moisture;
  const temperature = sensors.temperature;
  
  // Get device configuration
  const config = device.get("config") || {};
  const minMoisture = config.minMoisture || 30;
  const maxTemp = config.maxTemp || 35;
  
  // Simple trigger logic
  if (soilMoisture < minMoisture || temperature > maxTemp) {
    // Create AI input for decision making
    const AIInput = Parse.Object.extend("AIInput");
    const aiInput = new AIInput();
    
    aiInput.set("device", device);
    aiInput.set("deviceId", device.get("deviceId"));
    aiInput.set("timestamp", new Date());
    aiInput.set("sensors", sensors);
    aiInput.set("trigger", soilMoisture < minMoisture ? "low_moisture" : "high_temp");
    aiInput.set("processed", false);
    
    // Set ACL
    const deviceACL = device.getACL();
    if (deviceACL) {
      aiInput.setACL(deviceACL);
    }
    
    await aiInput.save(null, { useMasterKey: true });
    
    return true;
  }
  
  return false;
}
