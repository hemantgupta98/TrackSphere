"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function ReportsAnalyticsPage() {
  const stats = [
    { title: "Total Detections", value: "12,842", change: "+14.2%" },
    { title: "Critical Alerts", value: "158", change: "+4.1%" },
    { title: "System Uptime", value: "99.98%", change: "" },
    { title: "Avg Response Time", value: "1.2s", change: "" },
  ];

  const heatmap = Array.from({ length: 100 });

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm">
            System performance metrics and security intelligence
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-green-600 hover:bg-green-700">Filters</Button>
          <Button className="bg-green-600 hover:bg-green-700">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="bg-zinc-900 border-none">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">{s.title}</p>
              <h2 className="text-2xl font-semibold">{s.value}</h2>
              {s.change && (
                <span className="text-green-500 text-sm">{s.change}</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graph + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 bg-zinc-900 border-none">
          <CardContent className="p-4">
            <h3 className="mb-4">Detection Frequency vs Alerts</h3>
            <div className="h-48 bg-zinc-800 rounded-xl flex items-center justify-center text-gray-500">
              Chart Placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-none">
          <CardContent className="p-4 space-y-4">
            <h3>Object Classification</h3>
            <div className="h-40 rounded-full border-4 border-green-500 flex items-center justify-center">
              98%
            </div>
            <Progress value={98} />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="bg-zinc-900 border-none">
        <CardContent className="p-4">
          <h3 className="mb-4">Sector Density Heatmap</h3>
          <div className="grid grid-cols-10 gap-1">
            {heatmap.map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.3 }}
                // eslint-disable-next-line react-hooks/purity
                animate={{ opacity: Math.random() }}
                className="w-full h-6 bg-green-500/50 rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card className="bg-zinc-900 border-none">
        <CardContent className="p-4">
          <h3 className="mb-4">Recent Audit Logs</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-zinc-700 pb-2"
              >
                <span>Report #{i + 1}</span>
                <Button size="sm" className="bg-green-600">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
