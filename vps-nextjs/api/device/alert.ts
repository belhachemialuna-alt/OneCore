/**
 * Device Alert API Endpoint
 * Receives alerts/notifications from physical devices.
 * 
 * POST /api/device/alert
 * 
 * Headers:
 *   Authorization: Device {apiKey}
 *   X-Device-ID: {deviceId}
 * 
 * Body:
 *   {
 *     "deviceId": "abc123...",
 *     "timestamp": "2026-01-16T08:00:00Z",
 *     "alert": {
 *       "type": "leak",
 *       "severity": "critical",
 *       "message": "Water leak detected",
 *       "details": {}
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
    const { deviceId, timestamp, alert } = await req.json();

    // Validate input
    if (!deviceId || deviceId !== deviceIdHeader) {
      return Response.json(
        { success: false, error: "Device ID mismatch" },
        { status: 400 }
      );
    }

    if (!alert || typeof alert !== "object") {
      return Response.json(
        { success: false, error: "Invalid alert data" },
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

    // Store alert
    const Alert = Parse.Object.extend("Alert");
    const alertObj = new Alert();
    
    alertObj.set("device", device);
    alertObj.set("deviceId", deviceId);
    alertObj.set("timestamp", timestamp ? new Date(timestamp) : new Date());
    alertObj.set("type", alert.type);
    alertObj.set("severity", alert.severity);
    alertObj.set("message", alert.message);
    alertObj.set("details", alert.details || {});
    alertObj.set("resolved", false);

    // Set ACL - same as device owner
    const deviceACL = device.getACL();
    if (deviceACL) {
      alertObj.setACL(deviceACL);
    }

    await alertObj.save(null, { useMasterKey: true });

    // Send notification to device owner (optional)
    await sendNotificationToOwner(device, alert);

    return Response.json({
      success: true,
      message: "Alert received",
      alertId: alertObj.id
    });

  } catch (error: any) {
    console.error("Alert error:", error);
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

async function sendNotificationToOwner(device: Parse.Object, alert: any) {
  // Send push notification or email to device owner
  // This is a placeholder - implement based on your notification system
  
  const owner = device.get("owner");
  if (!owner) return;

  // Example: Create notification record
  const Notification = Parse.Object.extend("Notification");
  const notification = new Notification();
  
  notification.set("user", owner);
  notification.set("device", device);
  notification.set("type", "device_alert");
  notification.set("title", `Device Alert: ${alert.type}`);
  notification.set("message", alert.message);
  notification.set("severity", alert.severity);
  notification.set("read", false);
  notification.set("timestamp", new Date());

  // Set ACL for owner
  const acl = new Parse.ACL(owner);
  notification.setACL(acl);

  await notification.save(null, { useMasterKey: true });
}
