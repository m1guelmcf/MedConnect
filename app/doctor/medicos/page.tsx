"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Calendar, Trash2, Loader2, MoreVertical, Filter } from "lucide-react";
import { api } from "@/services/api.mjs";
import { PatientDetailsModal } from "@/components/ui/patient-details-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; 
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
  // NOVOS CAMPOS PARA O FILTRO
  convenio?: string; 
  vip?: string;      
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Paciente | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- ESTADOS DOS FILTROS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [convenioFilter, setConvenioFilter] = useState("todos");
  const [vipFilter, setVipFilter] = useState("todos");

  // --- Lógica de Filtragem ---
  const filteredPacientes = pacientes.filter((p) => {
    // 1. Filtro de Texto (Nome ou Telefone)
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = p.nome?.toLowerCase().includes(searchLower) || p.telefone?.includes(searchLower);

    // 2. Filtro de Convênio
    // Se for "todos", passa. Se não, verifica se o convênio do paciente é igual ao selecionado.
    const matchesConvenio = convenioFilter === "todos" || (p.convenio?.toLowerCase() === convenioFilter);

    // 3. Filtro VIP
    // Se for "todos", passa. Se não, verifica se o status VIP é igual ao selecionado.
    const matchesVip = vipFilter === "todos" || (p.vip?.toLowerCase() === vipFilter);

    return matchesSearch && matchesConvenio && matchesVip;
  });

  // --- Lógica de Paginação ---
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Resetar página quando qualquer filtro mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, convenioFilter, vipFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredPacientes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPacientes.slice(indexOfFirstItem, indexOfLastItem);

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
    setCurrentPage(1);
  };

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
      return dateString;
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
        proximoAtendimento: "N/A",
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
        
        // ⚠️ ATENÇÃO: Verifique o nome real desses campos na sua API
        // Se a API não retorna, estou colocando valores padrão para teste
        convenio: p.insurance_plan || p.convenio || "Unimed", // Exemplo: mapeie o campo correto
        vip: p.is_vip ? "Sim" : "Não", // Exemplo: se for booleano converta para string
      }));

      setPacientes(mapped);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Lista de pacientes vinculados
            </p>
          </div>
        </div>

        {/* --- BARRA DE PESQUISA COM FILTROS ATIVOS --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center p-2 border border-border rounded-lg bg-card shadow-sm">
            
            {/* Input de Busca */}
            <div className="flex items-center gap-3 flex-1 w-full px-2">
                <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <Input 
                    type="text" 
                    placeholder="Buscar por nome ou telefone..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 focus-visible:ring-0 shadow-none bg-transparent px-0 h-auto text-base placeholder:text-muted-foreground"
                />
            </div>

            {/* Filtros e Paginação */}
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto px-2 border-t md:border-t-0 md:border-l border-border pt-2 md:pt-0 justify-end">
                
                {/* FILTRO CONVÊNIO */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground hidden lg:inline">Convênio</span>
                    <Select value={convenioFilter} onValueChange={setConvenioFilter}>
                        <SelectTrigger className="w-[100px] h-8 border-border bg-transparent focus:ring-0">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            {/* Certifique-se que o 'value' aqui seja minúsculo para bater com a lógica do filtro */}
                            <SelectItem value="unimed">Unimed</SelectItem>
                            <SelectItem value="bradesco">Bradesco</SelectItem>
                            <SelectItem value="particular">Particular</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* FILTRO VIP */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium whitespace-nowrap text-muted-foreground hidden lg:inline">VIP</span>
                    <Select value={vipFilter} onValueChange={setVipFilter}>
                        <SelectTrigger className="w-[90px] h-8 border-border bg-transparent focus:ring-0">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos</SelectItem>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="não">Não</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* PAGINAÇÃO */}
                <div className="flex items-center gap-2 pl-2 md:border-l border-border">
                   <Select
                      onValueChange={handleItemsPerPageChange}
                      defaultValue={String(itemsPerPage)}
                    >
                      <SelectTrigger className="w-[130px] h-8 border-border bg-transparent focus:ring-0">
                        <SelectValue placeholder="Paginação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 por página</SelectItem>
                        <SelectItem value="10">10 por página</SelectItem>
                        <SelectItem value="20">20 por página</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

            </div>
        </div>

        {/* Tabela de Dados */}
        <div className="bg-card rounded-lg border border-border overflow-hidden shadow-md">
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-[600px] w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">Nome</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">Telefone</th>
                  {/* Coluna Convênio visível para teste */}
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden lg:table-cell">Convênio</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden lg:table-cell">VIP</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden xl:table-cell">Último atendimento</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-muted-foreground text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      Carregando pacientes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-red-600 text-center">{`Erro: ${error}`}</td>
                  </tr>
                ) : filteredPacientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                       Nenhum paciente encontrado com esses filtros.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr key={p.id} className="border-b border-border hover:bg-accent/40 transition-colors">
                      <td className="p-3 sm:p-4">{p.nome}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground">{p.telefone}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden lg:table-cell">{p.convenio}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden lg:table-cell">{p.vip}</td>
                      <td className="p-3 sm:p-4 text-muted-foreground hidden xl:table-cell">{p.ultimoAtendimento}</td>
                      <td className="p-3 sm:p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenModal(p)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/doctor/medicos/${p.id}/laudos`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Laudos
                              </Link>
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

          {/* Cards para Mobile */}
          <div className="md:hidden divide-y divide-border">
            {loading ? (
              <div className="p-6 text-muted-foreground text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                Carregando...
              </div>
            ) : filteredPacientes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                 Nenhum paciente encontrado.
              </div>
            ) : (
              currentItems.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 hover:bg-accent/40 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-base font-semibold text-foreground break-words">
                      {p.nome || "—"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                       {p.telefone} | {p.convenio} | VIP: {p.vip}
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
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed border border-border"
              >
                {"< Anterior"}
              </button>

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