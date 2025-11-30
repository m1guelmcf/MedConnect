"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import Sidebar from "@/components/Sidebar";
import { useAuthLayout } from "@/hooks/useAuthLayout";

interface Appointment {
  id: string;
  doctor_id: string;
  scheduled_at: string;
  status: string;
  doctorName?: string;
  doctorSpecialty?: string;
  location?: string;
}

export default function PatientAppointmentsPage() {
  // Usando o hook de layout para garantir autenticação e pegar dados
  const { user, isLoading: isAuthLoading } = useAuthLayout({ requiredRole: ["paciente", "admin", "gestor"] });
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async (patientId: string) => {
    setIsLoading(true);
    try {
      const queryParams = `patient_id=eq.${patientId}&order=scheduled_at.desc`;
      const appointmentsList: Appointment[] = await appointmentsService.search_appointment(queryParams);

      // Enriquecer dados com informações do médico
      const enrichedAppointments = await Promise.all(
        appointmentsList.map(async (apt) => {
          let doctorName = "Médico não identificado";
          let doctorSpecialty = "Clínica Geral";
          let location = "Consultório Principal";

          if (apt.doctor_id) {
            try {
              // Busca dados completos do médico
              const doctorData = await usersService.full_data(apt.doctor_id);
              doctorName = doctorData?.profile?.full_name || doctorName;
              // Se tivéssemos a especialidade no profile ou tabela doctors, pegaríamos aqui
              // Como o usersService.full_data retorna profile e user, assumimos dados básicos
            } catch (err) {
              console.error("Erro ao buscar médico:", err);
            }
          }
          return { ...apt, doctorName, doctorSpecialty, location };
        })
      );

      setAppointments(enrichedAppointments);
    } catch (err) {
      console.error("Erro ao carregar consultas:", err);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seu histórico de consultas.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
    }
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      requested: { label: "Solicitada", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      confirmed: { label: "Confirmada", className: "bg-blue-100 text-blue-800 border-blue-200" },
      checked_in: { label: "Na Sala de Espera", className: "bg-purple-100 text-purple-800 border-purple-200" },
      completed: { label: "Realizada", className: "bg-green-100 text-green-800 border-green-200" },
      cancelled: { label: "Cancelada", className: "bg-red-100 text-red-800 border-red-200" },
      no_show: { label: "Não Compareceu", className: "bg-gray-100 text-gray-800 border-gray-200" },
    };

    const config = statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };

    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "HH:mm");
    } catch {
      return "--:--";
    }
  };

  if (isAuthLoading) {
    return (
        <Sidebar>
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Carregando suas informações...
            </div>
        </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Consultas</h1>
            <p className="text-gray-600">Histórico e agendamentos futuros</p>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Buscando agendamentos...</div>
          ) : appointments.length === 0 ? (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900">Nenhuma consulta encontrada</p>
                    <p className="text-gray-500 mb-4">Você ainda não tem agendamentos registrados.</p>
                </CardContent>
            </Card>
          ) : (
            appointments.map((apt) => (
              <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        {/* Coluna da Data (Esquerda) */}
                        <div className="bg-blue-50 p-6 flex flex-col items-center justify-center min-w-[150px] border-b md:border-b-0 md:border-r border-blue-100">
                            <span className="text-3xl font-bold text-blue-700">
                                {format(parseISO(apt.scheduled_at), "dd")}
                            </span>
                            <span className="text-sm font-medium text-blue-600 uppercase">
                                {format(parseISO(apt.scheduled_at), "MMM", { locale: ptBR })}
                            </span>
                            <span className="text-xs text-blue-400 mt-1">
                                {format(parseISO(apt.scheduled_at), "yyyy")}
                            </span>
                        </div>

                        {/* Coluna de Detalhes (Centro) */}
                        <div className="flex-1 p-6 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{apt.doctorName}</h3>
                                    <p className="text-sm text-gray-500">{apt.doctorSpecialty}</p>
                                </div>
                                {getStatusBadge(apt.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                    {formatTime(apt.scheduled_at)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                                    <span className="capitalize">{formatDate(apt.scheduled_at)}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                                    <MapPin className="mr-2 h-4 w-4 text-blue-500" />
                                    {apt.location}
                                </div>
                            </div>
                        </div>
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