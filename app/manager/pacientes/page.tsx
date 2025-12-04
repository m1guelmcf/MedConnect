"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Eye, Calendar, Filter, Loader2, MoreVertical, Phone, MapPin, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { patientsService } from "@/services/patientsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function PacientesPage() {
    // --- ESTADOS ---
    const [searchTerm, setSearchTerm] = useState("");
    const [convenioFilter, setConvenioFilter] = useState("all");
    const [vipFilter, setVipFilter] = useState("all");

    const [allPatients, setAllPatients] = useState<any[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- PAGINAÇÃO ---
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const currentPatients = filteredPatients.slice(startIndex, endIndex);

    // --- DIALOGS ---
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [patientDetails, setPatientDetails] = useState<any | null>(null);

    // --- LÓGICA DE NÚMEROS DA PAGINAÇÃO (LIMITADO A 3) ---
    const getPageNumbers = () => {
        const maxVisible = 3;
        
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = Math.max(1, page - 1);
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end === totalPages) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // --- FETCH DADOS ---
    const fetchAllPacientes = useCallback(async () => {
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

    useEffect(() => {
        const filtered = allPatients.filter((patient) => {
            const matchesSearch = patient.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || patient.telefone?.includes(searchTerm);
            const matchesConvenio = convenioFilter === "all" || patient.convenio === convenioFilter;
            const matchesVip = vipFilter === "all" || (vipFilter === "vip" && patient.vip) || (vipFilter === "regular" && !patient.vip);
            return matchesSearch && matchesConvenio && matchesVip;
        });
        setFilteredPatients(filtered);
        setPage(1); 
    }, [allPatients, searchTerm, convenioFilter, vipFilter]);

    useEffect(() => {
        fetchAllPacientes();
    }, []);

    // --- AÇÕES ---
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
            setAllPatients((prev) => prev.filter((p) => String(p.id) !== String(patientId)));
        } catch (e: any) {
            alert(`Erro ao deletar paciente: ${e?.message || "Erro desconhecido"}`);
        }
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    const ActionMenu = ({ patientId }: { patientId: string }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="cursor-pointer p-2 hover:bg-muted rounded-full">
                    <MoreVertical className="h-4 w-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openDetailsDialog(String(patientId))}>
                    <Eye className="w-4 h-4 mr-2" /> Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/manager/pacientes/${patientId}/editar`} className="flex items-center w-full">
                        <Edit className="w-4 h-4 mr-2" /> Editar
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Calendar className="w-4 h-4 mr-2" /> Marcar consulta
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => { setPatientToDelete(patientId); setDeleteDialogOpen(true); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <Sidebar>
            <div className="space-y-6 px-2 sm:px-4 md:px-8 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Pacientes</h1>
                        <p className="text-muted-foreground text-sm md:text-base">Gerencie as informações de seus pacientes</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <input type="text" placeholder="Buscar por nome ou telefone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:flex-grow sm:max-w-[300px] p-2 border rounded-md text-sm" />
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-grow sm:max-w-[200px]">
                        <span className="text-sm font-medium whitespace-nowrap hidden md:block">Convênio</span>
                        <Select value={convenioFilter} onValueChange={setConvenioFilter}>
                            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Convênio" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Particular">Particular</SelectItem><SelectItem value="SUS">SUS</SelectItem><SelectItem value="Unimed">Unimed</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-grow sm:max-w-[150px]">
                        <span className="text-sm font-medium whitespace-nowrap hidden md:block">VIP</span>
                        <Select value={vipFilter} onValueChange={setVipFilter}>
                            <SelectTrigger className="w-full sm:w-32"><SelectValue placeholder="VIP" /></SelectTrigger>
                            <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="vip">VIP</SelectItem><SelectItem value="regular">Regular</SelectItem></SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto ml-auto sm:ml-0">
                        <Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1); }}>
                            <SelectTrigger className="w-full sm:w-[70px]"><SelectValue placeholder="10" /></SelectTrigger>
                            <SelectContent><SelectItem value="5">5</SelectItem><SelectItem value="10">10</SelectItem><SelectItem value="20">20</SelectItem></SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Loading / Erro / Conteúdo */}
                {error ? (
                    <div className="p-6 text-destructive bg-card border rounded-lg">{`Erro: ${error}`}</div>
                ) : loading ? (
                    <div className="p-6 text-center text-muted-foreground flex items-center justify-center bg-card border rounded-lg"><Loader2 className="w-6 h-6 mr-2 animate-spin text-primary" /> Carregando...</div>
                ) : (
                    <>
                        {/* LISTA MOBILE */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {currentPatients.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground bg-card rounded-lg border">Nenhum paciente encontrado.</div>
                            ) : (
                                currentPatients.map((patient) => (
                                    <div key={patient.id} className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-3 relative">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><span className="text-primary font-bold text-sm">{patient.nome?.charAt(0) || "?"}</span></div>
                                                <div>
                                                    <div className="font-semibold flex items-center gap-2">{patient.nome}{patient.vip && <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-purple-600 bg-purple-100 uppercase">VIP</span>}</div>
                                                    <div className="text-xs text-muted-foreground">{patient.convenio}</div>
                                                </div>
                                            </div>
                                            <ActionMenu patientId={String(patient.id)} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-2 pt-2 border-t">
                                            <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {patient.telefone}</div>
                                            <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {patient.cidade}</div>
                                            <div className="flex items-center gap-2 col-span-2"><Activity className="w-3 h-3" /> Última: {patient.ultimoAtendimento}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* TABELA DESKTOP */}
                        <div className="bg-card rounded-lg border shadow-md hidden md:block">
                            <div className="overflow-x-auto">
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
                                            <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum paciente encontrado</td></tr>
                                        ) : (
                                            currentPatients.map((patient) => (
                                                <tr key={patient.id} className="border-b hover:bg-muted">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><span className="text-primary font-medium text-sm">{patient.nome?.charAt(0) || "?"}</span></div>
                                                            <span className="font-medium">{patient.nome}{patient.vip && <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full text-purple-400 bg-purple-400/15">VIP</span>}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{patient.telefone}</td>
                                                    <td className="p-4 text-muted-foreground hidden md:table-cell">{`${patient.cidade} / ${patient.estado}`}</td>
                                                    <td className="p-4 text-muted-foreground hidden sm:table-cell">{patient.convenio}</td>
                                                    <td className="p-4 text-muted-foreground hidden lg:table-cell">{patient.ultimoAtendimento}</td>
                                                    <td className="p-4 text-muted-foreground hidden lg:table-cell">{patient.proximoAtendimento}</td>
                                                    <td className="p-4"><ActionMenu patientId={String(patient.id)} /></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* --- RODAPÉ DE PAGINAÇÃO --- */}
                {totalPages > 1 && !loading && (
                    <div className="py-4 px-2 border-t border-border">
                        
                        {/* 1. PAGINAÇÃO MOBILE (Simples) */}
                        <div className="flex items-center justify-between md:hidden gap-2">
                            <Button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} variant="outline" size="sm" className="min-w-[90px]">
                                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">{page} de {totalPages}</span>
                            <Button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} variant="outline" size="sm" className="min-w-[90px]">
                                Próximo <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        {/* 2. PAGINAÇÃO DESKTOP (Numerada Limitada) */}
                        <div className="hidden md:flex items-center justify-center gap-2">
                            <Button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} variant="outline" className="px-4">
                                &lt; Anterior
                            </Button>

                            {getPageNumbers().map((pageNum) => (
                                <Button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    /* CORREÇÃO AQUI: Removemos as classes manuais e usamos apenas o variant */
                                    variant={pageNum === page ? "default" : "outline"}
                                    className="w-10 h-10 p-0"
                                >
                                    {pageNum}
                                </Button>
                            ))}

                            <Button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages} variant="outline" className="px-4">
                                Próximo &gt;
                            </Button>
                        </div>
                    </div>
                )}

                {/* Dialogs */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este paciente?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => patientToDelete && handleDeletePatient(patientToDelete)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                        <AlertDialogHeader><AlertDialogTitle>Detalhes do Paciente</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>
                            {patientDetails ? (!patientDetails.error ? (
                                    <div className="grid gap-4 py-4 text-left">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div><p className="font-semibold text-xs text-muted-foreground">NOME</p><p>{patientDetails.full_name}</p></div>
                                            <div><p className="font-semibold text-xs text-muted-foreground">EMAIL</p><p className="break-all">{patientDetails.email}</p></div>
                                            <div><p className="font-semibold text-xs text-muted-foreground">TELEFONE</p><p>{patientDetails.phone_mobile}</p></div>
                                            <div><p className="font-semibold text-xs text-muted-foreground">DATA NASC.</p><p>{patientDetails.birth_date}</p></div>
                                        </div>
                                        <div className="border-t pt-4"><p className="font-semibold text-primary mb-2">Endereço</p><p>{patientDetails.street}, {patientDetails.number}</p><p>{patientDetails.cidade}/{patientDetails.estado}</p></div>
                                    </div>
                                ) : <p className="text-destructive">{patientDetails.error}</p>) : <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />}
                        </AlertDialogDescription>
                        <AlertDialogFooter><AlertDialogCancel>Fechar</AlertDialogCancel></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Sidebar>
    );
}