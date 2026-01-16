/**
 * Device Registration API Endpoint
 * Allows authenticated users to register/claim physical devices to their account.
 * 
 * POST /api/device/register
 * 
 * Headers:
 *   x-session-token: User session token from Parse
 * 
 * Body:
 *   {
 *     "deviceId": "abc123...",
 *     "name": "Smart Irrigation Box"
 *   }
 */

import Parse from "parse/node";
import crypto from "crypto";

// Initialize Parse (configure with your Parse Server details)
Parse.initialize(
  process.env.PARSE_APP_ID || "YOUR_APP_ID",
  process.env.PARSE_JS_KEY || "YOUR_JS_KEY",
  process.env.PARSE_MASTER_KEY || "YOUR_MASTER_KEY"
);
Parse.serverURL = process.env.PARSE_SERVER_URL || "http://localhost:1337/parse";

export async function POST(req: Request) {
  try {
    // Parse request body
    const { deviceId, name } = await req.json();

    // Validate input
    if (!deviceId || typeof deviceId !== "string") {
      return Response.json(
        { success: false, error: "Invalid deviceId" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string") {
      return Response.json(
        { success: false, error: "Device name is required" },
        { status: 400 }
      );
    }

    // Get session token from headers
    const sessionToken = req.headers.get("x-session-token");
    
    if (!sessionToken) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Authenticate user
    let user: Parse.User;
    try {
      user = await Parse.User.become(sessionToken);
    } catch (error) {
      return Response.json(
        { success: false, error: "Invalid session token" },
        { status: 401 }
      );
    }

    // Check if device already exists
    const Device = Parse.Object.extend("Device");
    const query = new Parse.Query(Device);
    query.equalTo("deviceId", deviceId);

    let device = await query.first({ useMasterKey: true });

    if (device) {
      // Device exists - check ownership
      const currentOwner = device.get("owner");
      
      if (currentOwner && currentOwner.id !== user.id) {
        return Response.json(
          { 
            success: false, 
            error: "Device already claimed by another user" 
          },
          { status: 409 }
        );
      }

      // Update existing device
      device.set("name", name);
      device.set("owner", user);
      device.set("status", "offline");
      device.set("lastSeen", new Date());
      
    } else {
      // Create new device
      device = new Device();
      device.set("deviceId", deviceId);
      device.set("name", name);
      device.set("owner", user);
      device.set("apiKey", crypto.randomUUID());
      device.set("status", "offline");
      device.set("lastSeen", new Date());
      device.set("createdAt", new Date());

      // Set ACL - only owner can read/write
      const acl = new Parse.ACL(user);
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      device.setACL(acl);
    }

    // Save device
    await device.save(null, { useMasterKey: true });

    // Return success with API key
    return Response.json({
      success: true,
      message: "Device registered successfully",
      device: {
        id: device.id,
        deviceId: device.get("deviceId"),
        name: device.get("name"),
        apiKey: device.get("apiKey"),
        status: device.get("status")
      }
    });

  } catch (error: any) {
    console.error("Device registration error:", error);
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

// GET endpoint to list user's devices
export async function GET(req: Request) {
  try {
    // Get session token from headers
    const sessionToken = req.headers.get("x-session-token");
    
    if (!sessionToken) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Authenticate user
    let user: Parse.User;
    try {
      user = await Parse.User.become(sessionToken);
    } catch (error) {
      return Response.json(
        { success: false, error: "Invalid session token" },
        { status: 401 }
      );
    }

    // Query user's devices
    const Device = Parse.Object.extend("Device");
    const query = new Parse.Query(Device);
    query.equalTo("owner", user);
    query.descending("createdAt");

    const devices = await query.find({ useMasterKey: true });

    // Format response
    const deviceList = devices.map(device => ({
      id: device.id,
      deviceId: device.get("deviceId"),
      name: device.get("name"),
      status: device.get("status"),
      lastSeen: device.get("lastSeen"),
      createdAt: device.get("createdAt")
    }));

    return Response.json({
      success: true,
      devices: deviceList
    });

  } catch (error: any) {
    console.error("Device list error:", error);
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
