"use client";

import React from "react";

export default function SystemLogsPage() {
  const logs = [
    {
      time: "2024-05-20 14:32:01.442",
      level: "INFO",
      source: "RADAR_CORE",
      message: "Radar scan cycle completed successfully. 12 objects tracked.",
    },
    {
      time: "2024-05-20 14:32:05.110",
      level: "WARN",
      source: "AI_INFERENCE",
      message: "High latency detected in object classification module.",
    },
    {
      time: "2024-05-20 14:32:08.005",
      level: "ERROR",
      source: "SENSOR_LINK",
      message: "Connection lost to Peripheral Node-04 (IP: 192.168.1.14).",
    },
  ];

  const levelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-green-500/20 text-green-400";
      case "WARN":
        return "bg-yellow-500/20 text-yellow-400";
      case "ERROR":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">System Logs</h1>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 rounded-lg text-sm">
            Pause Stream
          </button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-red-600 rounded-lg text-sm">
            Clear Logs
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Connectivity" value="Active / 18ms" />
        <StatCard title="Stream Rate" value="1.4 MB/s" />
        <StatCard title="AI Load" value="42% Peak" />
        <StatCard title="Log Storage" value="82% Capacity" />
      </div>

      {/* Filter */}
      <div className="mb-4">
        <input
          placeholder="Filter by message, source, or ID..."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="text-left p-3">Timestamp</th>
              <th className="text-left p-3">Level</th>
              <th className="text-left p-3">Source</th>
              <th className="text-left p-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td className="p-3 text-gray-400">{log.time}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${levelColor(log.level)}`}
                  >
                    {log.level}
                  </span>
                </td>
                <td className="p-3 text-gray-300">{log.source}</td>
                <td className="p-3">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw Packet Section */}
      <div className="mt-6 bg-gray-950 border border-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Raw Packet Inspector</h2>
        <pre className="bg-black p-4 rounded-lg text-sm overflow-auto">
          {`{
  "event": "CONNECTION_DROPPED",
  "target": "NODE_04",
  "latency": "infinite",
  "packet_loss": 1.0
}`}
        </pre>

        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
            Copy JSON
          </button>
          <button className="px-4 py-2 bg-green-600 rounded-lg text-sm">
            Run Diagnostic
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-gray-500 text-sm flex justify-between">
        <span>© 2024 RadarGuard AI Systems</span>
        <span>Encrypted Connection</span>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-lg font-semibold mt-1">{value}</p>
    </div>
  );
}
