// app/manager/usuario/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Filter, Loader2 } from "lucide-react";
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
    const [userDetails, setUserDetails] = useState<UserInfoResponse | null>(
        null
    );
    // Ajuste 1: Definir 'all' como valor inicial para garantir que todos os usuários sejam exibidos por padrão.
    const [selectedRole, setSelectedRole] = useState<string>("all");

    // --- Lógica de Paginação INÍCIO ---
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Lógica para mudar itens por página, resetando para a página 1
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Resetar para a primeira página
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

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // --- Funções e Lógica de Navegação ADICIONADAS ---
    const goToPrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    };

    // Lógica para gerar os números das páginas visíveis
    const getVisiblePageNumbers = (totalPages: number, currentPage: number) => {
        const pages: number[] = [];
        const maxVisiblePages = 5; // Número máximo de botões de página a serem exibidos (ex: 2, 3, 4, 5, 6)
        const halfRange = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfRange);
        let endPage = Math.min(totalPages, currentPage + halfRange);

        // Ajusta para manter o número fixo de botões quando nos limites
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
    // --- Fim das Funções e Lógica de Navegação ADICIONADAS ---


    return (
        <Sidebar>
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

                {/* Filtro e Itens por Página */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">

                    {/* Select de Filtro por Papel - Ajustado para resetar a página */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-foreground">
                            Filtrar por papel
                        </span>
                        <Select
                            onValueChange={(value) => {
                                setSelectedRole(value);
                                setCurrentPage(1); // Resetar para a primeira página ao mudar o filtro
                            }}
                            value={selectedRole}>

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
                    </div>

                    {/* Select de Itens por Página */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-foreground">
                            Itens por página
                        </span>
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
                    <Button variant="outline" className="ml-auto w-full md:w-auto">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtro avançado
                    </Button>
                </div>
                {/* Fim do Filtro e Itens por Página */}

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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
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

                            {/* Paginação ATUALIZADA */}
                            {totalPages > 1 && (
                                <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 border-t border-gray-200">

                                    {/* Botão Anterior */}
                                    <button
                                        onClick={goToPrevPage}
                                        disabled={currentPage === 1}
                                        className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                                    >
                                        {"< Anterior"}
                                    </button>

                                    {/* Números das Páginas */}
                                    {visiblePageNumbers.map((number) => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`px-4 py-2 rounded-md font-medium transition-colors text-sm border border-gray-300 ${currentPage === number
                                                ? "bg-green-600 text-white shadow-md border-green-600"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {number}
                                        </button>
                                    ))}

                                    {/* Botão Próximo */}
                                    <button
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
                                    >
                                        {"Próximo >"}
                                    </button>

                                </div>
                            )}
                            {/* Fim da Paginação ATUALIZADA */}
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
                                        {/* Melhoria na visualização das permissões no modal */}
                                        <div className="pt-2">
                                            <strong className="block mb-1">Permissões:</strong>
                                            <ul className="list-disc list-inside space-y-0.5 text-sm">
                                                {Object.entries(
                                                    userDetails.permissions || {}
                                                ).map(([k, v]) => (
                                                    <li key={k}>
                                                        {k}: <span className={`font-semibold ${v ? 'text-green-600' : 'text-red-600'}`}>{v ? "Sim" : "Não"}</span>
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
        </Sidebar>
    );
}