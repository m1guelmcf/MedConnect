"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Trash2 } from "lucide-react";
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

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";

import { useAuthLayout } from "@/hooks/useAuthLayout";
import { patientsService } from "@/services/patientsApi.mjs";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { format, parseISO, isAfter, isSameMonth, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { exceptionsService } from "@/services/exceptionApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";
import WeeklyScheduleCard from "@/components/ui/WeeklyScheduleCard";


// --- TIPOS ADICIONADOS PARA CORREÇÃO ---
type Appointment = {
    id: string;
    doctor_id: string;
    patient_id: string;
    scheduled_at: string;
    status: string;
};

type EnrichedAppointment = Appointment & {
    patientName: string;
};
// --- FIM DOS TIPOS ADICIONADOS ---

type Availability = {
    id: string;
    doctor_id: string;
    weekday: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    appointment_type: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string | null;
};

type Schedule = {
    weekday: object;
};

type Doctor = {
    id: string;
    user_id: string | null;
    crm: string;
    crm_uf: string;
    specialty: string;
    full_name: string;
    cpf: string;
    email: string;
    phone_mobile: string | null;
    phone2: string | null;
    cep: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    birth_date: string | null;
    rg: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string | null;
    max_days_in_advance: number;
    rating: number | null;
};

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

interface Exception {
    id: string;
    doctor_id: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    kind: "bloqueio" | "disponibilidade";
    reason: string | null;
    created_at: string;
    created_by: string;
}

// Minimal type for Patient, adjust if more fields are needed
type Patient = {
    id: string;
    full_name: string;
};

export default function PatientDashboard() {
    const { user } = useAuthLayout({ requiredRole: ['medico'] });

    const [loggedDoctor, setLoggedDoctor] = useState<Doctor | null>(null);
    const [userData, setUserData] = useState<UserData>();
    const [availability, setAvailability] = useState<any | null>(null);
    const [exceptions, setExceptions] = useState<Exception[]>([]);
    const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }[]>>({});
    const formatTime = (time?: string | null) => time?.split(":")?.slice(0, 2).join(":") ?? "";
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [exceptionToDelete, setExceptionToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [nextAppointment, setNextAppointment] = useState<EnrichedAppointment | null>(null);
    const [monthlyCount, setMonthlyCount] = useState<number>(0);

    const weekdaysPT: Record<string, string> = { sunday: "Domingo", monday: "Segunda", tuesday: "Terça", wednesday: "Quarta", thursday: "Quinta", friday: "Sexta", saturday: "Sábado" };

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                const doctorsList: Doctor[] = await doctorsService.list();
                const currentDoctor = doctorsList.find(doc => doc.user_id === user.id);

                if (!currentDoctor) {
                    setError("Perfil de médico não encontrado para este usuário.");
                    return;
                }
                setLoggedDoctor(currentDoctor);

                const [appointmentsList, patientsList, availabilityList, exceptionsList] = await Promise.all([
                    appointmentsService.list(),
                    patientsService.list(),
                    AvailabilityService.list(),
                    exceptionsService.list()
                ]);

                const patientsMap = new Map(patientsList.map((p: Patient) => [p.id, p.full_name]));

                const doctorAppointments = appointmentsList
                    .filter((apt: Appointment) => apt.doctor_id === currentDoctor.id)
                    .map((apt: Appointment): EnrichedAppointment => ({
                        ...apt,
                        patientName: String(patientsMap.get(apt.patient_id) || "Paciente Desconhecido"),
                    }));

                const today = startOfToday();
                const upcomingAppointments = doctorAppointments
                    .filter(apt => isAfter(parseISO(apt.scheduled_at), today))
                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
                setNextAppointment(upcomingAppointments[0] || null);

                const activeStatuses = ['confirmed', 'requested', 'checked_in'];
                const currentMonthAppointments = doctorAppointments.filter(apt =>
                    isSameMonth(parseISO(apt.scheduled_at), new Date()) && activeStatuses.includes(apt.status)
                );
                setMonthlyCount(currentMonthAppointments.length);

                setAvailability(availabilityList.filter((d: any) => d.doctor_id === currentDoctor.id));
                setExceptions(exceptionsList.filter((e: any) => e.doctor_id === currentDoctor.id));

            } catch (e: any) {
                setError(e?.message || "Erro ao buscar dados do dashboard");
                console.error("Erro no dashboard:", e);
            }
        };

        fetchData();
    }, [user]);

    function findDoctorById(id: string, doctors: Doctor[]) {
        return doctors.find((doctor) => doctor.user_id === id);
    }

    const openDeleteDialog = (exceptionId: string) => {
        setExceptionToDelete(exceptionId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteException = async (ExceptionId: string) => {
        try {
            const res = await exceptionsService.delete(ExceptionId);
            if (res && res.error) { throw new Error(res.message || "A API retornou um erro"); }
            toast({ title: "Sucesso", description: "Exceção deletada com sucesso" });
            setExceptions((prev: Exception[]) => prev.filter((p) => String(p.id) !== String(ExceptionId)));
        } catch (e: any) {
            toast({ title: "Erro", description: e?.message || "Não foi possível deletar a exceção" });
        }
        setDeleteDialogOpen(false);
        setExceptionToDelete(null);
    };

    function formatAvailability(data: Availability[]) {
        if (!data) return {};
        const schedule = data.reduce((acc: any, item) => {
            const { weekday, start_time, end_time } = item;
            if (!acc[weekday]) acc[weekday] = [];
            acc[weekday].push({ start: start_time, end: end_time });
            return acc;
        }, {} as Record<string, { start: string; end: string }[]>);
        return schedule;
    }

    useEffect(() => {
        if (availability) {
            const formatted = formatAvailability(availability);
            setSchedule(formatted);
        }
    }, [availability]);

    return (
        <Sidebar>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Bem-vindo ao seu portal de consultas médicas
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {nextAppointment ? (
                                <>
                                    <p className="text-2xl font-bold capitalize">
                                        {nextAppointment.patientName} - {format(parseISO(nextAppointment.scheduled_at), "HH:mm")}
                                    </p>
                                    <div className="text-x text-muted-foreground">
                                        {format(parseISO(nextAppointment.scheduled_at), "dd MMM", { locale: ptBR })}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">Nenhuma</div>
                                    <p className="text-xs text-muted-foreground">Sem próximas consultas</p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consultas Este Mês</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{monthlyCount}</div>
                            <p className="text-xs text-muted-foreground">{monthlyCount === 1 ? '1 agendada' : `${monthlyCount} agendadas`}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Perfil</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">100%</div>
                            <p className="text-xs text-muted-foreground">Dados completos</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Rápidas</CardTitle>
                            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/doctor/medicos/consultas">
                                <Button className="w-full justify-start">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Ver Minhas Consultas
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>


                </div>
                <div className="grid md:grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário Semanal</CardTitle>
                            <CardDescription>Confira rapidamente a sua disponibilidade da semana</CardDescription>
                        </CardHeader>
                        <CardContent>{loggedDoctor && <WeeklyScheduleCard doctorId={loggedDoctor.id} />}</CardContent>
                    </Card>
                </div>
                <div className="grid md:grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Exceções</CardTitle>
                            <CardDescription>Bloqueios e liberações eventuais de agenda</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 grid md:grid-cols-7 gap-2">
                            {exceptions && exceptions.length > 0 ? (
                                exceptions.map((ex: Exception) => {
                                    const date = new Date(ex.date).toLocaleDateString("pt-BR", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                        timeZone: "UTC"
                                    });

                                    const startTime = formatTime(ex.start_time);
                                    const endTime = formatTime(ex.end_time);

                                    return (
                                        <div key={ex.id} className="space-y-4">
                                            <div className="flex flex-col items-center justify-between p-3 bg-primary/10 rounded-lg shadow-sm">
                                                <div className="text-center">
                                                    <p className="font-semibold capitalize">{date}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {startTime && endTime
                                                            ? `${startTime} - ${endTime}`
                                                            : "Dia todo"}
                                                    </p>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className={`text-sm font-medium ${ex.kind === "bloqueio" ? "text-destructive" : "text-primary"}`}>{ex.kind === "bloqueio" ? "Bloqueio" : "Liberação"}</p>
                                                    <p className="text-xs text-muted-foreground italic">{ex.reason || "Sem motivo especificado"}</p>
                                                </div>
                                                <div>
                                                    <Button className="text-destructive" variant="outline" onClick={() => openDeleteDialog(String(ex.id))}>
                                                        <Trash2></Trash2>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground italic col-span-7 text-center">Nenhuma exceção registrada.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir esta exceção? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => exceptionToDelete && handleDeleteException(exceptionToDelete)} className="bg-destructive hover:bg-destructive/90">
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Sidebar>
    );
}