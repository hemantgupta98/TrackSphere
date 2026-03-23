"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function RadarConnectModal() {
  const [open, setOpen] = useState(true);
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");

  const handleConnect = () => {
    console.log("Connecting to:", ip, port);
    // Add your API / WebSocket logic here
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      {/* Modal Box */}
      <div className="relative w-full max-w-md rounded-2xl bg-black text-white shadow-xl border border-gray-800 p-6">
        {/* Close Icon */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-6">Connect Radar Hardware</h2>

        {/* IP Address Input */}
        <div className="mb-4">
          <label className="block text-sm mb-2 text-gray-400">IP Address</label>
          <input
            type="text"
            placeholder="e.g. 192.168.1.45"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Port Input */}
        <div className="mb-6">
          <label className="block text-sm mb-2 text-gray-400">
            Port (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 8080"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConnect}
            className="flex-1 bg-green-600 hover:bg-green-700 transition rounded-lg py-2 font-medium"
          >
            Connect
          </button>

          <button
            onClick={() => setOpen(false)}
            className="flex-1 bg-gray-800 hover:bg-gray-700 transition rounded-lg py-2 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
