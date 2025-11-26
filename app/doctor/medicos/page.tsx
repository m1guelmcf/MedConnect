"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Calendar, Trash2, Loader2 } from "lucide-react";
import { api } from "@/services/api.mjs";
import { PatientDetailsModal } from "@/components/ui/patient-details-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  ultimoAtendimento?: string;
  proximoAtendimento?: string;
  email?: string;
  birth_date?: string;
  cpf?: string;
  blood_type?: string;
  weight_kg?: number;
  height_m?: number;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cep?: string;
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Lógica de Paginação INÍCIO ---
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(pacientes.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pacientes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Funções de Navegação
  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Lógica para gerar os números das páginas visíveis (máximo de 5)
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

  // Lógica para mudar itens por página, resetando para a página 1
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  // --- Lógica de Paginação FIM ---

  const handleOpenModal = (patient: Paciente) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pt-BR").format(date);
    } catch (e) {
      return dateString; // Retorna o string original se o formato for inválido
    }
  };

  const fetchPacientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const json = await api.get("/rest/v1/patients");
      const items = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];

      const mapped: Paciente[] = items.map((p: any) => ({
        id: String(p.id ?? ""),
        nome: p.full_name ?? "—",
        telefone: p.phone_mobile ?? "N/A",
        cidade: p.city ?? "N/A",
        estado: p.state ?? "N/A",
        ultimoAtendimento: formatDate(p.created_at),
        proximoAtendimento: "N/A", // Necessita de lógica de agendamento real
        email: p.email ?? "N/A",
        birth_date: p.birth_date ?? "N/A",
        cpf: p.cpf ?? "N/A",
        blood_type: p.blood_type ?? "N/A",
        weight_kg: p.weight_kg ?? 0,
        height_m: p.height_m ?? 0,
        street: p.street ?? "N/A",
        number: p.number ?? "N/A",
        complement: p.complement ?? "N/A",
        neighborhood: p.neighborhood ?? "N/A",
        cep: p.cep ?? "N/A",
      }));

      setPacientes(mapped);
      setCurrentPage(1); // Resetar a página ao carregar novos dados
    } catch (e: any) {
      console.error("Erro ao carregar pacientes:", e);
      setError(e?.message || "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  return (
    <Sidebar>
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {" "}
          {/* Ajustado para flex-col em telas pequenas */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lista de pacientes vinculados
            </p>
          </div>
          {/* Controles de filtro e novo paciente */}
          {/* Alterado para que o Select e o Link ocupem a largura total em telas pequenas e fiquem lado a lado em telas maiores */}
          <div className="flex flex-wrap gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-start sm:justify-end">
            <Select
              onValueChange={handleItemsPerPageChange}
              defaultValue={String(itemsPerPage)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Itens por pág." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/doctor/pacientes/novo" className="w-full sm:w-auto">
              <Button
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md">
          {/* Tabela para Telas Médias e Grandes */}
          <div className="overflow-x-auto hidden md:block">
            {" "}
            {/* Esconde em telas pequenas */}
            <table className="min-w-[600px] w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">
                    Nome
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">
                    Telefone
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden lg:table-cell">
                    Cidade
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden lg:table-cell">
                    Estado
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden xl:table-cell">
                    Último atendimento
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden xl:table-cell">
                    Próximo atendimento
                  </th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-muted-foreground text-center"
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      Carregando pacientes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-red-600 text-center"
                    >{`Erro: ${error}`}</td>
                  </tr>
                ) : pacientes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Nenhum paciente encontrado
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border hover:bg-accent/40 transition-colors"
                    >
                      <td className="p-3 sm:p-4">{p.nome}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground">
                        {p.telefone}
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden lg:table-cell">
                        {p.cidade}
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden lg:table-cell">
                        {p.estado}
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden xl:table-cell">
                        {p.ultimoAtendimento}
                      </td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden xl:table-cell">
                        {p.proximoAtendimento}
                      </td>
                      <td className="p-3 sm:p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-primary hover:underline text-sm sm:text-base">
                              Ações
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenModal(p)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/doctor/pacientes/${p.id}/laudos`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Laudos
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                alert(`Agenda para paciente ID: ${p.id}`)
                              }
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Ver agenda
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newPacientes = pacientes.filter(
                                  (pac) => pac.id !== p.id
                                );
                                setPacientes(newPacientes);
                                alert(`Paciente ID: ${p.id} excluído`);
                              }}
                              className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            >
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
          </div>

          {/* Layout em Cards/Lista para Telas Pequenas */}
          <div className="md:hidden divide-y divide-border">
            {" "}
            {/* Visível apenas em telas pequenas */}
            {loading ? (
              <div className="p-6 text-muted-foreground text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                Carregando pacientes...
              </div>
            ) : error ? (
              <div className="p-6 text-red-600 text-center">{`Erro: ${error}`}</div>
            ) : pacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum paciente encontrado
              </div>
            ) : (
              currentItems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    {" "}
                    {/* Adicionado padding à direita */}
                    <div className="text-base font-semibold text-foreground break-words">
                      {" "}
                      {/* Aumentado a fonte e break-words para evitar corte do nome */}
                      {p.nome || "—"}
                    </div>
                    {/* Removido o 'truncate' e adicionado 'break-words' no telefone */}
                    <div className="text-sm text-muted-foreground break-words">
                      Telefone: **{p.telefone || "N/A"}**
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenModal(p)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/doctor/pacientes/${p.id}/laudos`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Laudos
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            alert(`Agenda para paciente ID: ${p.id}`)
                          }
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Ver agenda
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const newPacientes = pacientes.filter(
                              (pac) => pac.id !== p.id
                            );
                            setPacientes(newPacientes);
                            alert(`Paciente ID: ${p.id} excluído`);
                          }}
                          className="text-red-600 focus:bg-red-50 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 border-t border-border p-4 bg-muted/40">
              {/* Botão Anterior */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed border border-border"
              >
                {"< Anterior"}
              </button>

              {/* Números das Páginas */}
              {visiblePageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors text-sm border border-border ${
                    currentPage === number
                      ? "bg-blue-600 text-primary-foreground shadow-md border-blue-600"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {number}
                </button>
              ))}

              {/* Botão Próximo */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed border border-border"
              >
                {"Próximo >"}
              </button>
            </div>
          )}
        </div>
      </div>

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Sidebar>
  );
}
