/**
 * Device Irrigation Event API Endpoint
 * Receives irrigation events from physical devices.
 * 
 * POST /api/device/irrigation
 * 
 * Headers:
 *   Authorization: Device {apiKey}
 *   X-Device-ID: {deviceId}
 * 
 * Body:
 *   {
 *     "deviceId": "abc123...",
 *     "timestamp": "2026-01-16T08:00:00Z",
 *     "event": {
 *       "zone_id": 1,
 *       "action": "start",
 *       "duration": 1800,
 *       "water_used": 150.5,
 *       "trigger": "scheduled"
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

    const apiKey = authHeader.substring(7);

    if (!deviceIdHeader) {
      return Response.json(
        { success: false, error: "X-Device-ID header required" },
        { status: 400 }
      );
    }

    // Parse request body
    const { deviceId, timestamp, event } = await req.json();

    // Validate input
    if (!deviceId || deviceId !== deviceIdHeader) {
      return Response.json(
        { success: false, error: "Device ID mismatch" },
        { status: 400 }
      );
    }

    if (!event || typeof event !== "object") {
      return Response.json(
        { success: false, error: "Invalid event data" },
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

    // Store irrigation event
    const IrrigationLog = Parse.Object.extend("IrrigationLog");
    const irrigationLog = new IrrigationLog();
    
    irrigationLog.set("device", device);
    irrigationLog.set("deviceId", deviceId);
    irrigationLog.set("timestamp", timestamp ? new Date(timestamp) : new Date());
    irrigationLog.set("zoneId", event.zone_id);
    irrigationLog.set("action", event.action);
    irrigationLog.set("duration", event.duration);
    irrigationLog.set("waterUsed", event.water_used);
    irrigationLog.set("trigger", event.trigger);

    // Set ACL - same as device owner
    const deviceACL = device.getACL();
    if (deviceACL) {
      irrigationLog.setACL(deviceACL);
    }

    await irrigationLog.save(null, { useMasterKey: true });

    // Update device statistics
    await updateDeviceStats(device, event);

    return Response.json({
      success: true,
      message: "Irrigation event logged",
      logId: irrigationLog.id
    });

  } catch (error: any) {
    console.error("Irrigation event error:", error);
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

async function updateDeviceStats(device: Parse.Object, event: any) {
  // Update device statistics with irrigation data
  const stats = device.get("stats") || {
    totalWaterUsed: 0,
    totalIrrigations: 0,
    lastIrrigation: null
  };

  if (event.action === "start") {
    stats.totalIrrigations += 1;
    stats.lastIrrigation = new Date();
  }

  if (event.water_used) {
    stats.totalWaterUsed += event.water_used;
  }

  device.set("stats", stats);
  await device.save(null, { useMasterKey: true });
}
