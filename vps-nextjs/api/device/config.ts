/**
 * Device Configuration API Endpoint
 * Allows devices to fetch their configuration from VPS.
 * 
 * GET /api/device/config
 * 
 * Headers:
 *   Authorization: Device {apiKey}
 *   X-Device-ID: {deviceId}
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

export async function GET(req: Request) {
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

    let device;
    try {
      device = await authenticateDevice(deviceIdHeader, apiKey);
    } catch (error) {
      return Response.json(
        { success: false, error: "Device authentication failed" },
        { status: 401 }
      );
    }

    const config = device.get("config") || {
      minMoisture: 30,
      maxMoisture: 70,
      minTemp: 10,
      maxTemp: 35,
      irrigationDuration: 1800,
      sensorInterval: 60,
      syncInterval: 300
    };

    return Response.json({
      success: true,
      config: config,
      deviceName: device.get("name"),
      lastUpdated: device.get("updatedAt")
    });

  } catch (error: any) {
    console.error("Config fetch error:", error);
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
