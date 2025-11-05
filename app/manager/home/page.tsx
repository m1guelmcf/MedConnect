"use client";

// -> ADICIONADO: useMemo para otimizar a criação da lista de especialidades
import React, { useEffect, useState, useCallback, useMemo } from "react"
import ManagerLayout from "@/components/manager-layout";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Eye, Calendar, Filter, MoreVertical, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { doctorsService } from "services/doctorsApi.mjs";


interface Doctor {
  id: number;
  full_name: string;
  specialty: string;
  crm: string;
  phone_mobile: string | null;
  city: string | null;
  state: string | null;
  // -> ADICIONADO: Campo 'status' para que o filtro funcione. Sua API precisa retornar este dado.
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

  // -> PASSO 1: Criar estados para os filtros
  const [specialtyFilter, setSpecialtyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");


  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Doctor[] = await doctorsService.list();
      // Exemplo: Adicionando um status fake para o filtro funcionar. O ideal é que isso venha da API.
      const dataWithStatus = data.map((doc, index) => ({
        ...doc,
        status: index % 3 === 0 ? "Inativo" : index % 2 === 0 ? "Férias" : "Ativo"
      }));
      setDoctors(dataWithStatus || []);
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
      status: doctor.status || "Ativo", // Usa o status do médico
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


  const handleEdit = (doctorId: number) => {
    router.push(`/manager/home/${doctorId}/editar`);
  };

  // -> MELHORIA: Gera a lista de especialidades dinamicamente
  const uniqueSpecialties = useMemo(() => {
    const specialties = doctors.map(doctor => doctor.specialty).filter(Boolean);
    return [...new Set(specialties)];
  }, [doctors]);

  // -> PASSO 3: Aplicar a lógica de filtragem
  const filteredDoctors = doctors.filter(doctor => {
    const specialtyMatch = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
    const statusMatch = statusFilter === "all" || doctor.status === statusFilter;
    return specialtyMatch && statusMatch;
  });


  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Médicos Cadastrados</h1>
            <p className="text-sm text-gray-500">Gerencie todos os profissionais de saúde.</p>
          </div>
          <Link href="/manager/home/novo">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Novo
            </Button>
          </Link>
        </div>


        {/* -> PASSO 2: Conectar os estados aos componentes Select <- */}
        <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-foreground">Especialidades</span>
          <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueSpecialties.map(specialty => (
                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm font-medium text-foreground">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Ativo">Ativo</SelectItem>
              <SelectItem value="Férias">Férias</SelectItem>
              <SelectItem value="Inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="ml-auto w-full md:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filtro avançado
          </Button>
        </div>


        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-green-600" />
              Carregando médicos...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
            // -> Atualizado para usar a lista filtrada
          ) : filteredDoctors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {doctors.length === 0
                ? <>Nenhum médico cadastrado. <Link href="/manager/home/novo" className="text-green-600 hover:underline">Adicione um novo</Link>.</>
                : "Nenhum médico encontrado com os filtros aplicados."
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRM</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/Estado</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* -> ATUALIZADO para mapear a lista filtrada */}
                  {filteredDoctors.map((doctor) => (
                    <tr key={doctor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.crm}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                      {/* Coluna de Status adicionada para visualização */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.phone_mobile || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(doctor.city || doctor.state) ? `${doctor.city || ''}${doctor.city && doctor.state ? '/' : ''}${doctor.state || ''}` : "N/A"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="text-blue-600">Ações</div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetailsDialog(doctor)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(doctor.id)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-700"
                              onClick={() => openDeleteDialog(doctor.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
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

        {/* ... O resto do seu código (AlertDialogs) permanece o mesmo ... */}
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
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">{doctorDetails?.nome}</AlertDialogTitle>
              <AlertDialogDescription className="text-left text-gray-700">
                {doctorDetails && (
                  <div className="space-y-3 text-left">
                    <h3 className="font-semibold mt-2">Informações Principais</h3>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
                      <div><strong>CRM:</strong> {doctorDetails.crm}</div>
                      <div><strong>Especialidade:</strong> {doctorDetails.especialidade}</div>
                      <div><strong>Celular:</strong> {doctorDetails.contato.celular || 'N/A'}</div>
                      <div><strong>Localização:</strong> {`${doctorDetails.endereco.cidade || 'N/A'}/${doctorDetails.endereco.estado || 'N/A'}`}</div>
                    </div>

                    <h3 className="font-semibold mt-4">Atendimento e Convênio</h3>
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm">
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
    </ManagerLayout>
  );
}