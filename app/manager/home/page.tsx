"use client";

import React, { useEffect, useState, useCallback } from "react"
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
  
 

  
  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      
      const data: Doctor[] = await doctorsService.list();
      setDoctors(data || []); 
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
        contato: {
            celular: doctor.phone_mobile ?? undefined,
            telefone1: undefined 
        },
        endereco: {
            cidade: doctor.city ?? undefined,
            estado: doctor.state ?? undefined,
        },
      
        convenio: "Particular", 
        vip: false, 
        status: "Ativo",
        ultimo_atendimento: "N/A",
        proximo_atendimento: "N/A",
    });
  };

 
  const handleDelete = async () => {
    if (doctorToDeleteId === null) return;

    setLoading(true);
    try {
      await doctorsService.delete(doctorToDeleteId);
     
      console.log(`Médico com ID ${doctorToDeleteId} excluído com sucesso!`);

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


  return (
    <ManagerLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Médicos Cadastrados</h1>
          <p className="text-sm text-gray-500">Gerencie todos os profissionais de saúde.</p>
        </div>
      </div>

      
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
        <Filter className="w-5 h-5 text-gray-400" />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cardiologia">Cardiologia</SelectItem>
            <SelectItem value="dermatologia">Dermatologia</SelectItem>
            <SelectItem value="pediatria">Pediatria</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="ferias">Férias</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
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
        ) : doctors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
                Nenhum médico cadastrado. <Link href="/manager/home/novo" className="text-green-600 hover:underline">Adicione um novo</Link>.
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CRM</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Celular</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade/Estado</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.full_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.crm}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.phone_mobile || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(doctor.city || doctor.state) ? `${doctor.city || ''}${doctor.city && doctor.state ? '/' : ''}${doctor.state || ''}` : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      
                      <div className="flex justify-end space-x-1">
                         
                          <Button variant="outline" size="icon" onClick={() => openDetailsDialog(doctor)} title="Visualizar Detalhes">
                              <Eye className="h-4 w-4" />
                          </Button>
                         
                          <Button variant="outline" size="icon" onClick={() => handleEdit(doctor.id)} title="Editar">
                              <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                         
                          <Button variant="outline" size="icon" onClick={() => openDeleteDialog(doctor.id)} title="Excluir">
                              <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                          
                          
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0" title="Mais Ações">
                                      <span className="sr-only">Mais Ações</span>
                                      <MoreVertical className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                      <Calendar className="mr-2 h-4 w-4" />
                                      Agendar Consulta
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      
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
                {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
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
