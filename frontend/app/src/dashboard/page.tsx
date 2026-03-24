"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import RadarPage from "@/components/layout/radar";
import { SubmitHandler, useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";

type HardwareConnectionForm = {
  ssid?: string;
  password: string;
  ipAddress: string;
  port: number;
};

type ConnectionStatus = "connecting" | "connected" | "not_connected";

const API_URL =
  process.env.NEXT_PUBLIC_HARDWARE_API_URL ?? "http://localhost:5000";

const statusDisplayText: Record<ConnectionStatus, string> = {
  connecting: "Connecting...",
  connected: "Connected ✅",
  not_connected: "Not Connected ❌",
};

export default function RadarDashboard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HardwareConnectionForm>();

  const [isRadarOn, setIsRadarOn] = useState(false);
  const [isDetect, setIsDetect] = useState(false);
  const [isHardwareModalOpen, setIsHardwareModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("not_connected");
  const [connectionMessage, setConnectionMessage] = useState(
    "Hardware has not been connected yet.",
  );
  const [connectedDevice, setConnectedDevice] = useState<{
    ipAddress: string;
    port: number;
  } | null>(null);

  const [capturedAlerts] = useState<
    Array<{
      level: "critical" | "warning";
      title: string;
      message: string;
    }>
  >([]);

  const [targetIntelligence] = useState<{
    trackingId: string;
    status: string;
    range: string;
    velocity: string;
  } | null>(null);

  const [systemMetrics] = useState<{
    networkLatency: string;
    uptime: string;
  } | null>(null);

  const criticalAlert = capturedAlerts.find(
    (alert) => alert.level === "critical",
  );
  const warningAlert = capturedAlerts.find(
    (alert) => alert.level === "warning",
  );

  const checkHardwareStatus = useCallback(
    async (options?: { shouldNotifyOnOffline?: boolean }) => {
      if (!connectedDevice) {
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/hardware-status?ipAddress=${encodeURIComponent(
            connectedDevice.ipAddress,
          )}&port=${connectedDevice.port}`,
        );

        const result = await response.json();

        if (result.success) {
          setConnectionStatus("connected");
          setConnectionMessage(result.message || "Hardware is connected.");
          return;
        }

        const wasConnected = connectionStatus === "connected";
        setConnectionStatus("not_connected");
        setConnectionMessage(result.message || "Hardware is not reachable.");

        if (options?.shouldNotifyOnOffline && wasConnected) {
          toast.error("Hardware went offline.");
        }
      } catch {
        const wasConnected = connectionStatus === "connected";
        setConnectionStatus("not_connected");
        setConnectionMessage("Unable to fetch hardware status.");

        if (options?.shouldNotifyOnOffline && wasConnected) {
          toast.error("Hardware went offline.");
        }
      }
    },
    [connectedDevice, connectionStatus],
  );

  useEffect(() => {
    if (!connectedDevice || connectionStatus !== "connected") {
      return;
    }

    const interval = window.setInterval(() => {
      void checkHardwareStatus({ shouldNotifyOnOffline: true });
    }, 8000);

    return () => {
      window.clearInterval(interval);
    };
  }, [checkHardwareStatus, connectedDevice, connectionStatus]);

  const onSubmit: SubmitHandler<HardwareConnectionForm> = async (data) => {
    setConnectionStatus("connecting");
    setConnectionMessage("Attempting to connect to hardware...");

    try {
      const response = await fetch(`${API_URL}/connect-hardware`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ssid: data.ssid,
          password: data.password,
          ipAddress: data.ipAddress,
          port: Number(data.port),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setConnectionStatus("not_connected");
        setConnectionMessage(result.message || "Connection failed.");
        toast.error(result.message || "Connection failed.");
        return;
      }

      setConnectedDevice({
        ipAddress: data.ipAddress,
        port: Number(data.port),
      });
      setConnectionStatus("connected");
      setConnectionMessage(
        result.message || "Hardware connected successfully.",
      );
      toast.success("Hardware connected successfully.");
      setIsHardwareModalOpen(false);
      reset({ ...data, password: "" });
    } catch {
      setConnectionStatus("not_connected");
      setConnectionMessage("Server error while connecting hardware.");
      toast.error("Server error while connecting hardware.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Toaster position="top-center" richColors />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-400">Radar Unit-01</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-800 rounded-xl">
            Calibrate
          </button>
          <button className="px-4 py-2 bg-green-500 text-black rounded-xl">
            Export Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 mb-4 gap-5">
        <button
          type="button"
          onClick={() => setIsRadarOn((prev) => !prev)}
          className={`rounded-xl px-4 py-2 font-semibold transition ${
            isRadarOn
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isRadarOn ? "Radar System: ON" : "Radar System: OFF"}
        </button>

        <button
          type="button"
          onClick={() => setIsHardwareModalOpen(true)}
          className="rounded-xl px-4 py-2 font-semibold transition bg-gray-800 hover:bg-gray-700"
        >
          Connect Hardware Radar
        </button>

        <button
          type="button"
          onClick={() => setIsDetect((prev) => !prev)}
          className={`rounded-xl px-4 py-2 font-semibold transition ${
            isDetect
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isDetect ? "Detect Object: ON" : "Detect Object: OFF"}
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-gray-800 bg-gray-900 p-4">
        <p className="text-sm text-gray-400">Hardware Connection Status</p>
        <p className="mt-1 text-base font-semibold text-green-400">
          {statusDisplayText[connectionStatus]}
        </p>
        <p className="mt-1 text-sm text-gray-300">{connectionMessage}</p>
      </div>

      {isHardwareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-md rounded-2xl bg-black text-white shadow-xl border border-gray-800 p-6">
            <button
              type="button"
              onClick={() => setIsHardwareModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Connect Radar Hardware
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WiFi Name (SSID)
                </label>
                <Input
                  type="text"
                  placeholder="Enter WiFi name"
                  className="w-full h-10 rounded-lg bg-gray-900 border border-gray-700 px-3"
                  {...register("ssid", {})}
                />
                {errors.ssid && (
                  <span className="text-red-400 text-sm">
                    {errors.ssid.message}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WiFi Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter WiFi password"
                  className="w-full h-10 rounded-lg bg-gray-900 border border-gray-700 px-3"
                  {...register("password", {
                    required: "Enter your WiFi password.",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters.",
                    },
                  })}
                />
                {errors.password && (
                  <span className="text-red-400 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Device IP Address
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 192.168.1.45"
                  {...register("ipAddress", {
                    required: "Enter hardware IP address.",
                    pattern: {
                      value:
                        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/,
                      message: "Enter a valid IPv4 address.",
                    },
                  })}
                  className="w-full h-10 rounded-lg bg-gray-900 border border-gray-700 px-3"
                />
                {errors.ipAddress && (
                  <span className="text-red-400 text-sm">
                    {errors.ipAddress.message}
                  </span>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Port Number
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 80 / 8080"
                  {...register("port", {
                    required: "Enter hardware port.",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Port must be at least 1.",
                    },
                    max: {
                      value: 65535,
                      message: "Port must be at most 65535.",
                    },
                  })}
                  className="w-full h-10 rounded-lg bg-gray-900 border border-gray-700 px-3"
                />
                {errors.port && (
                  <span className="text-red-400 text-sm">
                    {errors.port.message}
                  </span>
                )}
              </div>

              <div className="mb-5 rounded-lg border border-gray-800 bg-gray-900 p-3">
                <p className="text-sm font-medium text-gray-300">
                  {statusDisplayText[connectionStatus]}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {connectionMessage}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={connectionStatus === "connecting"}
                  className="flex-1 bg-green-600 hover:bg-green-700 transition rounded-lg py-2 font-medium disabled:opacity-60"
                >
                  {connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Connect"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setIsHardwareModalOpen(false);
                  }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 transition rounded-lg py-2 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 items-stretch gap-6">
        <div className="h-full space-y-2">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Live Feed</h2>
            <div className="space-y-2 text-sm">
              <div className="bg-red-900/30 p-3 rounded-lg border border-red-700">
                <p className="text-red-400">CRITICAL ALERT</p>
                <p>
                  {isRadarOn && criticalAlert
                    ? criticalAlert.message
                    : "No data"}
                </p>
              </div>
              <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
                <p className="text-yellow-400">WARNING</p>
                <p>
                  {isRadarOn && warningAlert ? warningAlert.message : "No data"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Global Status</h2>
            {isRadarOn ? (
              <>
                <p className="text-sm">CPU Load: 14%</p>
                <p className="text-sm">Temp: 42°C</p>
                <p className="text-sm">Signal: -42 dBm</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>
        </div>

        <div className="h-full">
          {isRadarOn ? (
            <RadarPage />
          ) : (
            <div className="h-full min-h-96 rounded-2xl border border-gray-800 bg-black" />
          )}
        </div>

        <div className="h-full space-y-4">
          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Target Intelligence</h2>
            {isDetect && targetIntelligence ? (
              <>
                <p className="text-sm">
                  Tracking ID: {targetIntelligence.trackingId}
                </p>
                <p className="text-sm text-red-400">
                  Status: {targetIntelligence.status}
                </p>
                <p className="text-sm">Range: {targetIntelligence.range}</p>
                <p className="text-sm">
                  Velocity: {targetIntelligence.velocity}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-400">No data</p>
            )}
          </div>

          <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
            <h2 className="text-green-400 mb-2">Controls</h2>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-800 p-2 rounded-lg">Alarm</button>
              <button className="bg-red-600 p-2 rounded-lg">Lockdown</button>
              <button className="bg-gray-800 p-2 rounded-lg">Tracking</button>
              <button className="bg-gray-800 p-2 rounded-lg">Alert Team</button>
            </div>
          </div>

          <button className="w-full bg-green-500 text-black py-3 rounded-xl">
            Acknowledge All Alerts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm">Network Latency</p>
          <h3 className="text-xl">
            {systemMetrics ? systemMetrics.networkLatency : "No data"}
          </h3>
        </div>
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
          <p className="text-sm">Uptime</p>
          <h3 className="text-xl">
            {systemMetrics ? systemMetrics.uptime : "No data"}
          </h3>
        </div>
      </div>

      <div className="h-full space-y-4 mt-6">
        <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
          <h2 className="text-green-400 mb-2">Detect Object</h2>
          {isDetect && targetIntelligence ? (
            <>
              <p className="text-sm">
                Tracking ID: {targetIntelligence.trackingId}
              </p>
              <p className="text-sm text-red-400">
                Status: {targetIntelligence.status}
              </p>
              <p className="text-sm">Range: {targetIntelligence.range}</p>
              <p className="text-sm">Velocity: {targetIntelligence.velocity}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No data</p>
          )}
        </div>
      </div>
    </div>
  );
}
