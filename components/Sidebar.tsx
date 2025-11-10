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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Bell, Calendar, User, LogOut, ChevronLeft, ChevronRight, Home, CalendarCheck2, ClipboardPlus, SquareUserRound, CalendarClock, Users, SquareUser, ClipboardList, Stethoscope, ClipboardMinus } from "lucide-react";
import SidebarUserSection from "@/components/ui/userToolTip";

interface UserData {
  id: string;
  email: string;
  app_metadata: {
    user_role: string;
  };
  user_metadata: {
    cpf: string;
    email_verified: boolean;
    full_name: string;
    phone_mobile: string;
    role: string;
  };
  identities: {
    identity_id: string;
    id: string;
    user_id: string;
    provider: string;
  }[];
  is_anonymous: boolean;
}


interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

type Role = "manager" | "doctor" | "secretary" | "patient" | "admin";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [userData, setUserData] = useState<UserData>();
  const [role, setRole] = useState<string>();
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

      setUserData({
        id: userInfo.id ?? "",
        email: userInfo.email ?? "",
        app_metadata: {
            user_role: userInfo.app_metadata?.user_role ?? "patient",
        },
        user_metadata: {
            cpf: userInfo.user_metadata?.cpf ?? "",
            email_verified: userInfo.user_metadata?.email_verified ?? false,
            full_name: userInfo.user_metadata?.full_name ?? "",
            phone_mobile: userInfo.user_metadata?.phone_mobile ?? "",
            role: userInfo.user_metadata?.role ?? "",
        },
        identities:
            userInfo.identities?.map((identity: any) => ({
            identity_id: identity.identity_id ?? "",
            id: identity.id ?? "",
            user_id: identity.user_id ?? "",
            provider: identity.provider ?? "",
            })) ?? [],
        is_anonymous: userInfo.is_anonymous ?? false,
    });
    setRole(userInfo.user_metadata?.role)
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

  const SetMenuItems = (role: any) => {
    const patientItems: MenuItem[] = [
        { href: "/patient/dashboard", icon: Home, label: "Dashboard" },  
        { href: "/patient/schedule", icon: CalendarClock, label: "Agendar Consulta" },
        { href: "/patient/appointments", icon: CalendarCheck2, label: "Minhas Consultas" },
        { href: "/patient/reports", icon: ClipboardPlus, label: "Meus Laudos" },
        { href: "/patient/profile", icon: SquareUser, label: "Meus Dados" },    
    ]

    const doctorItems: MenuItem[] = [
        { href: "/doctor/dashboard", icon: Home, label: "Dashboard" },  
        { href: "/doctor/medicos", icon: Users, label: "Gestão de Pacientes" },
        { href: "/doctor/consultas", icon: CalendarCheck2, label: "Consultas" },
        { href: "/doctor/disponibilidade", icon: ClipboardList, label: "Disponibilidade" },
    ]

    const secretaryItems: MenuItem[] = [
        { href: "/secretary/dashboard", icon: Home, label: "Dashboard" },  
        { href: "/secretary/appointments", icon: CalendarCheck2, label: "Consultas" },
        { href: "/secretary/schedule", icon: CalendarClock, label: "Agendar Consulta" },
        { href: "/secretary/pacientes", icon: Users, label: "Gestão de Pacientes" },
    ]

    const managerItems: MenuItem[] = [
        { href: "/manager/dashboard", icon: Home, label: "Dashboard" },  
        { href: "#", icon: ClipboardMinus, label: "Relatórios gerenciais" },
        { href: "/manager/usuario", icon: Users, label: "Gestão de Usuários" },
        { href: "/manager/home", icon: Stethoscope, label: "Gestão de Médicos" },
        { href: "/manager/pacientes", icon: Users, label: "Gestão de Pacientes" },
        { href: "/doctor/consultas", icon: CalendarCheck2, label: "Consultas" }, //adicionar botão de voltar pra pagina anterior
    ]

    let menuItems: MenuItem[];
    switch (role) {
        case "manager":
            menuItems = managerItems;
            break;
        case "admin":
            menuItems = managerItems;
            break;    
        case "doctor":
            menuItems = doctorItems;
            break;
        case "secretary":
            menuItems = secretaryItems;
            break;
        case "patient":
            menuItems = patientItems;
            break;    
        default:
            menuItems = patientItems;        
            break;
    }
    return menuItems;
  }

  const menuItems = SetMenuItems(role)

  if (!userData) {
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
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
        <SidebarUserSection
            userData={userData} 
            sidebarCollapsed={false} 
            handleLogout={handleLogout}
            isActive={role === "patient"? false: true}>
        </SidebarUserSection>
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 w-full ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <header className="bg-gray-50 px-4 md:px-6 py-4 flex items-center justify-between"></header>
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
