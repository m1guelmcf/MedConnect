"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { Plus, Edit, Trash2, Eye, Calendar, Filter } from "lucide-react";
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

// --- INÍCIO DA MODIFICAÇÃO ---
// PASSO 1: Criar uma função para formatar a data
const formatDate = (dateString: string | null | undefined): string => {
    // Se a data não existir, retorna um texto padrão
    if (!dateString) {
        return "N/A";
    }

    try {
        const date = new Date(dateString);
        // Verifica se a data é válida após a conversão
        if (isNaN(date.getTime())) {
            return "Data inválida";
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é base 0, então +1
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
        // Se houver qualquer erro na conversão, retorna um texto de erro
        return "Data inválida";
    }
};
// --- FIM DA MODIFICAÇÃO ---


export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [convenioFilter, setConvenioFilter] = useState("all");
  const [vipFilter, setVipFilter] = useState("all");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
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

  const fetchPacientes = useCallback(
    async (pageToFetch: number) => {
      if (isFetching || !hasNext) return;
      setIsFetching(true);
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
          convenio: p.convenio ?? "", // se não existir, fica vazio
          status: p.status ?? undefined,
        }));

        setPatients((prev) => {
          const all = [...prev, ...mapped];
          const unique = Array.from(
            new Map(all.map((p) => [p.id, p])).values()
          );
          return unique;
        });

        if (!mapped.id) setHasNext(false); // parar carregamento
        else setPage((prev) => prev + 1);
      } catch (e: any) {
        setError(e?.message || "Erro ao buscar pacientes");
      } finally {
        setIsFetching(false);
      }
    },
    [isFetching, hasNext]
  );

  useEffect(() => {
    fetchPacientes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!observerRef.current || !hasNext) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetching && hasNext) {
        fetchPacientes(page);
      }
    });
    observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [fetchPacientes, page, hasNext, isFetching]);

  const handleDeletePatient = async (patientId: string) => {
    // Remove from current list (client-side deletion)
    try {
      const res = await patientsService.delete(patientId);

      if (res) {
        alert(`${res.error} ${res.message}`);
      }

      setPatients((prev) =>
        prev.filter((p) => String(p.id) !== String(patientId))
      );
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
              <Button className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 bg-card p-4 rounded-lg border border-border">
          {/* Convênio */}
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
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-foreground">
              Aniversariantes
            </span>
            <Select>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
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
                        {error ? (
                            <div className="p-6 text-red-600">{`Erro ao carregar pacientes: ${error}`}</div>
                        ) : (
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Nome</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Telefone</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Cidade</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Estado</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Último atendimento</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Próximo atendimento</th>
                                        <th className="text-left p-2 md:p-4 font-medium text-gray-700">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-8 text-center text-gray-500">
                                                {patients.length === 0 ? "Nenhum paciente cadastrado" : "Nenhum paciente encontrado com os filtros aplicados"}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
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
                                                <td className="p-4 text-gray-600">{patient.estado}</td>
                                                {/* --- INÍCIO DA MODIFICAÇÃO --- */}
                                                {/* PASSO 2: Aplicar a formatação de data na tabela */}
                                                <td className="p-4 text-gray-600">{formatDate(patient.ultimoAtendimento)}</td>
                                                <td className="p-4 text-gray-600">{formatDate(patient.proximoAtendimento)}</td>
                                                {/* --- FIM DA MODIFICAÇÃO --- */}
                                                <td className="p-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <div className="text-blue-600 cursor-pointer">Ações</div>
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
                        <div ref={observerRef} style={{ height: 1 }} />
                        {isFetching && <div className="p-4 text-center text-gray-500">Carregando mais pacientes...</div>}
                    </div>
                </div>

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

                {/* Modal de detalhes do paciente */}
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
                                        <p>
                                            <strong>Nome:</strong> {patientDetails.full_name}
                                        </p>
                                        <p>
                                            <strong>CPF:</strong> {patientDetails.cpf}
                                        </p>
                                        <p>
                                            <strong>Email:</strong> {patientDetails.email}
                                        </p>
                                        <p>
                                            <strong>Telefone:</strong> {patientDetails.phone_mobile ?? patientDetails.phone1 ?? patientDetails.phone2 ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Nome social:</strong> {patientDetails.social_name ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Sexo:</strong> {patientDetails.sex ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Tipo sanguíneo:</strong> {patientDetails.blood_type ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Peso:</strong> {patientDetails.weight_kg ?? "-"}
                                            {patientDetails.weight_kg ? "kg" : ""}
                                        </p>
                                        <p>
                                            <strong>Altura:</strong> {patientDetails.height_m ?? "-"}
                                            {patientDetails.height_m ? "m" : ""}
                                        </p>
                                        <p>
                                            <strong>IMC:</strong> {patientDetails.bmi ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Endereço:</strong> {patientDetails.street ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Bairro:</strong> {patientDetails.neighborhood ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Cidade:</strong> {patientDetails.city ?? "-"}
                                        </p>
                                        <p>
                                            <strong>Estado:</strong> {patientDetails.state ?? "-"}
                                        </p>
                                        <p>
                                            <strong>CEP:</strong> {patientDetails.cep ?? "-"}
                                        </p>
                                        {/* --- INÍCIO DA MODIFICAÇÃO --- */}
                                        {/* PASSO 3: Aplicar a formatação de data no modal */}
                                        <p>
                                            <strong>Criado em:</strong> {formatDate(patientDetails.created_at)}
                                        </p>
                                        <p>
                                            <strong>Atualizado em:</strong> {formatDate(patientDetails.updated_at)}
                                        </p>
                                        {/* --- FIM DA MODIFICAÇÃO --- */}
                                        <p>
                                            <strong>Id:</strong> {patientDetails.id ?? "-"}
                                        </p>
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