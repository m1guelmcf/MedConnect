"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie"; // Manteremos para o logout, se necessário
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
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DoctorData {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  crm: string;
  specialty: string;
  department: string;
  permissions: object;
  role: string
}

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: PatientLayoutProps) {
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const isMobile = windowWidth < 1024;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userInfoString = localStorage.getItem("user_info");
    // --- ALTERAÇÃO PRINCIPAL AQUI ---
    // Procurando o token no localStorage, onde ele foi realmente salvo.
    const token = localStorage.getItem("token");

    if (userInfoString && token) {
      const userInfo = JSON.parse(userInfoString);

      setDoctorData({
        id: userInfo.id || "",
        name: userInfo.user_metadata?.full_name || "Doutor(a)",
        email: userInfo.email || "",
        specialty: userInfo.user_metadata?.specialty || "Especialidade",
        phone: userInfo.phone || "",
        cpf: "",
        crm: "",
        department: "",
        permissions: {},
        role: userInfo.role
      });
    } else {
      // Se não encontrar, aí sim redireciona.
      router.push("/login");
    }
  }, [router]);

  // O restante do seu código permanece exatamente o mesmo...
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

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

  const cancelLogout = () => {
    setShowLogoutDialog(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    {
      href: "/doctor/dashboard",
      icon: Home,
      label: "Dashboard",
      // Botão para o dashboard do médico
    },
    {
      href: "/doctor/consultas",
      icon: Calendar,
      label: "Consultas",
      // Botão para página de consultas marcadas do médico atual
    },
    
    {
      href: "/doctor/medicos",
      icon: User,
      label: "Pacientes",
      // Botão para a página de visualização de todos os pacientes
    },
    {
      href: "/doctor/disponibilidade",
      icon: Calendar,
      label: "Disponibilidade",
      // Botão para o dashboard do médico
    },
  ];

  if (!doctorData) {
    return <div>Carregando...</div>;
  }

  return (
    // O restante do seu código JSX permanece exatamente o mesmo
    <div className="min-h-screen bg-background flex">
      <div
        className={`bg-card border-r border transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } fixed left-0 top-0 h-screen flex flex-col z-50`}
      >
        <div className="p-4 border-b border">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                </div>
                <span className="font-semibold text-gray-900">MediConnect</span>
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
        // ... (seu código anterior)
        {/* Sidebar para desktop */}
        <div
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          } fixed left-0 top-0 h-screen flex flex-col z-50`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  </div>
                  <span className="font-semibold text-gray-900">
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
              {!sidebarCollapsed && (
                <>
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>
                      {doctorData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                       
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doctorData.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {doctorData.specialty}
                    </p>
                  </div>
                </>
              )}
              {sidebarCollapsed && (
                <Avatar className="mx-auto">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>
                    {doctorData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors text-muted-foreground hover:bg-accent cursor-pointer ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Sair</span>}
            </div>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
      <div
        className={`bg-white border-r border-gray-200 fixed left-0 top-0 h-screen flex flex-col z-50 transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <span className="font-semibold text-gray-900">Hospital System</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMobileMenu}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link key={item.href} href={item.href} onClick={toggleMobileMenu}>
                <div
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground border-r-2 border-primary"
                      : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
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
                {doctorData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {doctorData.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {doctorData.specialty}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
            onClick={() => {
              handleLogout();
              toggleMobileMenu();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <header className="bg-card border-b border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1"></div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  1
                </Badge>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
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
