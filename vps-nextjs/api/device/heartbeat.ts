/**
 * Device Heartbeat API Endpoint
 * Receives periodic heartbeats from devices to track online status.
 * 
 * POST /api/device/heartbeat
 * 
 * Headers:
 *   Authorization: Device {apiKey}
 *   X-Device-ID: {deviceId}
 * 
 * Body:
 *   {
 *     "deviceId": "abc123...",
 *     "timestamp": "2026-01-16T08:00:00Z",
 *     "status": "online"
 *   }
 */

import Parse from "parse/node";

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

    const { deviceId, timestamp, status } = await req.json();

    if (!deviceId || deviceId !== deviceIdHeader) {
      return Response.json(
        { success: false, error: "Device ID mismatch" },
        { status: 400 }
      );
    }

    let device;
    try {
      device = await authenticateDevice(deviceId, apiKey);
    } catch (error) {
      return Response.json(
        { success: false, error: "Device authentication failed" },
        { status: 401 }
      );
    }

    device.set("status", status || "online");
    device.set("lastSeen", new Date());
    await device.save(null, { useMasterKey: true });

    return Response.json({
      success: true,
      message: "Heartbeat received",
      serverTime: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Heartbeat error:", error);
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
