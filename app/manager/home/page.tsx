"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Eye, Calendar, Filter, Loader2, MoreVertical } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { doctorsService } from "services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";

// --- NOVOS IMPORTS (Certifique-se que criou os arquivos no passo anterior) ---
import { FilterBar } from "@/components/ui/filter-bar";
import { normalizeSpecialty, getUniqueSpecialties } from "@/lib/normalization";

interface Doctor {
  id: number;
  full_name: string;
  specialty: string;
  crm: string;
  phone_mobile: string | null;
  city: string | null;
  state: string | null;
  status?: string;
}

interface DoctorDetails {
  nome: string;
  crm: string;
  especialidade: string;
  contato: {
    celular?: string;
    telefone1?: string;
  };
  endereco: {
    cidade?: string;
    estado?: string;
  };
  convenio?: string;
  vip?: boolean;
  status?: string;
  ultimo_atendimento?: string;
  proximo_atendimento?: string;
  error?: string;
}

export default function DoctorsPage() {
  const router = useRouter();

    // --- Estados de Dados ---
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Estados de Modais ---
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDeleteId, setDoctorToDeleteId] = useState<number | null>(null);

    // --- Estados de Filtro e Busca ---
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState({
        specialty: "all",
        status: "all"
    });

    // --- Estados de Paginação ---
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // 1. Buscar Médicos na API
    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: Doctor[] = await doctorsService.list();
            // Mockando status para visualização (conforme original)
            const dataWithStatus = data.map((doc, index) => ({
                ...doc,
                status: index % 3 === 0 ? "Inativo" : index % 2 === 0 ? "Férias" : "Ativo",
            }));
            setDoctors(dataWithStatus || []);
            // Não resetamos a página aqui para manter a navegação fluida se apenas recarregar dados
        } catch (e: any) {
            console.error("Erro ao carregar lista de médicos:", e);
            setError("Não foi possível carregar a lista de médicos. Verifique a conexão com a API.");
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

    // 2. Gerar lista única de especialidades (Normalizada)
    const uniqueSpecialties = useMemo(() => {
        return getUniqueSpecialties(doctors);
    }, [doctors]);

    // 3. Lógica de Filtragem Centralizada
    const filteredDoctors = useMemo(() => {
        return doctors.filter((doctor) => {
            // Normaliza a especialidade do médico atual para comparar
            const normalizedDocSpecialty = normalizeSpecialty(doctor.specialty);
            
            // Filtros exatos
            const specialtyMatch = filters.specialty === "all" || normalizedDocSpecialty === filters.specialty;
            const statusMatch = filters.status === "all" || doctor.status === filters.status;
            
            // Busca textual (Nome, Telefone, CRM)
            const searchLower = searchTerm.toLowerCase();
            const nameMatch = doctor.full_name?.toLowerCase().includes(searchLower);
            const phoneMatch = doctor.phone_mobile?.includes(searchLower);
            const crmMatch = doctor.crm?.toLowerCase().includes(searchLower);

            return specialtyMatch && statusMatch && (searchTerm === "" || nameMatch || phoneMatch || crmMatch);
        });
    }, [doctors, filters, searchTerm]);

    // --- Handlers de Controle (Com Reset de Paginação) ---

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Correção: Reseta para página 1 ao buscar
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Correção: Reseta para página 1 ao filtrar
    };

    const handleClearFilters = () => {
        setSearchTerm("");
        setFilters({ specialty: "all", status: "all" });
        setCurrentPage(1); // Correção: Reseta para página 1 ao limpar
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    // --- Lógica de Paginação ---
    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const goToPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
    const goToNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

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

    // --- Handlers de Ações (Detalhes e Delete) ---
    const openDetailsDialog = (doctor: Doctor) => {
        setDetailsDialogOpen(true);
        setDoctorDetails({
            nome: doctor.full_name,
            crm: doctor.crm,
            especialidade: normalizeSpecialty(doctor.specialty), // Exibe normalizado
            contato: { celular: doctor.phone_mobile ?? undefined },
            endereco: { cidade: doctor.city ?? undefined, estado: doctor.state ?? undefined },
            status: doctor.status || "Ativo",
            convenio: "Particular",
            vip: false,
            ultimo_atendimento: "N/A",
            proximo_atendimento: "N/A",
        });
    };

    const openDeleteDialog = (doctorId: number) => {
        setDoctorToDeleteId(doctorId);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (doctorToDeleteId === null) return;
        setLoading(true);
        try {
            await doctorsService.delete(doctorToDeleteId);
            setDeleteDialogOpen(false);
            setDoctorToDeleteId(null);
            await fetchDoctors();
        } catch (e) {
            console.error("Erro ao excluir:", e);
            alert("Erro ao excluir médico.");
        } finally {
            setLoading(false);
        }
    };

  return (
    <Sidebar>
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              Médicos Cadastrados
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os profissionais de saúde.
            </p>
          </div>
        </div>

                {/* --- NOVO COMPONENTE DE FILTRO --- */}
                <FilterBar
                    searchTerm={searchTerm}
                    onSearch={handleSearch}
                    activeFilters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    searchPlaceholder="Buscar por nome, CRM ou telefone..."
                    filters={[
                        { 
                            key: "specialty", 
                            label: "Especialidade", 
                            options: uniqueSpecialties 
                        },
                        { 
                            key: "status", 
                            label: "Status", 
                            options: ["Ativo", "Férias", "Inativo"] 
                        }
                    ]}
                >
                    {/* Seletor de Itens por Página (Filho do FilterBar) */}
                    <div className="hidden lg:block">
                        <Select onValueChange={handleItemsPerPageChange} defaultValue={String(itemsPerPage)}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FilterBar>

                {/* Tabela de Médicos */}
                <div className="bg-card rounded-lg border shadow-md overflow-hidden hidden md:block">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            Carregando médicos...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {doctors.length === 0
                                ? <>Nenhum médico cadastrado. <Link href="/manager/home/novo" className="text-primary hover:underline">Adicione um novo</Link>.</>
                                : "Nenhum médico encontrado com os filtros aplicados."
                            }
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-muted border-b">
                                    <tr>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground">Nome</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground">CRM</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground">Especialidade</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden lg:table-cell">Status</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-muted-foreground hidden xl:table-cell">Cidade/Estado</th>
                                        <th className="text-right p-4 font-medium text-muted-foreground">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y">
                                    {currentItems.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-muted transition">
                                            <td className="px-4 py-3 font-medium">
                                                {doctor.full_name}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{doctor.crm}</td>
                                            <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                                                {/* Exibe Especialidade Normalizada */}
                                                {normalizeSpecialty(doctor.specialty)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    doctor.status === 'Ativo' ? 'bg-primary/10 text-primary' : 
                                                    doctor.status === 'Inativo' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-400/10 text-yellow-400'
                                                }`}>
                                                    {doctor.status || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">
                                                {(doctor.city || doctor.state)
                                                    ? `${doctor.city || ""}${doctor.city && doctor.state ? '/' : ''}${doctor.state || ""}`
                                                    : "N/A"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openDetailsDialog(doctor)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Ver detalhes
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/manager/home/${doctor.id}/editar`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Marcar consulta
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(doctor.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Cards de Médicos (Mobile) */}
                <div className="bg-card rounded-lg border shadow-md p-4 block md:hidden">
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                            Carregando médicos...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-destructive">{error}</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {doctors.length === 0
                                ? <>Nenhum médico cadastrado. <Link href="/manager/home/novo" className="text-primary hover:underline">Adicione um novo</Link>.</>
                                : "Nenhum médico encontrado com os filtros aplicados."
                            }
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((doctor) => (
                                <div key={doctor.id} className="bg-muted rounded-lg p-4 flex justify-between items-center border">
                                    <div>
                                        <div className="font-semibold">{doctor.full_name}</div>
                                        <div className="text-xs text-muted-foreground mb-1">{doctor.phone_mobile}</div>
                                        <div className="text-sm text-muted-foreground">{normalizeSpecialty(doctor.specialty)}</div>
                                        <div className="text-xs mt-1">
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                    doctor.status === 'Ativo' ? 'bg-primary/10 text-primary' : 
                                                    doctor.status === 'Inativo' ? 'bg-destructive/10 text-destructive' : 'bg-yellow-400/10 text-yellow-400'
                                                }`}>
                                                    {doctor.status || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <div className="font-bold text-muted-foreground">...</div>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDetailsDialog(doctor)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Ver detalhes
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/manager/home/${doctor.id}/editar`}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(doctor.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 bg-card rounded-lg border shadow-md">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
            >
              {"< Anterior"}
            </button>

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

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-muted text-muted-foreground hover:bg-muted/90 disabled:opacity-50 disabled:cursor-not-allowed border"
            >
              {"Próximo >"}
            </button>
          </div>
        )}

                {/* Dialogs (Exclusão e Detalhes) */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirma a exclusão?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação é irreversível e excluirá permanentemente o registro deste médico.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

        <AlertDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        >
          <AlertDialogContent className="max-w-[95%] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {doctorDetails?.nome}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left text-muted-foreground">
                {doctorDetails && (
                  <div className="space-y-3 text-left">
                    <h3 className="font-semibold mt-2">
                      Informações Principais
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div>
                        <strong>CRM:</strong> {doctorDetails.crm}
                      </div>
                      <div>
                        <strong>Especialidade:</strong>{" "}
                        {doctorDetails.especialidade}
                      </div>
                      <div>
                        <strong>Celular:</strong>{" "}
                        {doctorDetails.contato.celular || "N/A"}
                      </div>
                      <div>
                        <strong>Localização:</strong>{" "}
                        {`${doctorDetails.endereco.cidade || "N/A"}/${
                          doctorDetails.endereco.estado || "N/A"
                        }`}
                      </div>
                    </div>

                    <h3 className="font-semibold mt-4">
                      Atendimento e Convênio
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                      <div>
                        <strong>Convênio:</strong>{" "}
                        {doctorDetails.convenio || "N/A"}
                      </div>
                      <div>
                        <strong>VIP:</strong>{" "}
                        {doctorDetails.vip ? "Sim" : "Não"}
                      </div>
                      <div>
                        <strong>Status:</strong> {doctorDetails.status || "N/A"}
                      </div>
                      <div>
                        <strong>Último atendimento:</strong>{" "}
                        {doctorDetails.ultimo_atendimento || "N/A"}
                      </div>
                      <div>
                        <strong>Próximo atendimento:</strong>{" "}
                        {doctorDetails.proximo_atendimento || "N/A"}
                      </div>
                    </div>
                  </div>
                )}
                {doctorDetails === null && !loading && (
                  <div className="text-destructive">Detalhes não disponíveis.</div>
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
