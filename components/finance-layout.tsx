// CÓDIGO COMPLETO PARA: components/finance-layout.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthLayout } from "@/hooks/useAuthLayout";
import { api } from "@/services/api.mjs";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home, Calendar, User, LogOut, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Badge } from "./ui/badge";

export default function FinancierLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthLayout({ requiredRole: 'finance' });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const confirmLogout = async () => {
    await api.logout();
    setShowLogoutDialog(false);
    router.push("/");
  };

  const menuItems = [
    { href: "#", icon: Home, label: "Dashboard" },
    { href: "#", icon: Calendar, label: "Relatórios financeiros" },
    { href: "#", icon: User, label: "Finanças Gerais" },
    { href: "#", icon: Calendar, label: "Configurações" },
  ];

  if (isLoading || !user) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className={`bg-card border-r border-border transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} fixed left-0 top-0 h-screen flex flex-col z-10`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><div className="w-4 h-4 bg-primary-foreground rounded-sm"></div></div>
                <span className="font-semibold text-foreground">MediConnect</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src={user.avatarFullUrl} />
              <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.roles.join(', ')}</p>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className={sidebarCollapsed ? "w-full bg-transparent flex justify-center items-center p-2" : "w-full bg-transparent"} onClick={() => setShowLogoutDialog(true)}>
            <LogOut className={sidebarCollapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
            {!sidebarCollapsed && "Sair"}
          </Button>
        </div>
      </div>
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md"></div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">1</Badge>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Confirmar Saída</DialogTitle><DialogDescription>Deseja realmente sair do sistema?</DialogDescription></DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}