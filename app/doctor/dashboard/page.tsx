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

import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { exceptionsService } from "@/services/exceptionApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";
import WeeklyScheduleCard from "@/components/ui/WeeklyScheduleCard";

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
  id: string; // id da exceção
  doctor_id: string;
  date: string; // formato YYYY-MM-DD
  start_time: string | null; // null = dia inteiro
  end_time: string | null; // null = dia inteiro
  kind: "bloqueio" | "disponibilidade"; // tipos conhecidos
  reason: string | null; // pode ser null
  created_at: string; // timestamp ISO
  created_by: string;
}

export default function PatientDashboard() {
  const [loggedDoctor, setLoggedDoctor] = useState<Doctor>();
  const [userData, setUserData] = useState<UserData>();
  const [availability, setAvailability] = useState<any | null>(null);
  const [exceptions, setExceptions] = useState<Exception[]>([]);
  const [schedule, setSchedule] = useState<
    Record<string, { start: string; end: string }[]>
  >({});
  const formatTime = (time?: string | null) =>
    time?.split(":")?.slice(0, 2).join(":") ?? "";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exceptionToDelete, setExceptionToDelete] = useState<string | null>(
    null
  );
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
    const fetchData = async () => {
      try {
        const doctorsList: Doctor[] = await doctorsService.list();
        const doctor = doctorsList[0];

        // Salva no estado
        setLoggedDoctor(doctor);

        // Busca disponibilidade
        const availabilityList = await AvailabilityService.list();

        // Filtra já com a variável local
        const filteredAvail = availabilityList.filter(
          (disp: { doctor_id: string }) => disp.doctor_id === doctor?.id
        );
        setAvailability(filteredAvail);

                // Busca exceções
                const exceptionsList = await exceptionsService.list();
                const filteredExc = exceptionsList.filter((exc: { doctor_id: string }) => exc.doctor_id === doctor?.id);
                setExceptions(filteredExc);
            } catch (e: any) {
                alert(`${e?.error} ${e?.message}`);
            }
        };

          fetchData();
      }, []);

  // Função auxiliar para filtrar o id do doctor correspondente ao user logado
  function findDoctorById(id: string, doctors: Doctor[]) {
    return doctors.find((doctor) => doctor.user_id === id);
  }

  const openDeleteDialog = (exceptionId: string) => {
    setExceptionToDelete(exceptionId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteException = async (ExceptionId: string) => {
    try {
      alert(ExceptionId);
      const res = await exceptionsService.delete(ExceptionId);

      let message = "Exceção deletada com sucesso";
      try {
        if (res) {
          throw new Error(
            `${res.error} ${res.message}` || "A API retornou erro"
          );
        } else {
          console.log(message);
        }
      } catch {}

      toast({
        title: "Sucesso",
        description: message,
      });

      setExceptions((prev: Exception[]) =>
        prev.filter((p) => String(p.id) !== String(ExceptionId))
      );
    } catch (e: any) {
      toast({
        title: "Erro",
        description: e?.message || "Não foi possível deletar a exceção",
      });
    }
    setDeleteDialogOpen(false);
    setExceptionToDelete(null);
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
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Bem-vindo ao seu portal de consultas médicas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próxima Consulta
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">02 out</div>
              <p className="text-xs text-muted-foreground">Dr. Silva - 14:30</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Este Mês
              </CardTitle>
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
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/doctor/medicos/consultas">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4 text-white" />
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
                  // Formata data e hora
                  const date = new Date(ex.date).toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    timeZone: "UTC",
                  });

                  const startTime = formatTime(ex.start_time);
                  const endTime = formatTime(ex.end_time);

                                    return (
                                        <div key={ex.id} className="space-y-4">
                                            <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg shadow-sm">
                                                <div className="text-center">
                                                    <p className="font-semibold capitalize">{date}</p>
                                                    <p className="text-sm text-gray-600">{startTime && endTime ? `${startTime} - ${endTime}` : "Dia todo"}</p>
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
                            <AlertDialogDescription>Tem certeza que deseja excluir esta exceção? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => exceptionToDelete && handleDeleteException(exceptionToDelete)} className="bg-red-600 hover:bg-red-700">
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Sidebar>
    );
}
