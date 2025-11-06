"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Calendar, Filter, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ManagerLayout from "@/components/manager-layout";
import { patientsService } from "@/services/patientsApi.mjs";

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return "N/A";
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return "Data inválida";
  }
};


export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [convenioFilter, setConvenioFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Alterado para true
  const [error, setError] = useState<string | null>(null);

  // --- Estados de Paginação (ADICIONADOS) ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  // ---------------------------------------------

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [patientDetails, setPatientDetails] = useState<any | null>(null);

  const openDetailsDialog = async (patientId: string) => {
    setDetailsDialogOpen(true);
    setPatientDetails(null);
    try {
      const res = await patientsService.getById(patientId);
      setPatientDetails(res[0]);
    } catch (e: any) {
      setPatientDetails({ error: e?.message || "Erro ao buscar detalhes" });
    }
  };

  // --- LÓGICA DE BUSCA DE DADOS (ATUALIZADA) ---
  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await patientsService.list();
      const mapped = res.map((p: any) => ({
        id: String(p.id ?? ""),
        nome: p.full_name ?? "",
        telefone: p.phone_mobile ?? p.phone1 ?? "",
        cidade: p.city ?? "",
        estado: p.state ?? "",
        ultimoAtendimento: p.last_visit_at ?? "",
        proximoAtendimento: p.next_appointment_at ?? "",
        vip: Boolean(p.vip ?? false),
        convenio: p.convenio ?? "",
        status: p.status ?? undefined,
      }));
      setPatients(mapped);
      setCurrentPage(1); // Resetar para a primeira página ao carregar
    } catch (e: any) {
      setError(e?.message || "Erro ao buscar pacientes");
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const handleDeletePatient = async (patientId: string) => {
    try {
      await patientsService.delete(patientId);
      // Recarrega a lista para refletir a exclusão
      await fetchPacientes();
    } catch (e: any) {
      setError(e?.message || "Erro ao deletar paciente");
    }
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const openDeleteDialog = (patientId: string) => {
    setPatientToDelete(patientId);
    setDeleteDialogOpen(true);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.telefone?.includes(searchTerm);
    const matchesConvenio =
      convenioFilter === "all" || (patient.convenio ?? "") === convenioFilter;
    const matchesVip =
      vipFilter === "all" ||
      (vipFilter === "vip" && patient.vip) ||
      (vipFilter === "regular" && !patient.vip);

    return matchesSearch && matchesConvenio && matchesVip;
  });

  // --- LÓGICA DE PAGINAÇÃO (ADICIONADA) ---
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Resetar para a primeira página
  };
  // ---------------------------------------------


  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Pacientes
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Gerencie as informações de seus pacientes
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/manager/pacientes/novo">
              <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Novo
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-foreground">
              Convênio
            </span>
            <Select value={convenioFilter} onValueChange={setConvenioFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Selecione o Convênio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Particular">Particular</SelectItem>
                <SelectItem value="SUS">SUS</SelectItem>
                <SelectItem value="Unimed">Unimed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-foreground">VIP</span>
            <Select value={vipFilter} onValueChange={setVipFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* SELETOR DE ITENS POR PÁGINA (ADICIONADO) */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-foreground">Itens por página</span>
            <Select onValueChange={handleItemsPerPageChange} defaultValue={String(itemsPerPage)}>
              <SelectTrigger className="w-full md:w-32">
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

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                Carregando pacientes...
              </div>
            ) : error ? (
              <div className="p-6 text-red-600">{`Erro ao carregar pacientes: ${error}`}</div>
            ) : (
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Nome</th>
                    <th className="text-left p-4 font-medium text-gray-700">Telefone</th>
                    <th className="text-left p-4 font-medium text-gray-700">Cidade</th>
                    <th className="text-left p-4 font-medium text-gray-700">Último Atendimento</th>
                    <th className="text-right p-4 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        {patients.length === 0 ? "Nenhum paciente cadastrado." : "Nenhum paciente encontrado com os filtros aplicados."}
                      </td>
                    </tr>
                  ) : (
                    // Mapeando `currentItems` em vez de `filteredPatients`
                    currentItems.map((patient) => (
                      <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-sm">{patient.nome?.charAt(0) || "?"}</span>
                            </div>
                            <span className="font-medium text-gray-900">{patient.nome}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{patient.telefone}</td>
                        <td className="p-4 text-gray-600">{patient.cidade}</td>
                        <td className="p-4 text-gray-600">{formatDate(patient.ultimoAtendimento)}</td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="text-blue-600 cursor-pointer inline-block">Ações</div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailsDialog(String(patient.id))}>
                                <Eye className="w-4 h-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/manager/pacientes/${patient.id}/editar`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Marcar consulta
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(String(patient.id))}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* COMPONENTE DE PAGINAÇÃO (ADICIONADO) */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-md">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              {"< Anterior"}
            </button>

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

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              {"Próximo >"}
            </button>
          </div>
        )}

        {/* MODAIS (SEM ALTERAÇÃO) */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este paciente? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  patientToDelete && handleDeletePatient(patientToDelete)
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Detalhes do Paciente</AlertDialogTitle>
              <AlertDialogDescription>
                {patientDetails === null ? (
                  <div className="text-gray-500">Carregando...</div>
                ) : patientDetails?.error ? (
                  <div className="text-red-600">{patientDetails.error}</div>
                ) : (
                  <div className="space-y-2 text-left">
                    <p><strong>Nome:</strong> {patientDetails.full_name}</p>
                    <p><strong>CPF:</strong> {patientDetails.cpf}</p>
                    <p><strong>Email:</strong> {patientDetails.email}</p>
                    <p><strong>Telefone:</strong> {patientDetails.phone_mobile ?? patientDetails.phone1 ?? patientDetails.phone2 ?? "-"}</p>
                    <p><strong>Endereço:</strong> {`${patientDetails.street ?? "-"}, ${patientDetails.neighborhood ?? "-"}, ${patientDetails.city ?? "-"} - ${patientDetails.state ?? "-"}`}</p>
                    <p><strong>Criado em:</strong> {formatDate(patientDetails.created_at)}</p>
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