"use client";

import Cookies from "js-cookie";
import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/services/api.mjs"; // Importando nosso cliente de API

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Bell,
  User,
  LogOut,
  FileText,
  Clock,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PatientData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  address: string;
}

interface PatientLayoutProps {
  children: React.ReactNode;
}

// --- ALTERAÇÃO 1: Renomeando o componente para maior clareza ---
export default function PatientLayout({ children }: PatientLayoutProps) {
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
    // --- ALTERAÇÃO 2: Buscando o token no localStorage ---
    const token = localStorage.getItem("token");

    if (userInfoString && token) {
      const userInfo = JSON.parse(userInfoString);

      setPatientData({
        name: userInfo.user_metadata?.full_name || "Paciente",
        email: userInfo.email || "",
        phone: userInfo.phone || "",
        cpf: "",
        birthDate: "",
        address: "",
      });
    } else {
      // --- ALTERAÇÃO 3: Redirecionando para o login central ---
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => setShowLogoutDialog(true);

  // --- ALTERAÇÃO 4: Função de logout completa e padronizada ---
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
    { href: "/patient/dashboard", icon: Home, label: "Dashboard" },
    {
      href: "/patient/appointments",
      icon: Calendar,
      label: "Minhas Consultas",
    },
    { href: "/patient/schedule", icon: Clock, label: "Agendar Consulta" },
    { href: "/patient/reports", icon: FileText, label: "Meus Laudos" },
    { href: "/patient/profile", icon: User, label: "Meus Dados" },
  ];

  if (!patientData) {
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
        className={`bg-card border-r border-border transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"
          } fixed left-0 top-0 h-screen flex flex-col z-10`}
      >
        {/* Header da Sidebar */}
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

        {/* Menu */}
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

        {/* Rodapé com Avatar e Logout */}
        <div className="border-t p-4 mt-auto">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>
                {patientData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {patientData.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {patientData.email}
                </p>
              </div>
            )}
          </div>
          {/* Botão Sair - ajustado para responsividade */}
          <Button
            variant="outline"
            size="sm"
            className={
              sidebarCollapsed
                ? "w-full bg-transparent flex justify-center items-center p-2" // Centraliza o ícone quando colapsado
                : "w-full bg-transparent"
            }
            onClick={handleLogout}
          >
            <LogOut className={sidebarCollapsed ? "h-5 w-5" : "mr-2 h-4 w-4"} />{" "}
            {/* Remove margem quando colapsado */}
            {!sidebarCollapsed && "Sair"}{" "}
            {/* Mostra o texto apenas quando não está colapsado */}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
      >

        {/* Page Content */}
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
