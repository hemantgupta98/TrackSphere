"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  KanbanSquare,
  WorkflowIcon,
  Users,
  Settings,
  LogOut,
  Workflow,
  User2Icon,
} from "lucide-react";
const links = [
  { name: "Dashboard", href: "/src/dashboard", icon: LayoutDashboard },
  { name: "Live Stream", href: "/src/liveStream", icon: KanbanSquare },
  { name: "Reports", href: "/src/reports", icon: Workflow },
  { name: "Object History", href: "/src/ObjectHistory", icon: Users },
  { name: "System Logs", href: "/src/SystemLogs", icon: WorkflowIcon },
  { name: "Setting", href: "/src/setting", icon: Settings },
  { name: "Log Out", href: "/src/logout", icon: LogOut },
];

type SidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export default function Sidebar({ className, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "w-64 max-w-full shrink-0 overflow-y-auto bg-sky-900 border-r flex flex-col cursor-pointer text-gray-100",
        className,
      )}
    >
      <div className="p-6 text-2xl font-bold text-white">Tracksphere</div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-600"
          >
            <item.icon size={18} />
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
