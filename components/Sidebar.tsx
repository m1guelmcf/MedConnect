"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { api } from "@/services/api.mjs";
import { useAccessibility } from "@/app/context/AccessibilityContext";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  CalendarCheck2,
  ClipboardPlus,
  CalendarClock,
  Users,
  SquareUser,
  ClipboardList,
  Stethoscope,
} from "lucide-react";

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
  const { theme, contrast } = useAccessibility();

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
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
      setRole(userInfo.user_metadata?.role);
    } else {
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

  const confirmLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
    } finally {
      localStorage.removeItem("user_info");
      localStorage.removeItem("token");
      Cookies.remove("access_token");

      setShowLogoutDialog(false);
      router.push("/");
    }
  };

  const cancelLogout = () => setShowLogoutDialog(false);

  const SetMenuItems = (role: any) => {
    const patientItems: MenuItem[] = [
      { href: "/patient/dashboard", icon: Home, label: "Dashboard" },
      {
        href: "/patient/schedule",
        icon: CalendarClock,
        label: "Agendar Consulta",
      },
      {
        href: "/patient/appointments",
        icon: CalendarCheck2,
        label: "Minhas Consultas",
      },
      { href: "/patient/reports", icon: ClipboardPlus, label: "Meus Laudos" },
      { href: "/patient/profile", icon: SquareUser, label: "Meus Dados" },
    ];

    const doctorItems: MenuItem[] = [
      { href: "/doctor/dashboard", icon: Home, label: "Dashboard" },
      { href: "/doctor/medicos", icon: Users, label: "Gestão de Pacientes" },
      { href: "/doctor/consultas", icon: CalendarCheck2, label: "Consultas" },
      {
        href: "/doctor/disponibilidade",
        icon: ClipboardList,
        label: "Disponibilidade",
      },
    ];

    const secretaryItems: MenuItem[] = [
      { href: "/secretary/dashboard", icon: Home, label: "Dashboard" },
      {
        href: "/secretary/appointments",
        icon: CalendarCheck2,
        label: "Consultas",
      },
      {
        href: "/secretary/schedule",
        icon: CalendarClock,
        label: "Agendar Consulta",
      },
      {
        href: "/secretary/pacientes",
        icon: Users,
        label: "Gestão de Pacientes",
      },
    ];

    const managerItems: MenuItem[] = [
      { href: "/manager/dashboard", icon: Home, label: "Dashboard" },
      { href: "/manager/usuario", icon: Users, label: "Gestão de Usuários" },
      { href: "/manager/home", icon: Stethoscope, label: "Gestão de Médicos" },
      { href: "/manager/pacientes", icon: Users, label: "Gestão de Pacientes" },
      { href: "/secretary/appointments", icon: CalendarCheck2, label: "Consultas" },
      { href: "/manager/disponibilidade", icon: ClipboardList, label: "Disponibilidade" },
    ];

    switch (role) {
      case "gestor":
      case "admin":
        return managerItems;
      case "medico":
        return doctorItems;
      case "secretaria":
        return secretaryItems;
      case "paciente":
      default:
        return patientItems;
    }
  };

  const menuItems = SetMenuItems(role);
  const isDefaultMode = theme === "light" && contrast === "normal";

  if (!userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div
        className={`fixed top-0 h-screen flex flex-col z-30 transition-all duration-300
                ${sidebarCollapsed ? "w-16" : "w-64"}
                ${isDefaultMode ? "bg-[#123965] text-white" : "bg-sidebar text-sidebar-foreground"}`}
      >
        {/* TOPO */}
        <div className={`p-4 border-b ${isDefaultMode ? "border-white/10" : "border-sidebar-border"} flex items-center justify-between`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-background p-1 rounded-lg">
                <img
                  src="/Logo MedConnect.png"
                  alt="Logo MedConnect"
                  className="w-12 h-12 object-contain"
                />
              </div>

              <span className="font-semibold text-lg">
                MedConnect
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1 ${isDefaultMode ? "text-white hover:bg-white/10" : "hover:bg-sidebar-accent"} cursor-pointer`}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${
                          isActive
                            ? `${isDefaultMode ? "bg-white/20 text-white font-semibold" : "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"}`
                            : `${isDefaultMode ? "text-white/80 hover:bg-white/10 hover:text-white" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`
                        }
                    `}
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

        {/* PERFIL ORIGINAL + NOME BRANCO - CORREÇÃO DE ALINHAMENTO AQUI */}
        <div 
          className={`
            mt-auto p-3 border-t 
            ${isDefaultMode ? "border-white/10" : "border-sidebar-border"}
            flex flex-col
            ${sidebarCollapsed ? "items-center justify-center" : "items-stretch"}
          `}
        >
          <SidebarUserSection
            userData={userData}
            sidebarCollapsed={sidebarCollapsed}
            handleLogout={handleLogout}
            isActive={role !== "paciente"}
          />
        </div>
      </div>
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Saída</DialogTitle>
              <DialogDescription>
                Deseja realmente sair do sistema? Você precisará fazer login
                novamente.
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
    </div>
  );
}