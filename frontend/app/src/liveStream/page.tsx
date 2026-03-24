"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type DeviceStatus = "Connected" | "Not Connected";

type DetectionData = {
  distance: number;
  angle: number;
  confidence: number;
  detected: boolean;
};

type RecordItem = {
  _id: string;
  type: "video" | "snapshot";
  fileUrl: string;
  timestamp: string;
  detection?: Partial<DetectionData>;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500";

export default function Page() {
  const [ipAddress, setIpAddress] = useState("");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [port, setPort] = useState("80");

  const [deviceStatus, setDeviceStatus] =
    useState<DeviceStatus>("Not Connected");
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [lastCheckedTime, setLastCheckedTime] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingCamera, setIsCheckingCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSessionId, setRecordingSessionId] = useState("");

  const [detectionData, setDetectionData] = useState<DetectionData>({
    distance: 0,
    angle: 0,
    confidence: 0,
    detected: false,
  });

  const [viewRecords, setViewRecords] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);

  const streamImgRef = useRef<HTMLImageElement | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const snapshotInFlightRef = useRef(false);
  const recordingActiveRef = useRef(false);

  const proxiedStreamUrl = useMemo(() => {
    if (!cameraAvailable || !ipAddress) {
      return "";
    }

    const query = new URLSearchParams({
      ipAddress,
      port: port || "80",
      _t: Date.now().toString(),
    });
    return `${API_BASE}/stream?${query.toString()}`;
  }, [cameraAvailable, ipAddress, port]);

  const updateDetection = useCallback(() => {
    if (deviceStatus !== "Connected") {
      return;
    }

    const detected = Math.random() > 0.55;
    const confidence = Number((Math.random() * 35 + 65).toFixed(1));

    setDetectionData({
      distance: Number((Math.random() * 16 + 1).toFixed(2)),
      angle: Number((Math.random() * 180 - 90).toFixed(1)),
      confidence,
      detected,
    });
  }, [deviceStatus]);

  useEffect(() => {
    const timer = setInterval(updateDetection, 1500);
    return () => clearInterval(timer);
  }, [updateDetection]);

  const drawCurrentFrameToCanvas = useCallback(() => {
    const canvas = captureCanvasRef.current;
    const image = streamImgRef.current;
    if (
      !canvas ||
      !image ||
      image.naturalWidth === 0 ||
      image.naturalHeight === 0
    ) {
      return false;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return false;
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return true;
  }, []);

  const uploadSnapshot = useCallback(async () => {
    if (!cameraAvailable || snapshotInFlightRef.current) {
      return;
    }

    const frameReady = drawCurrentFrameToCanvas();
    if (!frameReady || !captureCanvasRef.current) {
      return;
    }

    snapshotInFlightRef.current = true;
    captureCanvasRef.current.toBlob(
      async (blob) => {
        try {
          if (!blob) {
            return;
          }

          const formData = new FormData();
          formData.append("image", blob, `snapshot-${Date.now()}.jpg`);
          formData.append("ipAddress", ipAddress);
          formData.append("timestamp", new Date().toISOString());
          formData.append("detection", JSON.stringify(detectionData));

          await fetch(`${API_BASE}/records/snapshot`, {
            method: "POST",
            body: formData,
          });
        } finally {
          snapshotInFlightRef.current = false;
        }
      },
      "image/jpeg",
      0.85,
    );
  }, [cameraAvailable, detectionData, drawCurrentFrameToCanvas, ipAddress]);

  useEffect(() => {
    if (detectionData.detected) {
      uploadSnapshot();
    }
  }, [detectionData.detected, uploadSnapshot]);

  const connectDevice = async () => {
    setIsConnecting(true);
    setAlertMessage("");

    try {
      const response = await fetch(`${API_BASE}/connect-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress,
          ssid,
          password,
          port,
        }),
      });

      const data = await response.json();
      setDeviceStatus(data.success ? "Connected" : "Not Connected");
      setCameraAvailable(Boolean(data.cameraAvailable));
      setStreamUrl(data.streamUrl || "");
      setLastCheckedTime(data.lastCheckedTime || new Date().toISOString());

      if (!data.success) {
        setAlertMessage(data.message || "Device offline.");
      }
    } catch {
      setDeviceStatus("Not Connected");
      setAlertMessage("Unable to reach backend server.");
    } finally {
      setIsConnecting(false);
    }
  };

  const refreshDeviceStatus = useCallback(async () => {
    if (!ipAddress) {
      return;
    }

    try {
      const query = new URLSearchParams({ ipAddress, port: port || "80" });
      const response = await fetch(
        `${API_BASE}/device-status?${query.toString()}`,
      );
      const data = await response.json();
      setDeviceStatus(data.success ? "Connected" : "Not Connected");
    } catch {
      setDeviceStatus("Not Connected");
    }
  }, [ipAddress, port]);

  const checkCamera = async () => {
    setIsCheckingCamera(true);
    try {
      const query = new URLSearchParams({ ipAddress, port: port || "80" });
      const response = await fetch(
        `${API_BASE}/camera-check?${query.toString()}`,
      );
      const data = await response.json();
      setCameraAvailable(Boolean(data.cameraAvailable));
      setStreamUrl(data.streamUrl || "");
      setLastCheckedTime(data.lastCheckedTime || new Date().toISOString());
    } catch {
      setCameraAvailable(false);
      setStreamUrl("");
    } finally {
      setIsCheckingCamera(false);
    }
  };

  const startRecording = async () => {
    if (!cameraAvailable) {
      return;
    }

    setAlertMessage("");
    try {
      const sessionResponse = await fetch(`${API_BASE}/start-recording`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipAddress, port, streamPath: "/stream" }),
      });
      const sessionData = await sessionResponse.json();
      if (!sessionData.success || !sessionData.sessionId) {
        setAlertMessage(
          sessionData.message || "Could not start recording session.",
        );
        return;
      }

      const frameReady = drawCurrentFrameToCanvas();
      if (!frameReady || !captureCanvasRef.current) {
        setAlertMessage("Camera frame is not ready for recording yet.");
        return;
      }

      const stream = captureCanvasRef.current.captureStream(10);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      const drawLoop = () => {
        if (!recordingActiveRef.current) {
          return;
        }
        drawCurrentFrameToCanvas();
        requestAnimationFrame(drawLoop);
      };

      setRecordingSessionId(sessionData.sessionId);
      setIsRecording(true);
      recordingActiveRef.current = true;
      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      requestAnimationFrame(drawLoop);
    } catch {
      setAlertMessage("Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    setIsRecording(false);
    recordingActiveRef.current = false;

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });

    const videoBlob = new Blob(recordedChunksRef.current, {
      type: "video/webm",
    });

    if (!videoBlob.size || !recordingSessionId) {
      return;
    }

    const formData = new FormData();
    formData.append("video", videoBlob, `recording-${Date.now()}.webm`);
    formData.append("sessionId", recordingSessionId);
    formData.append("timestamp", new Date().toISOString());
    formData.append("detection", JSON.stringify(detectionData));

    try {
      const response = await fetch(`${API_BASE}/stop-recording`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        setAlertMessage(data.message || "Failed to save recording.");
      } else if (viewRecords) {
        loadRecords();
      }
    } catch {
      setAlertMessage("Unable to upload recording.");
    } finally {
      setRecordingSessionId("");
      recordedChunksRef.current = [];
    }
  };

  const loadRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await fetch(`${API_BASE}/records`);
      const data = await response.json();
      setRecords(Array.isArray(data.records) ? data.records : []);
    } catch {
      setRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(refreshDeviceStatus, 8000);
    return () => clearInterval(timer);
  }, [refreshDeviceStatus]);

  const visibleVideos = records.filter((record) => record.type === "video");

  return (
    <div className="min-h-screen bg-black px-6 py-5 text-zinc-100">
      <canvas ref={captureCanvasRef} className="hidden" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-emerald-400">
          Radar System Dashboard
        </h1>
        <div className="text-sm text-zinc-400">
          Status:{" "}
          <span
            className={
              deviceStatus === "Connected" ? "text-emerald-400" : "text-red-400"
            }
          >
            {deviceStatus}
          </span>
        </div>
      </div>

      {!cameraAvailable && deviceStatus === "Connected" && (
        <div className="mb-4 rounded-md border border-amber-700 bg-amber-950/50 px-4 py-2 text-amber-300">
          ⚠️ You do not have camera access
        </div>
      )}

      {alertMessage && (
        <div className="mb-4 rounded-md border border-red-800 bg-red-950/40 px-4 py-2 text-red-300">
          {alertMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-3 text-lg font-semibold text-emerald-400">
            Hardware Connection
          </h2>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Device IP Address
              </label>
              <input
                className={inputClass}
                value={ipAddress}
                onChange={(event) => setIpAddress(event.target.value)}
                placeholder="192.168.1.50"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                WiFi Name (SSID)
              </label>
              <input
                className={inputClass}
                value={ssid}
                onChange={(event) => setSsid(event.target.value)}
                placeholder="Radar-WiFi"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                WiFi Password
              </label>
              <input
                className={inputClass}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">
                Port (optional)
              </label>
              <input
                className={inputClass}
                value={port}
                onChange={(event) => setPort(event.target.value)}
                placeholder="80"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={connectDevice}
                disabled={isConnecting}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Device"}
              </button>
              <button
                onClick={checkCamera}
                disabled={isCheckingCamera}
                className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 disabled:opacity-50"
              >
                {isCheckingCamera ? "Checking..." : "Check Camera"}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-zinc-800 bg-black/60 p-3 text-sm">
            <h3 className="mb-2 font-semibold text-emerald-400">
              Camera Access Details
            </h3>
            <p className="text-zinc-300">
              Camera Status:{" "}
              <span
                className={
                  cameraAvailable ? "text-emerald-400" : "text-red-400"
                }
              >
                {cameraAvailable ? "Available" : "Not Available"}
              </span>
            </p>
            <p className="truncate text-zinc-300">
              Stream URL:{" "}
              <span className="text-zinc-400">{streamUrl || "N/A"}</span>
            </p>
            <p className="text-zinc-300">
              Last Checked Time:{" "}
              <span className="text-zinc-400">
                {lastCheckedTime
                  ? new Date(lastCheckedTime).toLocaleString()
                  : "N/A"}
              </span>
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-emerald-400">
            Live Radar + Camera Integration
          </h2>

          <div className="relative h-[390px] overflow-hidden rounded-lg border border-zinc-800 bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),rgba(0,0,0,1)_70%)]" />
            <div className="absolute inset-0 animate-pulse border border-emerald-700/30" />

            {cameraAvailable && proxiedStreamUrl ? (
              <img
                ref={streamImgRef}
                src={proxiedStreamUrl}
                alt="Live stream"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
                No camera stream available
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-64 rounded-full border border-emerald-500/40" />
            </div>

            <div className="absolute right-3 top-3 rounded-md bg-black/70 px-3 py-2 text-xs text-zinc-100">
              Distance: {detectionData.distance}m <br />
              Angle: {detectionData.angle}° <br />
              Confidence: {detectionData.confidence}%
            </div>

            {detectionData.detected && (
              <div className="absolute inset-0 animate-pulse border-2 border-red-500" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={startRecording}
              disabled={
                isRecording || !cameraAvailable || deviceStatus !== "Connected"
              }
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:opacity-50"
            >
              Start Recording
            </button>
            <button
              onClick={stopRecording}
              disabled={!isRecording}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
            >
              Stop Recording
            </button>
            <button
              onClick={async () => {
                const next = !viewRecords;
                setViewRecords(next);
                if (next) {
                  await loadRecords();
                }
              }}
              className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-semibold hover:bg-zinc-700"
            >
              View Records
            </button>
          </div>
        </section>
      </div>

      {viewRecords && (
        <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="mb-4 text-lg font-semibold text-emerald-400">
            Records
          </h2>

          {isLoadingRecords ? (
            <p className="text-zinc-400">Loading records...</p>
          ) : visibleVideos.length === 0 ? (
            <p className="text-zinc-400">No records available</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleVideos.map((item) => (
                <article
                  key={item._id}
                  className="rounded-lg border border-zinc-800 bg-black/60 p-3"
                >
                  <video
                    controls
                    className="mb-3 h-44 w-full rounded object-cover"
                    src={`${API_BASE}${item.fileUrl}`}
                  />
                  <p className="text-xs text-zinc-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  <a
                    className="mt-2 inline-block rounded bg-emerald-700 px-3 py-1 text-xs font-semibold hover:bg-emerald-600"
                    href={`${API_BASE}${item.fileUrl}`}
                    download
                  >
                    Download
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
