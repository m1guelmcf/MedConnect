"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CalendarDays, X } from "lucide-react";
import { toast } from "sonner";

import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";

// Tipagem correta para o usuário
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

interface User {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile;
  roles: string[];
  permissions?: any;
}

interface Appointment {
  id: string;
  doctor_id: string;
  scheduled_at: string;
  status: string;
  doctorName?: string;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);

  // --- Busca o usuário logado ---
  const fetchUser = async () => {
    try {
      const user: User = await usersService.getMe();
      if (!user.roles.includes("patient") && !user.roles.includes("user")) {
        toast.error("Apenas pacientes podem visualizar suas consultas.");
        setIsLoading(false);
        return null;
      }
      setUserData(user);
      return user;
    } catch (err) {
      console.error("Erro ao buscar usuário logado:", err);
      toast.error("Não foi possível identificar o usuário logado.");
      setIsLoading(false);
      return null;
    }
  };

  // --- Busca consultas do paciente ---
  const fetchAppointments = async (patientId: string) => {
    setIsLoading(true);
    try {
      const queryParams = `patient_id=eq.${patientId}&order=scheduled_at.desc`;
      const appointmentsList: Appointment[] = await appointmentsService.search_appointment(queryParams);

      // Buscar nome do médico para cada consulta
      const appointmentsWithDoctor = await Promise.all(
        appointmentsList.map(async (apt) => {
          let doctorName = apt.doctor_id;
          if (apt.doctor_id) {
            try {
              const doctorInfo = await usersService.full_data(apt.doctor_id);
              doctorName = doctorInfo?.profile?.full_name || apt.doctor_id;
            } catch (err) {
              console.error("Erro ao buscar nome do médico:", err);
            }
          }
          return { ...apt, doctorName };
        })
      );

      setAppointments(appointmentsWithDoctor);
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      toast.error("Não foi possível carregar suas consultas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const user = await fetchUser();
      if (user?.user.id) {
        await fetchAppointments(user.user.id);
      }
    })();
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

  const handleReschedule = (apt: Appointment) => {
    toast.info(`Funcionalidade de reagendamento da consulta ${apt.id} ainda não implementada`);
  };

  const handleCancel = (apt: Appointment) => {
    toast.info(`Funcionalidade de cancelamento da consulta ${apt.id} ainda não implementada`);
  };

    return (
        <Sidebar>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Minhas Consultas</h1>
                        <p className="text-muted-foreground">Veja, reagende ou cancele suas consultas</p>
                    </div>
                </div>

        <div className="grid gap-6">
          {isLoading ? (
            <p>Carregando consultas...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-600">Você ainda não possui consultas agendadas.</p>
          ) : (
            appointments.map((apt) => (
              <Card key={apt.id}>
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{apt.doctorName}</CardTitle>
                    <CardDescription>Especialidade: N/A</CardDescription>
                  </div>
                  {getStatusBadge(apt.status)}
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      {new Date(apt.scheduled_at).toLocaleDateString("pt-BR")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-gray-500" />
                      {new Date(apt.scheduled_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {apt.status !== "cancelled" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleReschedule(apt)}>
                          <CalendarDays className="mr-2 h-4 w-4" /> Reagendar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleCancel(apt)}>
                          <X className="mr-2 h-4 w-4" /> Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Sidebar>
  );
}
