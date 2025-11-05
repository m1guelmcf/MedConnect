// app/manager/usuario/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import ManagerLayout from "@/components/manager-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Filter, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, login } from "services/api.mjs";
import { usersService } from "services/usersApi.mjs";

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
  const [userDetails, setUserDetails] = useState<UserInfoResponse | null>(
    null
  );
  const [selectedRole, setSelectedRole] = useState<string>("");

  // --- Lógica de Paginação ADICIONADA ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Lógica para mudar itens por página, resetando para a página 1
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Resetar para a primeira página
  };
  // --- Fim da Lógica de Paginação ADICIONADA ---

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
      setCurrentPage(1); // Resetar a página após carregar
      console.log("[fetchUsers] mapped count:", mapped.length);
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
      console.log("[openDetailsDialog] user_id:", flatUser.user_id);
      const data = await usersService.full_data(flatUser.user_id);
      console.log("[openDetailsDialog] full_data returned:", data);
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

  // 1. Filtragem
  const filteredUsers =
    selectedRole && selectedRole !== "all"
      ? users.filter((u) => u.role === selectedRole)
      : users;

  // 2. Paginação (aplicada sobre a lista filtrada)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Função para mudar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredUsers.length / itemsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  return (
    <ManagerLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-sm text-gray-500">Gerencie usuários.</p>
          </div>
          <Link href="/manager/usuario/novo" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </Link>
        </div>

        {/* Filtro e Itens por Página ADICIONADO */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
          <Filter className="w-5 h-5 text-gray-400" />
          {/* Select de Filtro por Papel */}
          <Select onValueChange={setSelectedRole} value={selectedRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por papel" />
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
          {/* Select de Itens por Página ADICIONADO */}
          <Select
            onValueChange={handleItemsPerPageChange}
            defaultValue={String(itemsPerPage)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Itens por pág." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="20">20 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Fim do Filtro e Itens por Página ADICIONADO */}

        {/* Tabela */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
              Carregando usuários...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum usuário encontrado com os filtros aplicados.
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 hidden md:table-header-group">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      E-mail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Usando currentItems para a paginação */}
                  {currentItems.map((u) => (
                    <tr
                      key={u.id}
                      className="flex flex-col md:table-row md:flex-row border-b md:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-500 break-all md:whitespace-nowrap">
                        {u.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 break-all">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {u.phone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">
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

              {/* Paginação ADICIONADA */}
              {pageNumbers.length > 1 && (
                <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 border-t border-gray-200">
                  {pageNumbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                        currentPage === number
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              )}
              {/* Fim da Paginação ADICIONADA */}
            </>
          )}
        </div>

        {/* Modal de Detalhes */}
        <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {userDetails?.profile?.full_name || "Detalhes do Usuário"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {!userDetails ? (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-green-600" />
                    Buscando dados completos...
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 text-left text-gray-700">
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
                      <strong>Roles:</strong>{" "}
                      {userDetails.roles?.join(", ")}
                    </div>
                    <div>
                      <strong>Permissões:</strong>
                      <ul className="list-disc list-inside">
                        {Object.entries(
                          userDetails.permissions || {}
                        ).map(([k, v]) => (
                          <li key={k}>
                            {k}: {v ? "Sim" : "Não"}
                          </li>
                        ))}
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
    </ManagerLayout>
  );
}