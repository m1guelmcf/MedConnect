"use client";

import type React from "react";
import { useState, useEffect } from "react";
import DoctorLayout from "@/components/doctor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar as CalendarIcon, MapPin, Phone, User, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// IMPORTAR O COMPONENTE CALENDÁRIO DA SHADCN
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns"; // Usaremos o date-fns para formatação e comparação de datas

const APPOINTMENTS_STORAGE_KEY = "clinic-appointments";

// --- TIPAGEM DA CONSULTA SALVA NO LOCALSTORAGE ---
interface LocalStorageAppointment {
    id: number;
    patientName: string;
    doctor: string;
    specialty: string;
    date: string; // Data no formato YYYY-MM-DD
    time: string; // Hora no formato HH:MM
    status: "agendada" | "confirmada" | "cancelada" | "realizada";
    location: string;
    phone: string;
}

const LOGGED_IN_DOCTOR_NAME = "Dr. João Santos";

// Função auxiliar para comparar se duas datas (Date objects) são o mesmo dia
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

// --- COMPONENTE PRINCIPAL ---

export default function DoctorAppointmentsPage() {
    const [allAppointments, setAllAppointments] = useState<LocalStorageAppointment[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<LocalStorageAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // NOVO ESTADO 1: Armazena os dias com consultas (para o calendário)
    const [bookedDays, setBookedDays] = useState<Date[]>([]);

    // NOVO ESTADO 2: Armazena a data selecionada no calendário
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        loadAppointments();
    }, []);

    // Efeito para filtrar a lista sempre que o calendário ou a lista completa for atualizada
    useEffect(() => {
        if (selectedCalendarDate) {
            const dateString = format(selectedCalendarDate, 'yyyy-MM-dd');

            // Filtra a lista completa de agendamentos pela data selecionada
            const todayAppointments = allAppointments
                .filter(app => app.date === dateString)
                .sort((a, b) => a.time.localeCompare(b.time)); // Ordena por hora

            setFilteredAppointments(todayAppointments);
        } else {
            // Se nenhuma data estiver selecionada (ou se for limpa), mostra todos (ou os de hoje)
            const todayDateString = format(new Date(), 'yyyy-MM-dd');
            const todayAppointments = allAppointments
                .filter(app => app.date === todayDateString)
                .sort((a, b) => a.time.localeCompare(b.time));

            setFilteredAppointments(todayAppointments);
        }
    }, [allAppointments, selectedCalendarDate]);

    const loadAppointments = () => {
        setIsLoading(true);
        try {
            const storedAppointmentsRaw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
            const allAppts: LocalStorageAppointment[] = storedAppointmentsRaw ? JSON.parse(storedAppointmentsRaw) : [];

            // ***** NENHUM FILTRO POR MÉDICO AQUI (Como solicitado) *****
            const appointmentsToShow = allAppts;

            // 1. EXTRAI E PREPARA AS DATAS PARA O CALENDÁRIO
            const uniqueBookedDates = Array.from(new Set(appointmentsToShow.map(app => app.date)));

            // Converte YYYY-MM-DD para objetos Date, garantindo que o tempo seja meia-noite (00:00:00)
            const dateObjects = uniqueBookedDates.map(dateString => new Date(dateString + 'T00:00:00'));

            setAllAppointments(appointmentsToShow);
            setBookedDays(dateObjects);
            toast.success("Agenda atualizada com sucesso!");
        } catch (error) {
            console.error("Erro ao carregar a agenda do LocalStorage:", error);
            toast.error("Não foi possível carregar sua agenda.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: LocalStorageAppointment['status']) => {
        // ... (código mantido)
        switch (status) {
            case "confirmada":
            case "agendada":
                return "default";
            case "realizada":
                return "secondary";
            case "cancelada":
                return "destructive";
            default:
                return "outline";
        }
    };

    const handleCancel = (id: number) => {
        // ... (código mantido para cancelamento)
        const storedAppointmentsRaw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        const allAppts: LocalStorageAppointment[] = storedAppointmentsRaw ? JSON.parse(storedAppointmentsRaw) : [];

        const updatedAppointments = allAppts.map(app =>
            app.id === id ? { ...app, status: "cancelada" as const } : app
        );

        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));
        loadAppointments();
        toast.info(`Consulta cancelada com sucesso.`);
    };

    const handleReSchedule = (id: number) => {
        toast.info(`Reagendamento da Consulta ID: ${id}. Navegar para a página de agendamento.`);
    };

    const displayDate = selectedCalendarDate ?
        new Date(selectedCalendarDate).toLocaleDateString("pt-BR", { weekday: 'long', day: '2-digit', month: 'long' }) :
        "Selecione uma data";


    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agenda Médica Centralizada</h1>
                    <p className="text-gray-600">Todas as consultas do sistema são exibidas aqui ({LOGGED_IN_DOCTOR_NAME})</p>
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Consultas para: {displayDate}</h2>
                    <Button onClick={loadAppointments} disabled={isLoading} variant="outline" size="sm">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar Agenda
                    </Button>
                </div>

                {/* NOVO LAYOUT DE DUAS COLUNAS */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* COLUNA 1: CALENDÁRIO */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="mr-2 h-5 w-5" />
                                    Calendário
                                </CardTitle>
                                <p className="text-sm text-gray-500">Dias em azul possuem agendamentos.</p>
                            </CardHeader>
                            <CardContent className="flex justify-center p-2">
                                <Calendar
                                    mode="single"
                                    selected={selectedCalendarDate}
                                    onSelect={setSelectedCalendarDate}
                                    initialFocus
                                    // A CHAVE DO HIGHLIGHT: Passa o array de datas agendadas
                                    modifiers={{ booked: bookedDays }}
                                    // Define o estilo CSS para o modificador 'booked'
                                    modifiersClassNames={{
                                        booked: "bg-blue-600 text-white aria-selected:!bg-blue-700 hover:!bg-blue-700/90"
                                    }}
                                    className="rounded-md border p-2"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUNA 2: LISTA DE CONSULTAS FILTRADAS */}
                    <div className="lg:col-span-2 space-y-4">
                        {isLoading ? (
                            <p className="text-center text-lg text-gray-500">Carregando a agenda...</p>
                        ) : filteredAppointments.length === 0 ? (
                            <p className="text-center text-lg text-gray-500">Nenhuma consulta encontrada para a data selecionada.</p>
                        ) : (
                            filteredAppointments.map((appointment) => {
                                const showActions = appointment.status === "agendada" || appointment.status === "confirmada";

                                return (
                                    <Card key={appointment.id} className="shadow-lg">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-xl font-semibold flex items-center">
                                                <User className="mr-2 h-5 w-5 text-blue-600" />
                                                {appointment.patientName}
                                            </CardTitle>
                                            <Badge variant={getStatusVariant(appointment.status)} className="uppercase">
                                                {appointment.status}
                                            </Badge>
                                        </CardHeader>

                                        <CardContent className="grid md:grid-cols-3 gap-4 pt-4">
                                            {/* Detalhes e Ações... (mantidos) */}
                                            <div className="space-y-3">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <User className="mr-2 h-4 w-4 text-gray-500" />
                                                    <span className="font-semibold">Médico:</span> {appointment.doctor}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                                    {new Date(appointment.date).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                                    {appointment.time}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                                    {appointment.location}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-700">
                                                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                                    {appointment.phone || "N/A"}
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center items-end">
                                                {showActions && (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReSchedule(appointment.id)}
                                                        >
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Reagendar
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleCancel(appointment.id)}
                                                        >
                                                            <X className="mr-2 h-4 w-4" />
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}