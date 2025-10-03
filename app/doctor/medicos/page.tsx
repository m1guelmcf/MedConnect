"use client";

import { useEffect, useState } from "react";
import DoctorLayout from "@/components/doctor-layout";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Calendar, Trash2 } from "lucide-react";
import { api } from "@/services/api.mjs";
import { PatientDetailsModal } from "@/components/ui/patient-details-modal";

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

  const handleOpenModal = (patient: Paciente) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPatient(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pacientes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    async function fetchPacientes() {
      try {
        setLoading(true);
        setError(null);
        const json = await api.get("/rest/v1/patients");
        const items = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);

        const mapped = items.map((p: any) => ({
          id: String(p.id ?? ""),
          nome: p.full_name ?? "",
          telefone: p.phone_mobile ?? "",
          cidade: p.city ?? "",
          estado: p.state ?? "",
          ultimoAtendimento: formatDate(p.created_at) ?? "",
          proximoAtendimento: "",
          email: p.email ?? "",
          birth_date: p.birth_date ?? "",
          cpf: p.cpf ?? "",
          blood_type: p.blood_type ?? "",
          weight_kg: p.weight_kg ?? 0,
          height_m: p.height_m ?? 0,
          street: p.street ?? "",
          number: p.number ?? "",
          complement: p.complement ?? "",
          neighborhood: p.neighborhood ?? "",
          cep: p.cep ?? "",
        }));

        setPacientes(mapped);
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar pacientes");
      } finally {
        setLoading(false);
      }
    }
    fetchPacientes();
  }, []);

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600">Lista de pacientes vinculados</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-700">Nome</th>
                  <th className="text-left p-4 font-medium text-gray-700">Telefone</th>
                  <th className="text-left p-4 font-medium text-gray-700">Cidade</th>
                  <th className="text-left p-4 font-medium text-gray-700">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-700">Último atendimento</th>
                  <th className="text-left p-4 font-medium text-gray-700">Próximo atendimento</th>
                  <th className="text-left p-4 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-gray-600">
                      Carregando pacientes...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-red-600">{`Erro: ${error}`}</td>
                  </tr>
                ) : pacientes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      Nenhum paciente encontrado
                    </td>
                  </tr>
                ) : (
                  currentItems.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">{p.nome}</td>
                      <td className="p-4 text-gray-600">{p.telefone}</td>
                      <td className="p-4 text-gray-600">{p.cidade}</td>
                      <td className="p-4 text-gray-600">{p.estado}</td>
                      <td className="p-4 text-gray-600">{p.ultimoAtendimento}</td>
                      <td className="p-4 text-gray-600">{p.proximoAtendimento}</td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="text-blue-600 hover:underline">Ações</button>
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
                            <DropdownMenuItem onClick={() => alert(`Agenda para paciente ID: ${p.id}`)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Ver agenda
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const newPacientes = pacientes.filter((pac) => pac.id !== p.id)
                                setPacientes(newPacientes)
                                alert(`Paciente ID: ${p.id} excluído`)
                              }}
                              className="text-red-600">
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
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: Math.ceil(pacientes.length / itemsPerPage) }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-4 py-2 rounded-md ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </DoctorLayout>
  );
}