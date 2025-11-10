// CÓDIGO REATORADO PARA: components/manager-layout.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthLayout } from "@/hooks/useAuthLayout"; // 1. Importamos nosso novo hook
import { api } from "@/services/api.mjs";

// Componentes da UI (Button, Avatar, etc.)
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home, Calendar, User, LogOut, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Badge } from "./ui/badge";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  // 2. Usamos o hook para buscar o usuário e controlar o acesso
  const { user, isLoading } = useAuthLayout({ requiredRole: 'gestor' });

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
    { href: "/manager/dashboard", icon: Home, label: "Dashboard" },
    { href: "#", icon: Calendar, label: "Relatórios gerenciais" },
    { href: "/manager/usuario", icon: User, label: "Gestão de Usuários" },
    { href: "/manager/home", icon: User, label: "Gestão de Médicos" },
    { href: "/manager/patientes", icon: User, label: "Gestão de patientes" },
    { href: "#", icon: Calendar, label: "Configurações" },
  ];

  // 3. Enquanto o hook está carregando, mostramos uma tela de loading
  if (isLoading || !user) {
    return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
  }

  // O resto do seu JSX continua igual, mas agora usando a variável 'user' do hook
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 h-screen flex flex-col z-30 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="font-semibold text-gray-900">MediConnect</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${isActive ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Rodapé com Avatar e Logout */}
        <div className="border-t p-4 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            {/* 4. A LÓGICA DO AVATAR AGORA É APLICADA AQUI */}
            <Avatar>
              <AvatarImage src={user.avatarFullUrl} />
              <AvatarFallback>{user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.roles.join(', ')}</p>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className={sidebarCollapsed ? "w-full bg-transparent flex justify-center items-center p-2" : "w-full bg-transparent"} onClick={() => setShowLogoutDialog(true)}>
            <LogOut className={sidebarCollapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />
            {!sidebarCollapsed && "Sair"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 w-full ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-md"></div>
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">1</Badge>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      {/* Dialog de Logout */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogDescription>Deseja realmente sair do sistema?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmLogout}><LogOut className="mr-2 h-4 w-4" />Sair</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}