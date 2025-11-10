"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, CalendarClock, ClipboardPlus, Home, LogOut, SquareUser } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface UserData {
  user_metadata: {
    full_name: string;
  };
  app_metadata: {
    user_role: string;
  };
  email: string;
}

interface Props {
  userData: UserData;
  sidebarCollapsed: boolean;
  handleLogout: () => void;
  isActive: boolean;
}

export default function SidebarUserSection({
  userData,
  sidebarCollapsed,
  handleLogout,
  isActive,
}: Props) {
    const pathname = usePathname();
    const menuItems: any[] = [
        { href: "/patient/schedule", icon: CalendarClock, label: "Agendar Consulta" },
        { href: "/patient/appointments", icon: CalendarCheck2, label: "Minhas Consultas" },
        { href: "/patient/reports", icon: ClipboardPlus, label: "Meus Laudos" },
        { href: "/patient/profile", icon: SquareUser, label: "Meus Dados" },          
    ]
  return (
    <div className="border-t p-4 mt-auto">
      {/* POPUP DE INFORMAÇÕES DO USUÁRIO */}
      <Popover>
        <PopoverTrigger asChild>
            <div
                className={`flex items-center space-x-3 mb-4 p-2 rounded-md transition-colors ${
                isActive
                    ? "cursor-pointer hover:bg-gray-100"
                    : "cursor-default pointer-events-none"
                }`}>
                <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                    {userData.user_metadata.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
                </Avatar>

                {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                    {userData.user_metadata.full_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                    {userData.app_metadata.user_role}
                    </p>
                </div>
                )}
            </div>
        </PopoverTrigger>

        {/* Card flutuante */}
        <PopoverContent
          align="center"
          side="top"
          className="w-64 p-4 shadow-lg border bg-white"
        >
          <nav>
            {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
          </nav>
        </PopoverContent>
      </Popover>

      {/* Botão de sair */}
      <Button
        variant="outline"
        size="sm"
        className={
          sidebarCollapsed
            ? "w-full bg-transparent flex justify-center items-center p-2"
            : "w-full bg-transparent"
        }
        onClick={handleLogout}
      >
        <LogOut className={sidebarCollapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
        {sidebarCollapsed && "Sair"}
      </Button>
    </div>
  );
}
