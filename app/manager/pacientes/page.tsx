"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Calendar, Filter, Loader2, MoreVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { patientsService } from "@/services/patientsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function PacientesPage() {
    // --- ESTADOS DE DADOS E GERAL ---
    const [searchTerm, setSearchTerm] = useState("");
    const [convenioFilter, setConvenioFilter] = useState("all");
    const [vipFilter, setVipFilter] = useState("all");

    // Lista completa, carregada da API uma única vez
    const [allPatients, setAllPatients] = useState<any[]>([]);
    // Lista após a aplicação dos filtros (base para a paginação)
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- ESTADOS DE PAGINAÇÃO ---
    const [page, setPage] = useState(1);
    
    // PADRONIZAÇÃO: Iniciar com 10 itens por página
    const [pageSize, setPageSize] = useState(10);

    // CÁLCULO DA PAGINAÇÃO
    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    // Pacientes a serem exibidos na tabela (aplicando a paginação)
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    // --- ESTADOS DE DIALOGS ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [patientDetails, setPatientDetails] = useState<any | null>(null);

    // --- FUNÇÕES DE LÓGICA ---

    // 1. Função para carregar TODOS os pacientes da API
    const fetchAllPacientes = useCallback(
        async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await patientsService.list();

                const mapped = res.map((p: any) => ({
                    id: String(p.id ?? ""),
                    nome: p.full_name ?? "—",
                    telefone: p.phone_mobile ?? p.phone1 ?? "—",
                    cidade: p.city ?? "—",
                    estado: p.state ?? "—",
                    ultimoAtendimento: p.last_visit_at?.split('T')[0] ?? "—",
                    proximoAtendimento: p.next_appointment_at?.split('T')[0] ?? "—",
                    vip: Boolean(p.vip ?? false),
                    convenio: p.convenio ?? "Particular",
                    status: p.status ?? undefined,
                }));

                setAllPatients(mapped);
            } catch (e: any) {
                console.error(e);
                setError(e?.message || "Erro ao buscar pacientes");
            } finally {
                setLoading(false);
            }
        }, []);

    // 2. Efeito para aplicar filtros
    useEffect(() => {
        const filtered = allPatients.filter((patient) => {
            const matchesSearch =
                patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.telefone?.includes(searchTerm);

            const matchesConvenio =
                convenioFilter === "all" ||
                patient.convenio === convenioFilter;

            const matchesVip =
                vipFilter === "all" ||
                (vipFilter === "vip" && patient.vip) ||
                (vipFilter === "regular" && !patient.vip);

            return matchesSearch && matchesConvenio && matchesVip;
        });

        setFilteredPatients(filtered);
        setPage(1); // Reseta a página ao filtrar
    }, [allPatients, searchTerm, convenioFilter, vipFilter]);

    // 3. Efeito inicial
    useEffect(() => {
        fetchAllPacientes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- LÓGICA DE AÇÕES ---

    const openDetailsDialog = async (patientId: string) => {
        setDetailsDialogOpen(true);
        setPatientDetails(null);
        try {
            const res = await patientsService.getById(patientId);
            setPatientDetails(Array.isArray(res) ? res[0] : res);
        } catch (e: any) {
            setPatientDetails({ error: e?.message || "Erro ao buscar detalhes" });
        }
    };

    const handleDeletePatient = async (patientId: string) => {
        try {
            await patientsService.delete(patientId);
            setAllPatients((prev) =>
                prev.filter((p) => String(p.id) !== String(patientId))
            );
        } catch (e: any) {
            alert(`Erro ao deletar paciente: ${e?.message || "Erro desconhecido"}`);
        }
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    const openDeleteDialog = (patientId: string) => {
        setPatientToDelete(patientId);
        setDeleteDialogOpen(true);
    };

    return (
        <Sidebar>
            <div className="space-y-6 px-2 sm:px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">
                            Pacientes
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Gerencie as informações de seus pacientes
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border">
                    <Filter className="w-5 h-5 text-muted-foreground" />

                    {/* Busca */}
                    <input
                        type="text"
                        placeholder="Buscar por nome ou telefone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:flex-grow sm:max-w-[300px] p-2 border rounded-md text-sm"
                    />

                    {/* Convênio */}
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-grow sm:max-w-[200px]">
                        <span className="text-sm font-medium whitespace-nowrap hidden md:block">
                            Convênio
                        </span>
                        <Select value={convenioFilter} onValueChange={setConvenioFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Convênio" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Particular">Particular</SelectItem>
                                <SelectItem value="SUS">SUS</SelectItem>
                                <SelectItem value="Unimed">Unimed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* VIP */}
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-grow sm:max-w-[150px]">
                        <span className="text-sm font-medium whitespace-nowrap hidden md:block">VIP</span>
                        <Select value={vipFilter} onValueChange={setVipFilter}>
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="VIP" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Seletor de Itens por Página (Inicia com 10) */}
                    <div className="flex items-center gap-2 w-full sm:w-auto ml-auto sm:ml-0">
                        <Select 
                            value={String(pageSize)} 
                            onValueChange={(value) => {
                                setPageSize(Number(value));
                                setPage(1); // Resetar para página 1 ao mudar o tamanho
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[70px]">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabela */}
                <div className="bg-card rounded-lg border shadow-md hidden md:block">
                    <div className="overflow-x-auto">
                        {error ? (
                            <div className="p-6 text-destructive">{`Erro ao carregar pacientes: ${error}`}</div>
                        ) : loading ? (
                            <div className="p-6 text-center text-muted-foreground flex items-center justify-center">
                                <Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" />{" "}
                                Carregando pacientes...
                            </div>
                        ) : (
                            <table className="w-full min-w-[650px]">
                                <thead className="bg-muted border-b">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[20%]">Nome</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[15%] hidden sm:table-cell">Telefone</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[15%] hidden md:table-cell">Cidade / Estado</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[15%] hidden sm:table-cell">Convênio</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[15%] hidden lg:table-cell">Último atendimento</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[15%] hidden lg:table-cell">Próximo atendimento</th>
                                        <th className="text-left p-4 font-medium text-muted-foreground w-[5%]">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                                {allPatients.length === 0
                                                    ? "Nenhum paciente cadastrado"
                                                    : "Nenhum paciente encontrado com os filtros aplicados"}
                                            </td>
                                        </tr>
                                    ) : (
                                        currentPatients.map((patient) => (
                                            <tr key={patient.id} className="border-b hover:bg-muted">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                            <span className="text-primary font-medium text-sm">
                                                                {patient.nome?.charAt(0) || "?"}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium">
                                                            {patient.nome}
                                                            {patient.vip && (
                                                                <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-purple-400 bg-purple-400/15 dark:text-purple-300 dark:bg-purple-300/15">
                                                                    VIP
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground hidden sm:table-cell">{patient.telefone}</td>
                                                <td className="p-4 text-muted-foreground hidden md:table-cell">{`${patient.cidade} / ${patient.estado}`}</td>
                                                <td className="p-4 text-muted-foreground hidden sm:table-cell">{patient.convenio}</td>
                                                <td className="p-4 text-muted-foreground hidden lg:table-cell">{patient.ultimoAtendimento}</td>
                                                <td className="p-4 text-muted-foreground hidden lg:table-cell">{patient.proximoAtendimento}</td>
                                                <td className="p-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <div className="cursor-pointer">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openDetailsDialog(String(patient.id))}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                Ver detalhes
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/secretary/pacientes/${patient.id}/editar`} className="flex items-center w-full">
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Editar
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Calendar className="w-4 h-4 mr-2" />
                                                                Marcar consulta
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive" onClick={() => openDeleteDialog(String(patient.id))}>
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

                {/* Paginação */}
                {totalPages > 1 && !loading && (
                    <div className="flex flex-col sm:flex-row items-center justify-center p-4 border-t border-border">
                        <div className="flex space-x-2 flex-wrap justify-center">
                            <Button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                variant="outline"
                                size="lg"
                            >
                                &lt; Anterior
                            </Button>
                            {Array.from({ length: totalPages }, (_, index) => index + 1)
                                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                .map((pageNumber) => (
                                    <Button
                                        key={pageNumber}
                                        onClick={() => setPage(pageNumber)}
                                        variant={pageNumber === page ? "default" : "outline"}
                                        size="lg"
                                        className={
                                            pageNumber === page
                                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {pageNumber}
                                    </Button>
                                ))}
                            <Button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page === totalPages}
                                variant="outline"
                                size="lg"
                            >
                                Próximo &gt;
                            </Button>
                        </div>
                    </div>
                )}

                {/* Dialog de Exclusão */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => patientToDelete && handleDeletePatient(patientToDelete)}
                                className="bg-destructive hover:bg-destructive/90"
                            >
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Dialog de Detalhes */}
                <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Detalhes do Paciente</AlertDialogTitle>
                            <AlertDialogDescription>
                                {patientDetails === null ? (
                                    <div className="text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary my-4" />
                                        Carregando...
                                    </div>
                                ) : patientDetails?.error ? (
                                    <div className="text-destructive p-4">{patientDetails.error}</div>
                                ) : (
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-semibold">Nome Completo</p>
                                                <p>{patientDetails.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Email</p>
                                                <p>{patientDetails.email}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Telefone</p>
                                                <p>{patientDetails.phone_mobile}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Data de Nascimento</p>
                                                <p>{patientDetails.birth_date}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">CPF</p>
                                                <p>{patientDetails.cpf}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Tipo Sanguíneo</p>
                                                <p>{patientDetails.blood_type}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Peso (kg)</p>
                                                <p>{patientDetails.weight_kg}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold">Altura (m)</p>
                                                <p>{patientDetails.height_m}</p>
                                            </div>
                                        </div>
                                        <div className="border-t pt-4 mt-4">
                                            <h3 className="font-semibold mb-2">Endereço</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <p className="font-semibold">Rua</p>
                                                    <p>{`${patientDetails.street}, ${patientDetails.number}`}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Complemento</p>
                                                    <p>{patientDetails.complement}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Bairro</p>
                                                    <p>{patientDetails.neighborhood}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Cidade</p>
                                                    <p>{patientDetails.cidade}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">Estado</p>
                                                    <p>{patientDetails.estado}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold">CEP</p>
                                                    <p>{patientDetails.cep}</p>
                                                </div>
                                            </div>
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