"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // <--- 1. Importação Adicionada
import { Plus, Eye, Filter, Loader2, Search } from "lucide-react"; // <--- 1. Ícone Search Adicionado
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { api, login } from "services/api.mjs";
import { usersService } from "services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";

interface FlatUser {
  id: string;
  user_id: string;
  full_name?: string;
  email: string;
  phone?: string | null;
  role: string;
}

interface UserInfoResponse {
  user: any;
  profile: any;
  roles: string[];
  permissions: Record<string, boolean>;
}

export default function UsersPage() {
    const [users, setUsers] = useState<FlatUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [userDetails, setUserDetails] = useState<UserInfoResponse | null>(null);
    
    // --- Estados de Filtro ---
    const [searchTerm, setSearchTerm] = useState(""); // <--- 2. Estado da busca
    const [selectedRole, setSelectedRole] = useState<string>("all");

  // --- Lógica de Paginação INÍCIO ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  // --- Lógica de Paginação FIM ---

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rolesData: any[] = await usersService.list_roles();
      const rolesArray = Array.isArray(rolesData) ? rolesData : [];

      const profilesData: any[] = await api.get(
        `/rest/v1/profiles?select=id,full_name,email,phone`
      );

      const profilesById = new Map<string, any>();
      if (Array.isArray(profilesData)) {
        for (const p of profilesData) {
          if (p?.id) profilesById.set(p.id, p);
        }
      }

      const mapped: FlatUser[] = rolesArray.map((roleItem) => {
        const uid = roleItem.user_id;
        const profile = profilesById.get(uid);
        return {
          id: uid,
          user_id: uid,
          full_name: profile?.full_name ?? "—",
          email: profile?.email ?? "—",
          phone: profile?.phone ?? "—",
          role: roleItem.role ?? "—",
        };
      });

      setUsers(mapped);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);
      setError("Não foi possível carregar os usuários. Veja console.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await login();
      } catch (e) {
        console.warn("login falhou no init:", e);
      }
      await fetchUsers();
    };
    init();
  }, [fetchUsers]);

  const openDetailsDialog = async (flatUser: FlatUser) => {
    setDetailsDialogOpen(true);
    setUserDetails(null);

    try {
      const data = await usersService.full_data(flatUser.user_id);
      setUserDetails(data);
    } catch (err: any) {
      console.error("Erro ao carregar detalhes:", err);
      setUserDetails({
        user: { id: flatUser.user_id, email: flatUser.email },
        profile: { full_name: flatUser.full_name, phone: flatUser.phone },
        roles: [flatUser.role],
        permissions: {},
      });
    }
  };

    // --- 3. Lógica de Filtragem Atualizada ---
    const filteredUsers = users.filter((u) => {
        // Filtro por Papel (Role)
        const roleMatch = selectedRole === "all" || u.role === selectedRole;

        // Filtro da Barra de Pesquisa (Nome, Email ou Telefone)
        const searchLower = searchTerm.toLowerCase();
        const nameMatch = u.full_name?.toLowerCase().includes(searchLower);
        const emailMatch = u.email?.toLowerCase().includes(searchLower);
        const phoneMatch = u.phone?.includes(searchLower);
        
        const searchMatch = !searchTerm || nameMatch || emailMatch || phoneMatch;

        return roleMatch && searchMatch;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const getVisiblePageNumbers = (totalPages: number, currentPage: number) => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const halfRange = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    if (endPage - startPage + 1 < maxVisiblePages) {
      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - maxVisiblePages + 1);
      }
      if (startPage === 1) {
        endPage = Math.min(totalPages, maxVisiblePages);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePageNumbers = getVisiblePageNumbers(totalPages, currentPage);

  return (
    <Sidebar>
      <div className="space-y-6 px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-sm text-muted-foreground">Gerencie usuários.</p>
          </div>
          <Link href="/manager/usuario/novo" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </Link>
        </div>

                {/* --- 4. Filtro (Barra de Pesquisa + Selects) --- */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 bg-card p-4 rounded-lg border">

                    {/* Barra de Pesquisa */}
                    <div className="relative w-full md:flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por nome, e-mail ou telefone..." 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reseta a paginação ao pesquisar
                            }}
                            className="pl-10 w-full bg-muted border-border focus:bg-card transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Select de Filtro por Papel */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select
                                onValueChange={(value) => {
                                    setSelectedRole(value);
                                    setCurrentPage(1);
                                }}
                                value={selectedRole}>

                                <SelectTrigger className="w-full sm:w-[150px]">
                                    <SelectValue placeholder="Papel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="gestor">Gestor</SelectItem>
                                    <SelectItem value="medico">Médico</SelectItem>
                                    <SelectItem value="secretaria">Secretária</SelectItem>
                                    <SelectItem value="user">Usuário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Select de Itens por Página */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select
                                onValueChange={handleItemsPerPageChange}
                                defaultValue={String(itemsPerPage)}
                            >
                                <SelectTrigger className="w-full sm:w-[80px]">
                                    <SelectValue placeholder="10" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <Button variant="outline" className="ml-auto w-full md:w-auto hidden lg:flex">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>
                {/* Fim do Filtro */}

        {/* Tabela/Lista */}
        <div className="bg-card rounded-lg border shadow-md overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
              Carregando usuários...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          ) : (
            <>
              {/* Tabela para Telas Médias e Grandes */}
              <table className="min-w-full divide-y hidden md:table">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y">
                  {currentItems.map((u) => (
                    <tr key={u.id} className="hover:bg-muted">
                      <td className="px-6 py-4 text-sm">
                        {u.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground break-all">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {u.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">
                        {u.role}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDetailsDialog(u)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

                            {/* Layout em Cards/Lista para Telas Pequenas */}
                            <div className="md:hidden divide-y">
                                {currentItems.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">
                                                {u.full_name || "—"}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {u.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground capitalize mt-1">
                                                {u.role || "—"}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => openDetailsDialog(u)}
                                                title="Visualizar"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 border-t">
                  {/* Botão Anterior */}
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                  >
                    {"< Anterior"}
                  </button>

                  {/* Números das Páginas */}
                  {visiblePageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 rounded-md font-medium transition-colors text-sm border ${
                        currentPage === number
                          ? "bg-primary text-primary-foreground shadow-md border-primary"
                          : "bg-muted text-muted-foreground hover:bg-muted/90"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  {/* Botão Próximo */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
                  >
                    {"Próximo >"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Detalhes */}
        <AlertDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {userDetails?.profile?.full_name || "Detalhes do Usuário"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {!userDetails ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
                    Buscando dados completos...
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 text-left text-muted-foreground">
                    <div>
                      <strong>ID:</strong> {userDetails.user.id}
                    </div>
                    <div>
                      <strong>E-mail:</strong> {userDetails.user.email}
                    </div>
                    <div>
                      <strong>Nome completo:</strong>{" "}
                      {userDetails.profile.full_name}
                    </div>
                    <div>
                      <strong>Telefone:</strong> {userDetails.profile.phone}
                    </div>
                    <div>
                      <strong>Roles:</strong> {userDetails.roles?.join(", ")}
                    </div>
                    <div className="pt-2">
                      <strong className="block mb-1">Permissões:</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-sm">
                        {Object.entries(userDetails.permissions || {}).map(
                          ([k, v]) => (
                            <li key={k}>
                              {k}:{" "}
                              <span
                                className={`font-semibold ${
                                  v ? "text-primary" : "text-destructive"
                                }`}
                              >
                                {v ? "Sim" : "Não"}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Fechar</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Sidebar>
  );
}
