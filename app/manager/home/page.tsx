"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Eye, Calendar, Filter, Loader2 } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { doctorsService } from "services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";


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
    }
    endereco: {
        cidade?: string;
        estado?: string;
    }
    convenio?: string;
    vip?: boolean;
    status?: string;
    ultimo_atendimento?: string;
    proximo_atendimento?: string;
    error?: string;
}

export default function DoctorsPage() {
    const router = useRouter();

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [doctorDetails, setDoctorDetails] = useState<DoctorDetails | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDeleteId, setDoctorToDeleteId] = useState<number | null>(null);

    // --- Estados para Filtros ---
    const [specialtyFilter, setSpecialtyFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- Estados para Paginação ---
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: Doctor[] = await doctorsService.list();
            const dataWithStatus = data.map((doc, index) => ({
                ...doc,
                status: index % 3 === 0 ? "Inativo" : index % 2 === 0 ? "Férias" : "Ativo"
            }));
            setDoctors(dataWithStatus || []);
            setCurrentPage(1);
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


    const openDetailsDialog = async (doctor: Doctor) => {
        setDetailsDialogOpen(true);
        setDoctorDetails({
            nome: doctor.full_name,
            crm: doctor.crm,
            especialidade: doctor.specialty,
            contato: { celular: doctor.phone_mobile ?? undefined },
            endereco: { cidade: doctor.city ?? undefined, estado: doctor.state ?? undefined },
            status: doctor.status || "Ativo",
            convenio: "Particular",
            vip: false,
            ultimo_atendimento: "N/A",
            proximo_atendimento: "N/A",
        });
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

    const openDeleteDialog = (doctorId: number) => {
        setDoctorToDeleteId(doctorId);
        setDeleteDialogOpen(true);
    };

    const uniqueSpecialties = useMemo(() => {
        const specialties = doctors.map(doctor => doctor.specialty).filter(Boolean);
        return [...new Set(specialties)];
    }, [doctors]);

    const filteredDoctors = doctors.filter(doctor => {
        const specialtyMatch = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
        const statusMatch = statusFilter === "all" || doctor.status === statusFilter;
        return specialtyMatch && statusMatch;
    });

    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
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


    return (
        <Sidebar>
            <div className="space-y-6 px-2 sm:px-4 md:px-6">

                {/* Cabeçalho */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Médicos Cadastrados</h1>
                        <p className="text-sm text-gray-500">Gerencie todos os profissionais de saúde.</p>
                    </div>
                </div>


                {/* Filtros e Itens por Página */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-foreground">
                            Especialidade
                        </span>
                        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                            <SelectTrigger className="w-[160px] sm:w-[180px]">
                                <SelectValue placeholder="Especialidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {uniqueSpecialties.map(specialty => (
                                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-foreground">
                            Status
                        </span>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] sm:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Férias">Férias</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <span className="text-sm font-medium text-foreground">
                            Itens por página
                        </span>
                        <Select
                            onValueChange={handleItemsPerPageChange}
                            defaultValue={String(itemsPerPage)}>
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


                {/* Tabela de Médicos */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
                            Carregando médicos...
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-600">{error}</div>
                    ) : filteredDoctors.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {doctors.length === 0
                                ? <>Nenhum médico cadastrado. <Link href="/manager/home/novo" className="text-green-600 hover:underline">Adicione um novo</Link>.</>
                                : "Nenhum médico encontrado com os filtros aplicados."
                            }
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Nome</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">CRM</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Especialidade</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Status</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Cidade/Estado</th>
                                        <th className="text-right p-4 font-medium text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentItems.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium text-gray-900">{doctor.full_name}</td>
                                            <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{doctor.crm}</td>
                                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{doctor.specialty}</td>
                                            <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{doctor.status || "N/A"}</td>
                                            <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">
                                                {(doctor.city || doctor.state)
                                                    ? `${doctor.city || ""}${doctor.city && doctor.state ? '/' : ''}${doctor.state || ""}`
                                                    : "N/A"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {/* ===== INÍCIO DA ALTERAÇÃO ===== */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <div className="text-blue-600 cursor-pointer inline-block">Ações</div>
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
                                                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(doctor.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                {/* ===== FIM DA ALTERAÇÃO ===== */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Paginação */}
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

                {/* Dialogs de Exclusão e Detalhes */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirma a exclusão?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação é irreversível e excluirá permanentemente o registro deste médico.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                    <AlertDialogContent className="max-w-[95%] sm:max-w-lg">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl">{doctorDetails?.nome}</AlertDialogTitle>
                            <AlertDialogDescription className="text-left text-gray-700">
                                {doctorDetails && (
                                    <div className="space-y-3 text-left">
                                        <h3 className="font-semibold mt-2">Informações Principais</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                            <div><strong>CRM:</strong> {doctorDetails.crm}</div>
                                            <div><strong>Especialidade:</strong> {doctorDetails.especialidade}</div>
                                            <div><strong>Celular:</strong> {doctorDetails.contato.celular || 'N/A'}</div>
                                            <div><strong>Localização:</strong> {`${doctorDetails.endereco.cidade || 'N/A'}/${doctorDetails.endereco.estado || 'N/A'}`}</div>
                                        </div>

                                        <h3 className="font-semibold mt-4">Atendimento e Convênio</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                                            <div><strong>Convênio:</strong> {doctorDetails.convenio || 'N/A'}</div>
                                            <div><strong>VIP:</strong> {doctorDetails.vip ? "Sim" : "Não"}</div>
                                            <div><strong>Status:</strong> {doctorDetails.status || 'N/A'}</div>
                                            <div><strong>Último atendimento:</strong> {doctorDetails.ultimo_atendimento || 'N/A'}</div>
                                            <div><strong>Próximo atendimento:</strong> {doctorDetails.proximo_atendimento || 'N/A'}</div>
                                        </div>
                                    </div>
                                )}
                                {doctorDetails === null && !loading && (
                                    <div className="text-red-600">Detalhes não disponíveis.</div>
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