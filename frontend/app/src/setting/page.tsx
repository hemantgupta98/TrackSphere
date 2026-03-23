/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { forwardRef, useState } from "react";

export default function SettingsPage() {
  const [confidence, setConfidence] = useState(85);
  const [minSize, setMinSize] = useState(0.45);

  const sensors = [
    {
      name: "North Perimeter Radar",
      type: "Radar",
      ip: "192.168.1.101",
      status: "online",
    },
    {
      name: "Gate 4 - AI Optical",
      type: "Camera",
      ip: "192.168.1.105",
      status: "online",
    },
    {
      name: "South Bunker Radar",
      type: "Radar",
      ip: "192.168.1.102",
      status: "offline",
    },
    {
      name: "Hangar B - Thermal",
      type: "Camera",
      ip: "192.168.1.106",
      status: "online",
    },
    {
      name: "Auxiliary Entrance",
      type: "Camera",
      ip: "192.168.1.110",
      status: "online",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>

      {/* Sensor Management */}
      <div className="bg-zinc-900 rounded-2xl p-5 mb-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sensor Management</h2>
          <button className="bg-green-500 px-4 py-2 rounded-lg text-black font-medium">
            + Add Sensor
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-zinc-700">
            <tr>
              <th className="text-left py-2">Device Name</th>
              <th>Type</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((s, i) => (
              <tr key={i} className="border-b border-zinc-800">
                <td className="py-3">{s.name}</td>
                <td className="text-center">{s.type}</td>
                <td className="text-center">{s.ip}</td>
                <td className="text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${s.status === "online" ? "bg-green-600" : "bg-red-600"}`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="text-center">
                  <button className="text-red-500">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Thresholds */}
      <div className="bg-zinc-900 rounded-2xl p-5 mb-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          AI Intelligence Thresholds
        </h2>

        <div className="mb-6">
          <label className="block mb-2">
            Detection Confidence ({confidence}%)
          </label>
          <Input
            type="range"
            min="0"
            max="100"
            value={confidence}
            onChange={(e: { target: { value: any } }) =>
              setConfidence(Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-2">
            Minimum Object Size ({minSize} m²)
          </label>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={minSize}
            onChange={(e: { target: { value: any } }) =>
              setMinSize(Number(e.target.value))
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Notifications + Preferences */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex justify-between">
              Desktop Push
              <input type="checkbox" defaultChecked />
            </label>
            <label className="flex justify-between">
              Webhook
              <input type="checkbox" defaultChecked />
            </label>
            <label className="flex justify-between">
              Mobile Relay
              <input type="checkbox" />
            </label>
            <label className="flex justify-between">
              Sound Alert
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">UI Preferences</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2">Unit System</p>
              <div className="flex gap-3">
                <button className="bg-green-500 text-black px-4 py-1 rounded">
                  Metric
                </button>
                <button className="bg-zinc-700 px-4 py-1 rounded">
                  Imperial
                </button>
              </div>
            </div>

            <label className="flex justify-between">
              High Contrast
              <input type="checkbox" />
            </label>

            <label className="flex justify-between">
              Log Retention
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-xs text-gray-500 flex justify-between">
        <span>© 2024 RadarGuard AI Systems</span>
        <span>Encrypted Connection</span>
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
