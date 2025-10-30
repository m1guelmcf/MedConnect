"use client";

import DoctorLayout from "@/components/doctor-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { exceptionsService } from "@/services/exceptionApi.mjs";
import { toast } from "@/hooks/use-toast";

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

export default function PatientDashboard() {
    var userInfo;
    const doctorId = "3bb9ee4a-cfdd-4d81-b628-383907dfa225"; //userInfo.id;
    const [availability, setAvailability] = useState<any | null>(null);
    const [exceptions, setExceptions] = useState<any | null>(null);
    const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }[]>>({});
    const formatTime = (time: string) => time.split(":").slice(0, 2).join(":");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Mapa de tradução
    const weekdaysPT: Record<string, string> = {
        sunday: "Domingo",
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
    };

    useEffect(() => { 
        userInfo = JSON.parse(localStorage.getItem("user_info") || "{}")
        const fetchData = async () => {
            try {
                // fetch para disponibilidade
                const response = await AvailabilityService.list();
                const filteredResponse = response.filter((disp: { doctor_id: any }) => disp.doctor_id == doctorId);
                setAvailability(filteredResponse);
                // fetch para exceções
                const res = await exceptionsService.list();
                const filteredRes = res.filter((disp: { doctor_id: any }) => disp.doctor_id == doctorId);
                setExceptions(filteredRes);
            } catch (e: any) {
                alert(`${e?.error} ${e?.message}`);
            }
        };
        fetchData();
    }, []);

    const openDeleteDialog = (patientId: string) => {
        setPatientToDelete(patientId);
        setDeleteDialogOpen(true);
    };

    const handleDeletePatient = async (patientId: string) => {
        // Remove from current list (client-side deletion)
        try {
            const res = await exceptionsService.delete(patientId);

            let message = "Exceção deletada com sucesso";
            try {
                if (res) {
                    throw new Error(`${res.error} ${res.message}` || "A API retornou erro");
                } else {
                    console.log(message);
                }
            } catch {}

            toast({
                title: "Sucesso",
                description: message,
            });

            setExceptions((prev: any[]) => prev.filter((p) => String(p.id) !== String(patientId)));
        } catch (e: any) {
            toast({
                title: "Erro",
                description: e?.message || "Não foi possível deletar a exceção",
            });
        }
        setDeleteDialogOpen(false);
        setPatientToDelete(null);
    };

    function formatAvailability(data: Availability[]) {
        // Agrupar os horários por dia da semana
        const schedule = data.reduce((acc: any, item) => {
            const { weekday, start_time, end_time } = item;

            // Se o dia ainda não existe, cria o array
            if (!acc[weekday]) {
                acc[weekday] = [];
            }

            // Adiciona o horário do dia
            acc[weekday].push({
                start: start_time,
                end: end_time,
            });

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
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Bem-vindo ao seu portal de consultas médicas</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">02 out</div>
                            <p className="text-xs text-muted-foreground">Dr. Silva - 14:30</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Consultas Este Mês</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">4</div>
                            <p className="text-xs text-muted-foreground">4 agendadas</p>
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

                    <Card>
                        <CardHeader>
                            <CardTitle>Próximas Consultas</CardTitle>
                            <CardDescription>Suas consultas agendadas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Dr. João Santos</p>
                                        <p className="text-sm text-gray-600">Cardiologia</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">02 out</p>
                                        <p className="text-sm text-gray-600">14:30</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid md:grid-cols-1 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário Semanal</CardTitle>
                            <CardDescription>Confira rapidamente a sua disponibilidade da semana</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 grid md:grid-cols-7 gap-2">
                            {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => {
                                const times = schedule[day] || [];
                                return (
                                    <div key={day} className="space-y-4">
                                        <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div>
                                                <p className="font-medium capitalize">{weekdaysPT[day]}</p>
                                            </div>
                                            <div className="text-center">
                                                {times.length > 0 ? (
                                                    times.map((t, i) => (
                                                        <p key={i} className="text-sm text-gray-600">
                                                            {formatTime(t.start)} <br /> {formatTime(t.end)}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">Sem horário</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
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
                                exceptions.map((ex: any) => {
                                    // Formata data e hora
                                    const date = new Date(ex.date).toLocaleDateString("pt-BR", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                    });

                                    const startTime = formatTime(ex.start_time);
                                    const endTime = formatTime(ex.end_time);

                                    return (
                                        <div key={ex.id} className="space-y-4">
                                            <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg shadow-sm">
                                                <div className="text-center">
                                                    <p className="font-semibold capitalize">{date}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {startTime} - {endTime} <br/> -
                                                    </p>
                                                </div>
                                                <div className="text-center mt-2">
                                                    <p className={`text-sm font-medium ${ex.kind === "bloqueio" ? "text-red-600" : "text-green-600"}`}>{ex.kind === "bloqueio" ? "Bloqueio" : "Liberação"}</p>
                                                    <p className="text-xs text-gray-500 italic">{ex.reason || "Sem motivo especificado"}</p>
                                                </div>
                                                <div>
                                                    <Button className="text-red-600" variant="outline" onClick={() => openDeleteDialog(String(ex.id))}>
                                                        <Trash2></Trash2>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-gray-400 italic col-span-7 text-center">Nenhuma exceção registrada.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => patientToDelete && handleDeletePatient(patientToDelete)} className="bg-red-600 hover:bg-red-700">
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </DoctorLayout>
    );
}
