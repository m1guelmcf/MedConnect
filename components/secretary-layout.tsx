// Caminho: app/(secretary)/layout.tsx (ou o caminho do seu arquivo)
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { api } from "@/services/api.mjs"; // Importando nosso cliente de API central

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
  Clock,
  User,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SecretaryData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  employeeId: string;
  department: string;
  permissions: object;
}

interface SecretaryLayoutProps {
  children: React.ReactNode;
}

export default function SecretaryLayout({ children }: SecretaryLayoutProps) {
  const [secretaryData, setSecretaryData] = useState<SecretaryData | null>(
    null
  );
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

      setSecretaryData({
        id: userInfo.id || "",
        name: userInfo.user_metadata?.full_name || "Secretária",
        email: userInfo.email || "",
        department: userInfo.user_metadata?.department || "Atendimento",
        phone: userInfo.phone || "",
        cpf: "",
        employeeId: "",
        permissions: {},
      });
    } else {
      // --- ALTERAÇÃO 2: Redirecionando para o login central ---
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

  // --- ALTERAÇÃO 3: Função de logout completa e padronizada ---
  const confirmLogout = async () => {
    try {
      // Chama a função centralizada para fazer o logout no servidor
      await api.logout();
    } catch (error) {
      console.error("Erro ao tentar fazer logout no servidor:", error);
    } finally {
      // Limpeza completa e consistente do estado local
      localStorage.removeItem("user_info");
      localStorage.removeItem("token");
      Cookies.remove("access_token"); // Limpeza de segurança

      setShowLogoutDialog(false);
      router.push("/"); // Redireciona para a página inicial
    }
  };

  const cancelLogout = () => setShowLogoutDialog(false);

  const menuItems = [
    { href: "/secretary/dashboard", icon: Home, label: "Dashboard" },
    { href: "/secretary/appointments", icon: Calendar, label: "Consultas" },
    { href: "/secretary/schedule", icon: Clock, label: "Agendar Consulta" },
    { href: "/secretary/pacientes", icon: User, label: "Pacientes" },
  ];

  if (!secretaryData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border transition-all duration-300 
          ${sidebarCollapsed ? "w-16" : "w-64"} 
          fixed left-0 top-0 h-screen flex flex-col z-10`}
      >
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
                </div>
                <span className="font-semibold text-foreground">
                  MediConnect
                </span>
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
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                {secretaryData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {secretaryData.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {secretaryData.email}
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

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
      >

        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Logout confirmation dialog */}
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
