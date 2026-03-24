"use client";

import { X } from "lucide-react";
import { forwardRef, useState } from "react";
import RadarPage from "@/components/layout/radar";
import { SubmitHandler, useForm } from "react-hook-form";
import { Toaster, toast } from "sonner";

type Hardware = {
  device: string;
  wifiName: string;
  wifiPassword: string;
  ipAddress: number;
  port: number;
  protocol: string;
  ApiEndpoint: string;
};

export default function RadarDashboard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Hardware>();
  const [isRadarOn, setIsRadarOn] = useState(false);
  const [isHardware, setIsHardware] = useState(false);
  const [isDetect, setIsDetect] = useState(false);
  const [open, setOpen] = useState(false);

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

  const onSubmit: SubmitHandler<Hardware> = async (data) => {
    console.log("FORM DATA 👉", data);
    toast.success("form submitted");
    reset();
  };

  const handleHardwareToggle = () => {
    setIsHardware((prev) => {
      const next = !prev;
      setOpen(next);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
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
          onClick={handleHardwareToggle}
          className={`rounded-xl px-4 py-2 font-semibold transition ${
            isHardware
              ? "bg-green-500 text-black hover:bg-green-400"
              : "bg-red-600 text-white hover:bg-red-500"
          }`}
        >
          {isHardware
            ? "Connect Hardware Radar: ON"
            : "Connect Hardware Radar: OFF"}
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

      {isHardware && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-full max-w-md rounded-2xl bg-black text-white shadow-xl border border-gray-800 p-6">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold mb-6">
              Connect Radar Hardware
            </h2>

            {/* Device Name */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Device Name (optional)
                </label>
                <Input
                  type="text"
                  placeholder="My Radar Device"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700"
                  {...register("device")}
                />
              </div>

              {/* WiFi SSID */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WiFi Name (SSID)
                </label>
                <Input
                  type="text"
                  placeholder="Enter WiFi name"
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700"
                  {...register("wifiName", {
                    required: "Enter your wifi name",
                  })}
                />
                {errors.wifiName && (
                  <span className="text-red-400 text-sm">
                    {errors.wifiName.message}
                  </span>
                )}
              </div>

              {/* WiFi Password */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  WiFi Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter WiFi password"
                  className="w-full px-4 py-2 rounded-lg
                 bg-gray-900 border border-gray-700"
                  {...register("wifiPassword", {
                    required: "Enter your wifi password",
                  })}
                />
                {errors.wifiPassword && (
                  <span className="text-red-400 text-sm">
                    {errors.wifiPassword.message}
                  </span>
                )}
              </div>

              {/* IP Address */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  IP Address
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 192.168.1.45"
                  {...register("ipAddress", {
                    required: "Enter your IP Address",
                  })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700"
                />
                {errors.ipAddress && (
                  <span className="text-red-400 text-sm">
                    {errors.ipAddress.message}
                  </span>
                )}
              </div>

              {/* Port */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Port (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 80 / 8080"
                  {...register("port", { required: "Enter your port" })}
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700"
                />
                {errors.port && (
                  <span className="text-red-400 text-sm">
                    {errors.port.message}
                  </span>
                )}
              </div>

              {/* Protocol */}
              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-400">
                  Protocol
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700"
                  {...register("protocol", { required: "Select protocol" })}
                >
                  <option value="">Select protocol</option>
                  <option value="HTTP">HTTP</option>
                  <option value="WebSocket">WebSocket</option>
                  <option value="MQTT">MQTT</option>
                </select>
                {errors.protocol && (
                  <span className="text-red-400 text-sm">
                    {errors.protocol.message}
                  </span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 transition rounded-lg py-2 font-medium"
                >
                  Connect
                </button>

                <button
                  onClick={() => reset()}
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
        {/* Left Panel */}
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

        {/* Radar */}
        <div className="h-full">
          {isRadarOn ? (
            <RadarPage />
          ) : (
            <div className="h-full min-h-96 rounded-2xl border border-gray-800 bg-black" />
          )}
        </div>

        {/* Right Panel */}
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

      {/* Bottom Cards */}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Input = forwardRef<HTMLInputElement, any>(({ icon, ...props }, ref) => (
  <div className="flex items-center gap-3 border rounded-lg px-4 py-3">
    <span className="text-gray-400">{icon}</span>
    <input ref={ref} {...props} className="w-full outline-none text-sm" />
  </div>
));

Input.displayName = "Input";
