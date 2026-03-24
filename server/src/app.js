import express from "express";
import cors from "cors";

import HardwareConnection from "./models/HardwareConnection.js";
import { encryptText } from "./utils/crypto.js";

const REQUEST_TIMEOUT_MS = Number(process.env.HARDWARE_TIMEOUT_MS || 5000);
const DEVICE_PROTOCOL = process.env.HARDWARE_PROTOCOL || "http";

const ipRegex =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function validateHardwarePayload(payload) {
  const { ssid, password, ipAddress, port } = payload;

  if (!ssid || typeof ssid !== "string" || !ssid.trim()) {
    return "SSID is required.";
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return "Password is required and must be at least 8 characters.";
  }

  if (
    !ipAddress ||
    typeof ipAddress !== "string" ||
    !ipRegex.test(ipAddress.trim())
  ) {
    return "Valid IP address is required.";
  }

  const numericPort = Number(port);
  if (
    !Number.isInteger(numericPort) ||
    numericPort < 1 ||
    numericPort > 65535
  ) {
    return "Port must be a valid integer between 1 and 65535.";
  }

  return null;
}

async function callWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function buildBaseDeviceUrl(ipAddress, port) {
  return `${DEVICE_PROTOCOL}://${ipAddress}:${port}`;
}

async function verifyDeviceConnection(ipAddress, port) {
  const baseUrl = buildBaseDeviceUrl(ipAddress, port);

  try {
    const statusResponse = await callWithTimeout(`${baseUrl}/status`, {
      method: "GET",
    });

    if (!statusResponse.ok) {
      return {
        connected: false,
        message: `Device status endpoint returned ${statusResponse.status}.`,
      };
    }

    const contentType = statusResponse.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const payload = await statusResponse.json();
      const result =
        typeof payload === "string"
          ? payload
          : payload.status || payload.message;

      if (`${result}`.toLowerCase() === "ok") {
        return { connected: true, message: "Device is reachable." };
      }

      return {
        connected: false,
        message: "Device responded but did not return expected status.",
      };
    }

    const text = (await statusResponse.text()).trim().toLowerCase();

    if (text === "ok") {
      return { connected: true, message: "Device is reachable." };
    }

    return {
      connected: false,
      message: "Device status response did not match expected value.",
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        connected: false,
        message: "Timeout: Device not reachable within the allowed time.",
      };
    }

    return {
      connected: false,
      message: "Unable to reach hardware device.",
    };
  }
}

async function upsertHardwareConnection({
  ssid,
  password,
  ipAddress,
  port,
  status,
}) {
  const encryptedPassword = encryptText(password);

  return HardwareConnection.findOneAndUpdate(
    { ipAddress, port },
    {
      ssid: ssid.trim(),
      encryptedPassword,
      status,
      lastChecked: new Date(),
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: false,
  }),
);
app.use(express.json());

app.post("/connect-hardware", async (req, res) => {
  const validationError = validateHardwarePayload(req.body || {});
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const { ssid, password, ipAddress } = req.body;
  const port = Number(req.body.port);
  const baseUrl = buildBaseDeviceUrl(ipAddress, port);

  try {
    const connectResponse = await callWithTimeout(`${baseUrl}/connect`, {
      method: "POST",
      body: JSON.stringify({ ssid, password }),
    });

    if (!connectResponse.ok) {
      await upsertHardwareConnection({
        ssid,
        password,
        ipAddress,
        port,
        status: "not_connected",
      });

      return res.status(400).json({
        success: false,
        message: `Hardware rejected connection request with status ${connectResponse.status}.`,
      });
    }

    const statusCheck = await verifyDeviceConnection(ipAddress, port);

    await upsertHardwareConnection({
      ssid,
      password,
      ipAddress,
      port,
      status: statusCheck.connected ? "connected" : "not_connected",
    });

    return res.status(statusCheck.connected ? 200 : 400).json({
      success: statusCheck.connected,
      message: statusCheck.connected
        ? "Hardware connected successfully."
        : statusCheck.message,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message: "Timeout while contacting hardware.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server failed to connect to hardware.",
    });
  }
});

app.get("/hardware-status", async (req, res) => {
  let ipAddress = req.query.ipAddress;
  let port = req.query.port ? Number(req.query.port) : null;

  if (!ipAddress || !port) {
    const lastConnection = await HardwareConnection.findOne().sort({
      updatedAt: -1,
    });

    if (!lastConnection) {
      return res.status(404).json({
        success: false,
        message: "No hardware connection found.",
        status: "not_connected",
      });
    }

    ipAddress = lastConnection.ipAddress;
    port = lastConnection.port;
  }

  if (typeof ipAddress !== "string" || !ipRegex.test(ipAddress)) {
    return res.status(400).json({
      success: false,
      message: "Invalid IP address provided.",
      status: "not_connected",
    });
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return res.status(400).json({
      success: false,
      message: "Invalid port provided.",
      status: "not_connected",
    });
  }

  const check = await verifyDeviceConnection(ipAddress, port);
  const status = check.connected ? "connected" : "not_connected";

  await HardwareConnection.findOneAndUpdate(
    { ipAddress, port },
    {
      status,
      lastChecked: new Date(),
    },
    {
      new: true,
      upsert: false,
    },
  );

  return res.status(check.connected ? 200 : 503).json({
    success: check.connected,
    message: check.message,
    status,
    ipAddress,
    port,
  });
});

app.get("/health", (_, res) => {
  res.json({ success: true, message: "Server is running." });
});

app.use((error, _, res, __) => {
  console.error("Unhandled server error:", error);
  return res.status(500).json({
    success: false,
    message: "Unexpected server error.",
  });
});

export default app;
