"use client";

import { useState, useEffect } from "react";
import PatientLayout from "@/components/patient-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Phone, User, X, CalendarDays } from "lucide-react";
import { toast } from "sonner";

import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { patientsService } from "@/services/patientsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";

const APPOINTMENTS_STORAGE_KEY = "clinic-appointments";

interface UserPermissions {
    isAdmin: boolean;
    isManager: boolean;
    isDoctor: boolean;
    isSecretary: boolean;
    isAdminOrManager: boolean;
}

interface UserData {
    user: {
        id: string;
        email: string;
        email_confirmed_at: string | null;
        created_at: string | null;
        last_sign_in_at: string | null;
    };
    profile: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        avatar_url: string | null;
        disabled: boolean;
        created_at: string | null;
        updated_at: string | null;
    };
    roles: string[];
    permissions: UserPermissions;
}

export default function PatientAppointments() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
    const [userData, setUserData] = useState<UserData>();

    // Modais
    const [rescheduleModal, setRescheduleModal] = useState(false);
    const [cancelModal, setCancelModal] = useState(false);

    // Formulário de reagendamento/cancelamento
    const [rescheduleData, setRescheduleData] = useState({ date: "", time: "", reason: "" });
    const [cancelReason, setCancelReason] = useState("");

    const timeSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const queryParams = "order=scheduled_at.desc";
            const appointmentList = await appointmentsService.search_appointment(queryParams);
            const patientList = await patientsService.list();
            const doctorList = await doctorsService.list();

            const user = await usersService.getMe();
            setUserData(user);

            const doctorMap = new Map(doctorList.map((d: any) => [d.id, d]));
            const patientMap = new Map(patientList.map((p: any) => [p.id, p]));

            console.log(appointmentList);

            // Filtra apenas as consultas do paciente logado
            const patientAppointments = appointmentList
                .filter((apt: any) => apt.patient_id === userData?.user.id)
                .map((apt: any) => ({
                    ...apt,
                    doctor: doctorMap.get(apt.doctor_id) || { full_name: "Médico não encontrado", specialty: "N/A" },
                    patient: patientMap.get(apt.patient_id) || { full_name: "Paciente não encontrado" },
                }));

            setAppointments(patientAppointments);
        } catch (error) {
            console.error("Erro ao carregar consultas:", error);
            toast.error("Não foi possível carregar suas consultas.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "requested":
                return <Badge className="bg-yellow-100 text-yellow-800">Solicitada</Badge>;
            case "confirmed":
                return <Badge className="bg-blue-100 text-blue-800">Confirmada</Badge>;
            case "checked_in":
                return <Badge className="bg-indigo-100 text-indigo-800">Check-in</Badge>;
            case "completed":
                return <Badge className="bg-green-100 text-green-800">Realizada</Badge>;
            case "cancelled":
                return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleReschedule = (appointment: any) => {
        setSelectedAppointment(appointment);
        setRescheduleData({ date: "", time: "", reason: "" });
        setRescheduleModal(true);
    };

    const handleCancel = (appointment: any) => {
        setSelectedAppointment(appointment);
        setCancelReason("");
        setCancelModal(true);
    };

    const confirmReschedule = async () => {
        if (!rescheduleData.date || !rescheduleData.time) {
            toast.error("Por favor, selecione uma nova data e horário.");
            return;
        }
        try {
            const newScheduledAt = new Date(`${rescheduleData.date}T${rescheduleData.time}:00Z`).toISOString();

            await appointmentsService.update(selectedAppointment.id, {
                scheduled_at: newScheduledAt,
                status: "requested",
            });

            setAppointments((prev) => prev.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, scheduled_at: newScheduledAt, status: "requested" } : apt)));

            setRescheduleModal(false);
            toast.success("Consulta reagendada com sucesso!");
        } catch (error) {
            console.error("Erro ao reagendar consulta:", error);
            toast.error("Não foi possível reagendar a consulta.");
        }
    };

    const confirmCancel = async () => {
        if (!cancelReason.trim() || cancelReason.trim().length < 10) {
            toast.error("Por favor, informe um motivo de cancelamento (mínimo 10 caracteres).");
            return;
        }
        try {
            await appointmentsService.update(selectedAppointment.id, {
                status: "cancelled",
                cancel_reason: cancelReason,
            });

            setAppointments((prev) => prev.map((apt) => (apt.id === selectedAppointment.id ? { ...apt, status: "cancelled" } : apt)));

            setCancelModal(false);
            toast.success("Consulta cancelada com sucesso!");
        } catch (error) {
            console.error("Erro ao cancelar consulta:", error);
            toast.error("Não foi possível cancelar a consulta.");
        }
    };

    return (
        <PatientLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Minhas Consultas</h1>
                        <p className="text-muted-foreground">Veja, reagende ou cancele suas consultas</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    {isLoading ? (
                        <p>Carregando suas consultas...</p>
                    ) : appointments.length > 0 ? (
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
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                                                {new Date(appointment.scheduled_at).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                                                {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    timeZone: "UTC",
                                                })}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="mr-2 h-4 w-4 text-gray-500" />
                                                {appointment.doctor.location || "Local a definir"}
                                            </div>
                                            <div className="flex items-center">
                                                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                                                {appointment.doctor.phone || "N/A"}
                                            </div>
                                        </div>
                                    </div>

                                    {appointment.status !== "cancelled" && (
                                        <div className="flex gap-2 mt-4 pt-4 border-t">
                                            <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                                                <CalendarDays className="mr-2 h-4 w-4" />
                                                Reagendar
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancel(appointment)}>
                                                <X className="mr-2 h-4 w-4" />
                                                Cancelar
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-6 text-center">
                            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <CardTitle className="text-xl">Nenhuma Consulta Encontrada</CardTitle>
                            <CardDescription className="mt-2">
                                Você ainda não possui consultas agendadas. Use o menu "Agendar Consulta" para começar.
                            </CardDescription>
                        </Card>
                    )}
                </div>
            </div>

            {/* MODAL DE REAGENDAMENTO */}
            <Dialog open={rescheduleModal} onOpenChange={setRescheduleModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Reagendar Consulta</DialogTitle>
                        <DialogDescription>
                            Escolha uma nova data e horário para sua consulta com <strong>{selectedAppointment?.doctor?.full_name}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Nova Data</Label>
                            <Input id="date" type="date" value={rescheduleData.date} onChange={(e) => setRescheduleData((prev) => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Novo Horário</Label>
                            <Select value={rescheduleData.time} onValueChange={(value) => setRescheduleData((prev) => ({ ...prev, time: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um horário" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeSlots.map((time) => (
                                        <SelectItem key={time} value={time}>
                                            {time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Motivo (opcional)</Label>
                            <Textarea id="reason" placeholder="Explique brevemente o motivo do reagendamento..." value={rescheduleData.reason} onChange={(e) => setRescheduleData((prev) => ({ ...prev, reason: e.target.value }))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRescheduleModal(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmReschedule}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL DE CANCELAMENTO */}
            <Dialog open={cancelModal} onOpenChange={setCancelModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Cancelar Consulta</DialogTitle>
                        <DialogDescription>
                            Deseja realmente cancelar sua consulta com <strong>{selectedAppointment?.doctor?.full_name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cancel-reason" className="text-sm font-medium">
                                Motivo do Cancelamento <span className="text-red-500">*</span>
                            </Label>
                            <Textarea id="cancel-reason" placeholder="Informe o motivo do cancelamento (mínimo 10 caracteres)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="min-h-[100px]" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelModal(false)}>
                            Voltar
                        </Button>
                        <Button variant="destructive" onClick={confirmCancel}>
                            Confirmar Cancelamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </PatientLayout>
    );
}
