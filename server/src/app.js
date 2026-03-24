import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

import HardwareConnection from "./models/HardwareConnection.js";
import Record from "./models/Record.js";
import RecordingSession from "./models/RecordingSession.js";
import { encryptText } from "./utils/crypto.js";

const REQUEST_TIMEOUT_MS = Number(process.env.HARDWARE_TIMEOUT_MS || 5000);
const DEVICE_PROTOCOL = process.env.HARDWARE_PROTOCOL || "http";
const DEFAULT_DEVICE_PORT = Number(process.env.DEFAULT_DEVICE_PORT || 80);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const extension = path.extname(file.originalname || "");
    cb(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});

const upload = multer({ storage });

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

  if (port !== undefined && port !== null && `${port}`.trim() !== "") {
    const numericPort = Number(port);
    if (
      !Number.isInteger(numericPort) ||
      numericPort < 1 ||
      numericPort > 65535
    ) {
      return "Port must be a valid integer between 1 and 65535.";
    }
  }

  return null;
}

async function callWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const hasBody = options.body !== undefined && options.body !== null;
    return await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
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

function getNormalizedPort(port) {
  if (port === undefined || port === null || `${port}`.trim() === "") {
    return DEFAULT_DEVICE_PORT;
  }

  return Number(port);
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

const CAMERA_PATHS = ["/camera", "/stream", "/video"];

function isCameraLikeResponse(response) {
  if (!response.ok) {
    return false;
  }

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();
  return (
    contentType.includes("multipart/x-mixed-replace") ||
    contentType.includes("video") ||
    contentType.includes("image") ||
    contentType.includes("application/octet-stream")
  );
}

async function checkCameraAvailability(ipAddress, port) {
  const baseUrl = buildBaseDeviceUrl(ipAddress, port);

  for (const streamPath of CAMERA_PATHS) {
    const candidateUrl = `${baseUrl}${streamPath}`;

    try {
      const response = await callWithTimeout(candidateUrl, {
        method: "GET",
      });

      if (isCameraLikeResponse(response)) {
        return {
          cameraAvailable: true,
          streamUrl: candidateUrl,
          message: "Camera stream detected.",
        };
      }
    } catch {
      continue;
    }
  }

  return {
    cameraAvailable: false,
    streamUrl: "",
    message: "Camera stream not available.",
  };
}

async function upsertHardwareConnection({
  ssid,
  password,
  ipAddress,
  port,
  status,
  cameraAvailable,
  streamUrl,
}) {
  const encryptedPassword = encryptText(password);

  return HardwareConnection.findOneAndUpdate(
    { ipAddress, port },
    {
      ssid: ssid.trim(),
      encryptedPassword,
      status,
      cameraAvailable: Boolean(cameraAvailable),
      streamUrl: streamUrl || "",
      lastChecked: new Date(),
      lastCameraChecked: new Date(),
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    },
  );
}

async function findDeviceFromQuery(query = {}) {
  let ipAddress = query.ipAddress;
  let port = query.port ? Number(query.port) : null;

  if (!ipAddress || !port) {
    const lastConnection = await HardwareConnection.findOne().sort({
      updatedAt: -1,
    });

    if (!lastConnection) {
      return null;
    }

    ipAddress = lastConnection.ipAddress;
    port = lastConnection.port;
  }

  return { ipAddress, port };
}

function buildRecordUrl(fileName) {
  return `/uploads/${fileName}`;
}

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: false,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadDir));

