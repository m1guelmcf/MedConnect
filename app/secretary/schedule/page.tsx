"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User } from "lucide-react"; // Importações que você já tinha
import { patientsService } from "@/services/patientsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { toast } from "sonner"; // Para notificações
import Sidebar from "@/components/Sidebar";

export default function ScheduleAppointment() {
    const router = useRouter();
    const [patients, setPatients] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Estados de loading e error para feedback visual e depuração
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados do formulário
    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [appointmentType, setAppointmentType] = useState("presencial");
    const [durationMinutes, setDurationMinutes] = useState("30");
    const [chiefComplaint, setChiefComplaint] = useState("");
    const [patientNotes, setPatientNotes] = useState("");
    const [internalNotes, setInternalNotes] = useState("");
    const [insuranceProvider, setInsuranceProvider] = useState("");

    const availableTimes = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];

    // --- NOVO/ATUALIZADO useEffect COM LOGS PARA DEPURAR ---
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null); // Limpa qualquer erro anterior ao iniciar uma nova busca

            const results = await Promise.allSettled([
                patientsService.list(),
                doctorsService.list(),
                usersService.getMe()
            ]);

            const [patientResult, doctorResult, userResult] = results;
            let hasFetchError = false; // Flag para saber se houve algum erro geral

            // Checar pacientes
            if (patientResult.status === 'fulfilled') {
                setPatients(patientResult.value || []);
                console.log("Pacientes carregados com sucesso:", patientResult.value);
            } else {
                console.error("ERRO AO CARREGAR PACIENTES:", patientResult.reason);
                hasFetchError = true;
                toast.error("Erro ao carregar lista de pacientes."); // Notificação para o usuário
            }

            // Checar médicos
            if (doctorResult.status === 'fulfilled') {
                setDoctors(doctorResult.value || []);
                console.log("Médicos carregados com sucesso:", doctorResult.value); // <-- CRÍTICO PARA DEPURAR
            } else {
                console.error("ERRO AO CARREGAR MÉDICOS:", doctorResult.reason);
                hasFetchError = true;
                setError("Falha ao carregar médicos."); // Define o erro para ser exibido no dropdown
                toast.error("Erro ao carregar lista de médicos."); // Notificação para o usuário
            }

            // Checar usuário logado
            if (userResult.status === 'fulfilled' && userResult.value?.user?.id) {
                setCurrentUserId(userResult.value.user.id);
                console.log("ID do usuário logado carregado:", userResult.value.user.id);
            } else {
                const reason = userResult.status === 'rejected' ? userResult.reason : "API não retornou um ID de usuário.";
                console.error("ERRO AO CARREGAR USUÁRIO:", reason);
                hasFetchError = true;
                toast.error("Não foi possível identificar o usuário logado. Por favor, faça login novamente."); // Notificação
                // Não definimos setError aqui, pois um erro no usuário não impede a renderização de médicos/pacientes
            }

            // Se houve qualquer erro na busca, defina uma mensagem geral de erro se não houver uma mais específica.
            if (hasFetchError && !error) { // Se 'error' já foi definido por um problema específico, mantenha-o.
                setError("Alguns dados não puderam ser carregados. Verifique o console.");
            }

            setLoading(false); // Finaliza o estado de carregamento
            console.log("Estado de carregamento finalizado:", false);
        };

        fetchInitialData();
    }, []); // O array de dependências vazio significa que ele roda apenas uma vez após a montagem inicial

    // --- LOGS PARA VERIFICAR OS ESTADOS ANTES DA RENDERIZAÇÃO ---
    console.log("Estado 'loading' no render:", loading);
    console.log("Estado 'error' no render:", error);
    console.log("Conteúdo de 'doctors' no render:", doctors);
    console.log("Número de médicos em 'doctors':", doctors.length);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Botão de submit clicado!"); // Log para confirmar que o clique funciona

        if (!currentUserId) {
            toast.error("Sessão de usuário inválida. Por favor, faça login novamente.");
            return;
        }

        if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) {
            toast.error("Paciente, médico, data e horário são obrigatórios.");
            return;
        }

        try {
            const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00Z`).toISOString();

            const newAppointmentData = {
                patient_id: selectedPatient,
                doctor_id: selectedDoctor,
                scheduled_at: scheduledAt,
                duration_minutes: parseInt(durationMinutes, 10),
                appointment_type: appointmentType,
                status: "requested",
                chief_complaint: chiefComplaint || null,
                patient_notes: patientNotes || null,
                notes: internalNotes || null,
                insurance_provider: insuranceProvider || null,
                created_by: currentUserId,
            };

            console.log("🚀 Enviando os seguintes dados para a API:", newAppointmentData);

            // A chamada para a API de criação
            await appointmentsService.create(newAppointmentData);

            toast.success("Consulta agendada com sucesso!");
            router.push("/secretary/appointments");
        } catch (error) {
            console.error("❌ Erro ao criar agendamento:", error);
            toast.error("Ocorreu um erro ao agendar a consulta. Verifique o console.");
        }
    };
    return (
        <Sidebar>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agendar Consulta</h1>
                    <p className="text-gray-600">Preencha os detalhes para criar um novo agendamento</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados da Consulta</CardTitle>
                                <CardDescription>Preencha as informações para agendar a consulta</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="patient">Paciente</Label>
                                        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um paciente" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loading ? (
                                                    <SelectItem value="loading-patients" disabled>Carregando pacientes...</SelectItem>
                                                ) : error && patients.length === 0 ? ( // Se erro e não há pacientes
                                                    <SelectItem value="error-patients" disabled>Erro ao carregar pacientes</SelectItem>
                                                ) : patients.length === 0 ? ( // Se não há erro mas a lista está vazia
                                                    <SelectItem value="no-patients" disabled>Nenhum paciente encontrado</SelectItem>
                                                ) : (
                                                    patients.map((p) => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.full_name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="doctor">Médico</Label>
                                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um médico" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Lógica condicional para o estado de carregamento, erro ou lista vazia */}
                                                {loading ? (
                                                    <SelectItem value="loading" disabled>Carregando médicos...</SelectItem>
                                                ) : error && doctors.length === 0 ? ( // Se há erro E a lista de médicos está vazia
                                                    <SelectItem value="error" disabled>Erro ao carregar médicos</SelectItem>
                                                ) : doctors.length === 0 ? ( // Se não há erro mas a lista está vazia
                                                    <SelectItem value="no-doctors" disabled>Nenhum médico encontrado</SelectItem>
                                                ) : (
                                                    doctors.map((d) => (
                                                        <SelectItem key={d.id} value={d.id}>
                                                            {d.full_name} - {d.specialty}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* O restante do formulário permanece o mesmo */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Data</Label>
                                            <Input
                                                id="date"
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]} // Garante que a data mínima é hoje
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="time">Horário</Label>
                                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um horário" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTimes.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="appointmentType">Tipo de Consulta</Label>
                                            <Select value={appointmentType} onValueChange={setAppointmentType}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="presencial">Presencial</SelectItem>
                                                    <SelectItem value="telemedicina">Telemedicina</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duração (minutos)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={durationMinutes}
                                                onChange={(e) => setDurationMinutes(e.target.value)}
                                                placeholder="Ex: 30"
                                                min="1" // Duração mínima
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="insurance">Convênio (opcional)</Label>
                                        <Input
                                            id="insurance"
                                            placeholder="Nome do convênio do paciente"
                                            value={insuranceProvider}
                                            onChange={(e) => setInsuranceProvider(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chiefComplaint">Queixa Principal (opcional)</Label>
                                        <Textarea
                                            id="chiefComplaint"
                                            placeholder="Descreva brevemente o motivo da consulta..."
                                            value={chiefComplaint}
                                            onChange={(e) => setChiefComplaint(e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="patientNotes">Observações do Paciente (opcional)</Label>
                                        <Textarea
                                            id="patientNotes"
                                            placeholder="Anotações relevantes informadas pelo paciente..."
                                            value={patientNotes}
                                            onChange={(e) => setPatientNotes(e.target.value)}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="internalNotes">Observações Internas (opcional)</Label>
                                        <Textarea
                                            id="internalNotes"
                                            placeholder="Anotações para a equipe da clínica..."
                                            value={internalNotes}
                                            onChange={(e) => setInternalNotes(e.target.value)}
                                            rows={2}
                                        />
                                    </div>

                                    <Button
    type="submit"
    className="w-full"
    // Remova temporariamente '|| !currentUserId || loading' para testar
    disabled={!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime /* || !currentUserId || loading */}
>
    Agendar Consulta
</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Card de Resumo e Informações Importantes (se houver, adicione aqui) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Rápidas</CardTitle>
                                <CardDescription>Ajuda e status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {loading && (
                                    <p className="text-sm text-blue-600 flex items-center"><Clock className="mr-2 h-4 w-4" /> Carregando dados iniciais...</p>
                                )}
                                {error && (
                                    <p className="text-sm text-red-600 flex items-center">
                                        <User className="mr-2 h-4 w-4" /> {error}
                                    </p>
                                )}
                                {!currentUserId && !loading && (
                                    <p className="text-sm text-red-600 flex items-center"><User className="mr-2 h-4 w-4" /> Usuário não identificado. Recarregue a página.</p>
                                )}
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" /> Selecione uma data e horário válidos.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Sidebar>
    );
}