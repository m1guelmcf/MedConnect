// Caminho: [seu-caminho]/ManagerLayout.tsx
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie"; // Mantido apenas para a limpeza de segurança no logout
import { api } from "@/services/api.mjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Bell,
  Calendar,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";

interface ManagerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  department: string;
  permissions: object;
}

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const [managerData, setManagerData] = useState<ManagerData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
    // --- ALTERAÇÃO 1: Buscando o token no localStorage ---
    const token = localStorage.getItem("token");

    if (userInfoString && token) {
      const userInfo = JSON.parse(userInfoString);

      setManagerData({
        id: userInfo.id || "",
        name: userInfo.user_metadata?.full_name || "Gestor(a)",
        email: userInfo.email || "",
        department: userInfo.user_metadata?.role || "Gestão",
        phone: userInfo.phone || "",
        cpf: "",
        permissions: {},
      });
    } else {
      // O redirecionamento para /login já estava correto. Ótimo!
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => setShowLogoutDialog(true);

  // --- ALTERAÇÃO 2: A função de logout agora é MUITO mais simples ---
  const confirmLogout = async () => {
    try {
      // Chama a função centralizada para fazer o logout no servidor
      await api.logout();
    } catch (error) {
      // O erro já é logado dentro da função api.logout, não precisamos fazer nada aqui
    } finally {
      // A responsabilidade do componente é apenas limpar o estado local e redirecionar
      localStorage.removeItem("user_info");
      localStorage.removeItem("token");
      Cookies.remove("access_token"); // Limpeza de segurança

      setShowLogoutDialog(false);
      router.push("/"); // Redireciona para a home
    }
  };

  const cancelLogout = () => setShowLogoutDialog(false);

  const menuItems = [
    { href: "/manager/dashboard", icon: Home, label: "Dashboard" },
    { href: "#", icon: Calendar, label: "Relatórios gerenciais" },
    { href: "/manager/usuario", icon: User, label: "Gestão de Usuários" },
    { href: "/manager/home", icon: User, label: "Gestão de Médicos" },
    { href: "/manager/pacientes", icon: User, label: "Gestão de Pacientes" },
    { href: "#", icon: Calendar, label: "Configurações" },
  ];

  if (!managerData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 fixed top-0 h-screen flex flex-col z-30 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              {/* 🛑 SUBSTITUIÇÃO: Usando a tag <img> com o caminho da logo */}
              <img
                src="/Logo MedConnect.png" // Use o arquivo da logo (ou /android-chrome-512x512.png)
                alt="Logo MediConnect"
                className="w-12 h-12 object-contain" // Define o tamanho para w-8 h-8 (32px)
              />
              <span className="font-semibold text-gray-900">MedConnect</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
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

        <div className="border-t p-4 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>
                {managerData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {managerData.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {managerData.department}
                </p>
              </div>
            )}
          </div>
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
            {!sidebarCollapsed && "Sair"}
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Saída</DialogTitle>
            <DialogDescription>
              Deseja realmente sair do sistema? Você precisará fazer login
              novamente para acessar sua conta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={cancelLogout}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