app.post("/connect-device", async (req, res) => {
  const validationError = validateHardwarePayload(req.body || {});
  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const { ssid, password, ipAddress } = req.body;
  const port = getNormalizedPort(req.body.port);
  const baseUrl = buildBaseDeviceUrl(ipAddress, port);

  try {
    try {
      await callWithTimeout(`${baseUrl}/connect`, {
        method: "POST",
        body: JSON.stringify({ ssid, password }),
      });
    } catch {
      // Ignore connect endpoint failures and still run status + camera checks.
    }

    const statusCheck = await verifyDeviceConnection(ipAddress, port);
    const cameraCheck = await checkCameraAvailability(ipAddress, port);

    await upsertHardwareConnection({
      ssid,
      password,
      ipAddress,
      port,
      status: statusCheck.connected ? "connected" : "not_connected",
      cameraAvailable: cameraCheck.cameraAvailable,
      streamUrl: cameraCheck.streamUrl,
    });

    return res.status(statusCheck.connected ? 200 : 400).json({
      success: statusCheck.connected,
      message: statusCheck.connected
        ? "Hardware connected successfully."
        : statusCheck.message,
      status: statusCheck.connected ? "connected" : "not_connected",
      cameraAvailable: cameraCheck.cameraAvailable,
      streamUrl: cameraCheck.streamUrl,
      lastCheckedTime: new Date().toISOString(),
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

app.get("/device-status", async (req, res) => {
  const device = await findDeviceFromQuery(req.query || {});
  if (!device) {
    return res.status(404).json({
      success: false,
      message: "No hardware connection found.",
      status: "not_connected",
    });
  }

  const { ipAddress, port } = device;

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

app.get("/camera-check", async (req, res) => {
  const device = await findDeviceFromQuery(req.query || {});
  if (!device) {
    return res.status(404).json({
      success: false,
      message: "No hardware connection found.",
      cameraAvailable: false,
    });
  }

  const { ipAddress, port } = device;
  const cameraCheck = await checkCameraAvailability(ipAddress, port);

  await HardwareConnection.findOneAndUpdate(
    { ipAddress, port },
    {
      cameraAvailable: cameraCheck.cameraAvailable,
      streamUrl: cameraCheck.streamUrl,
      lastCameraChecked: new Date(),
    },
    { new: true, upsert: false },
  );

  return res.status(200).json({
    success: true,
    cameraAvailable: cameraCheck.cameraAvailable,
    streamUrl: cameraCheck.streamUrl,
    lastCheckedTime: new Date().toISOString(),
    message: cameraCheck.message,
  });
});

app.post("/start-recording", async (req, res) => {
  const device = await findDeviceFromQuery(req.body || {});
  if (!device) {
    return res.status(404).json({
      success: false,
      message: "No hardware connection found.",
    });
  }

  const sessionId = randomUUID();
  const streamPath = req.body?.streamPath || "/stream";

  await RecordingSession.create({
    sessionId,
    ipAddress: device.ipAddress,
    port: device.port,
    streamPath,
    status: "recording",
  });

  return res.status(200).json({
    success: true,
    sessionId,
    message: "Recording started.",
  });
});

app.post("/stop-recording", upload.single("video"), async (req, res) => {
  const { sessionId, timestamp, detection } = req.body || {};

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({
      success: false,
      message: "sessionId is required.",
    });
  }

  const session = await RecordingSession.findOne({ sessionId });
  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Recording session not found.",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Video file is required as multipart field 'video'.",
    });
  }

  let parsedDetection = {};
  if (detection) {
    try {
      parsedDetection = JSON.parse(detection);
    } catch {
      parsedDetection = {};
    }
  }

  const record = await Record.create({
    type: "video",
    fileName: req.file.filename,
    fileUrl: buildRecordUrl(req.file.filename),
    mimeType: req.file.mimetype || "video/webm",
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    sourceIp: session.ipAddress,
    detection: parsedDetection,
  });

  session.status = "stopped";
  session.stoppedAt = new Date();
  await session.save();

  return res.status(200).json({
    success: true,
    message: "Recording stopped and saved.",
    record,
  });
});

app.post("/records/snapshot", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Snapshot image is required as multipart field 'image'.",
    });
  }

  let parsedDetection = {};
  if (req.body?.detection) {
    try {
      parsedDetection = JSON.parse(req.body.detection);
    } catch {
      parsedDetection = {};
    }
  }

  const record = await Record.create({
    type: "snapshot",
    fileName: req.file.filename,
    fileUrl: buildRecordUrl(req.file.filename),
    mimeType: req.file.mimetype || "image/jpeg",
    timestamp: req.body?.timestamp ? new Date(req.body.timestamp) : new Date(),
    sourceIp: req.body?.ipAddress || "",
    detection: parsedDetection,
  });

  return res.status(201).json({
    success: true,
    message: "Snapshot saved.",
    record,
  });
});

app.get("/records", async (_, res) => {
  const records = await Record.find({}).sort({ timestamp: -1 }).limit(100);

  return res.status(200).json({
    success: true,
    records,
  });
});

app.get("/stream", async (req, res) => {
  const device = await findDeviceFromQuery(req.query || {});
  if (!device) {
    return res.status(404).json({
      success: false,
      message: "No hardware connection found.",
    });
  }

  const cameraCheck = await checkCameraAvailability(
    device.ipAddress,
    device.port,
  );
  if (!cameraCheck.cameraAvailable) {
    return res.status(404).json({
      success: false,
      message: "Camera stream not available.",
    });
  }

  try {
    const upstream = await callWithTimeout(cameraCheck.streamUrl, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    if (!upstream.ok || !upstream.body) {
      return res.status(502).json({
        success: false,
        message: "Failed to proxy camera stream.",
      });
    }

    res.status(200);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-cache");

    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      res.write(Buffer.from(value));
    }

    return res.end();
  } catch {
    return res.status(504).json({
      success: false,
      message: "Stream proxy timed out.",
    });
  }
});

app.post("/connect-hardware", (req, res) => {
  return res.redirect(307, "/connect-device");
});

app.get("/hardware-status", (req, res) => {
  return res.redirect(307, "/device-status");
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
