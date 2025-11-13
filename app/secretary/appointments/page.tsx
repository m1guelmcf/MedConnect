"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Calendar, Clock, MapPin, Phone, User, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { patientsService } from "@/services/patientsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function SecretaryAppointments() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

    // Estados dos Modais
    const [deleteModal, setDeleteModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    // Estado para o formulário de edição
    const [editFormData, setEditFormData] = useState({
        date: "",
        time: "",
        status: "",
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. DEFINIR O PARÂMETRO DE ORDENAÇÃO
            // 'scheduled_at.desc' ordena pela data do agendamento, em ordem descendente (mais recentes primeiro).
            const queryParams = 'order=scheduled_at.desc';

            const [appointmentList, patientList, doctorList] = await Promise.all([
                // 2. USAR A FUNÇÃO DE BUSCA COM O PARÂMETRO DE ORDENAÇÃO
                appointmentsService.search_appointment(queryParams),
                patientsService.list(),
                doctorsService.list(),
            ]);

            const patientMap = new Map(patientList.map((p: any) => [p.id, p]));
            const doctorMap = new Map(doctorList.map((d: any) => [d.id, d]));

            const enrichedAppointments = appointmentList.map((apt: any) => ({
                ...apt,
                patient: patientMap.get(apt.patient_id) || { full_name: "Paciente não encontrado" },
                doctor: doctorMap.get(apt.doctor_id) || { full_name: "Médico não encontrado", specialty: "N/A" },
            }));

            setAppointments(enrichedAppointments);
        } catch (error) {
            console.error("Falha ao buscar agendamentos:", error);
            toast.error("Não foi possível carregar a lista de agendamentos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Array vazio garante que a busca ocorra apenas uma vez, no carregamento da página.

    // --- LÓGICA DE EDIÇÃO ---
    const handleEdit = (appointment: any) => {
        setSelectedAppointment(appointment);
        const appointmentDate = new Date(appointment.scheduled_at);

        setEditFormData({
            date: appointmentDate.toISOString().split('T')[0],
            time: appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }),
            status: appointment.status,
        });
        setEditModal(true);
    };

    const confirmEdit = async () => {
        if (!selectedAppointment || !editFormData.date || !editFormData.time || !editFormData.status) {
            toast.error("Todos os campos são obrigatórios para a edição.");
            return;
        }

        try {
            const newScheduledAt = new Date(`${editFormData.date}T${editFormData.time}:00Z`).toISOString();
            const updatePayload = {
                scheduled_at: newScheduledAt,
                status: editFormData.status,
            };

            await appointmentsService.update(selectedAppointment.id, updatePayload);

            // 3. RECARREGAR OS DADOS APÓS A EDIÇÃO
            // Isso garante que a lista permaneça ordenada corretamente se a data for alterada.
            fetchData(); 
            
            setEditModal(false);
            toast.success("Consulta atualizada com sucesso!");

        } catch (error) {
            console.error("Erro ao atualizar consulta:", error);
            toast.error("Não foi possível atualizar a consulta.");
        }
    };

    // --- LÓGICA DE DELEÇÃO ---
    const handleDelete = (appointment: any) => {
        setSelectedAppointment(appointment);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedAppointment) return;
        try {
            await appointmentsService.delete(selectedAppointment.id);
            setAppointments((prev) => prev.filter((apt) => apt.id !== selectedAppointment.id));
            setDeleteModal(false);
            toast.success("Consulta deletada com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar consulta:", error);
            toast.error("Não foi possível deletar a consulta.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "requested": return <Badge className="bg-yellow-100 text-yellow-800">Solicitada</Badge>;
            case "confirmed": return <Badge className="bg-blue-100 text-blue-800">Confirmada</Badge>;
            case "checked_in": return <Badge className="bg-indigo-100 text-indigo-800">Check-in</Badge>;
            case "completed": return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
            case "cancelled": return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
            case "no_show": return <Badge className="bg-gray-100 text-gray-800">Não Compareceu</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
    const appointmentStatuses = ["requested", "confirmed", "checked_in", "completed", "cancelled", "no_show"];

    return (
        <Sidebar>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Consultas Agendadas</h1>
                        <p className="text-gray-600">Gerencie as consultas dos pacientes</p>
                    </div>
                    <Link href="/secretary/schedule">
                        <Button><Calendar className="mr-2 h-4 w-4" /> Agendar Nova Consulta</Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    {isLoading ? <p>Carregando consultas...</p> : appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{appointment.doctor.full_name}</CardTitle>
                                            <CardDescription>{appointment.doctor.specialty}</CardDescription>
                                        </div>
                                        {getStatusBadge(appointment.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-800 font-medium">
                                                <User className="mr-2 h-4 w-4 text-gray-600" />
                                                {appointment.patient.full_name}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                {new Date(appointment.scheduled_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="mr-2 h-4 w-4" />
                                                {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', timeZone: "UTC" })}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {appointment.doctor.location || "Local a definir"}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="mr-2 h-4 w-4" />
                                                {appointment.doctor.phone || "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(appointment)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar
                                        </Button>
                                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent" onClick={() => handleDelete(appointment)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Deletar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p>Nenhuma consulta encontrada.</p>
                    )}
                </div>
            </div>

            {/* MODAL DE EDIÇÃO */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                {/* ... (código do modal de edição) ... */}
            </Dialog>

            {/* Modal de Deleção */}
            <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
                {/* ... (código do modal de deleção) ... */}
            </Dialog>
        </Sidebar>
    );
}