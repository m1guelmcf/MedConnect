"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para cancelamento
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Obter usuário logado
      const user = await usersService.getMe();
      if (!user || !user.user?.id) {
        toast.error("Usuário não identificado.");
        return;
      }

      // 2. Buscar médicos e agendamentos em paralelo
      // Filtra apenas agendamentos deste paciente
      const queryParams = `patient_id=eq.${"user.user.id"}&order=scheduled_at.desc`;
      console.log("id do paciente:", user.profile.id);
      const [appointmentList, doctorList] = await Promise.all([
        appointmentsService.search_appointment(queryParams),
        doctorsService.list(),
      ]);
      console.log("Agendamentos obtidos:", appointmentList);
      console.log("Médicos obtidos:", doctorList);
      // 3. Mapear médicos para acesso rápido
      const doctorMap = new Map(doctorList.map((d: any) => [d.id, d]));

      // 4. Enriquecer os agendamentos com dados do médico
      const enrichedAppointments = appointmentList.map((apt: any) => ({
        ...apt,
        doctor: doctorMap.get(apt.doctor_id) || {
          full_name: "Médico não encontrado",
          specialty: "Clínico Geral",
          location: "Consultório",
          phone: "N/A"
        },
      }));
      console.log("Agendamentos enriquecidos:", enrichedAppointments);
      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Não foi possível carregar suas consultas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE CANCELAMENTO ---
  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;
    try {
      // Opção A: Deletar o registro (como no código da secretária)
      await appointmentsService.delete(selectedAppointment.id);
      
      // Opção B: Se preferir apenas mudar o status, descomente abaixo e comente a linha acima:
      // await appointmentsService.update(selectedAppointment.id, { status: 'cancelled' });

      setAppointments((prev) =>
        prev.filter((apt) => apt.id !== selectedAppointment.id)
      );
      setCancelModal(false);
      toast.success("Consulta cancelada com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      toast.error("Não foi possível cancelar a consulta.");
    }
  };

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Minhas Consultas</h1>
            <p className="text-muted-foreground">
              Acompanhe seu histórico e próximos agendamentos
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <p>Carregando consultas...</p>
          ) : appointments.length > 0 ? (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {appointment.doctor.full_name}
                      </CardTitle>
                      <CardDescription>
                        {appointment.doctor.specialty}
                      </CardDescription>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Coluna 1: Data e Hora */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-foreground font-medium">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        Dr(a). {appointment.doctor.full_name.split(' ')[0]}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(appointment.scheduled_at).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        {new Date(appointment.scheduled_at).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: "UTC",
                          }
                        )}
                      </div>
                    </div>

                    {/* Coluna 2: Localização e Contato */}
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        {appointment.doctor.location || "Local a definir"}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4" />
                        {appointment.doctor.phone || "Contato não disponível"}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  {["requested", "confirmed"].includes(appointment.status) && (
                    <div className="flex gap-2 mt-4 pt-4 border-t justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="bg-transparent text-destructive hover:bg-destructive/10 border border-destructive/20"
                        onClick={() => handleCancelClick(appointment)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar Consulta
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
              <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Você ainda não possui consultas agendadas.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      <Dialog open={cancelModal} onOpenChange={setCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Cancelar Consulta
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua consulta com{" "}
              <strong>{selectedAppointment?.doctor?.full_name}</strong> no dia{" "}
              {selectedAppointment &&
                new Date(selectedAppointment.scheduled_at).toLocaleDateString(
                  "pt-BR", { timeZone: "UTC" }
                )}
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
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
    </Sidebar>
  );
}

// Helper para Badges (Mantido consistente com o código da secretária)
const getStatusBadge = (status: string) => {
  switch (status) {
    case "requested":
      return (
        <Badge className="bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20 border-yellow-400/20">Solicitada</Badge>
      );
    case "confirmed":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Confirmada</Badge>;
    case "checked_in":
      return (
        <Badge className="bg-indigo-400/10 text-indigo-600 hover:bg-indigo-400/20 border-indigo-400/20">Check-in</Badge>
      );
    case "completed":
      return <Badge className="bg-green-400/10 text-green-600 hover:bg-green-400/20 border-green-400/20">Realizada</Badge>;
    case "cancelled":
      return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">Cancelada</Badge>;
    case "no_show":
      return (
        <Badge className="bg-muted text-foreground border-muted-foreground/20">Não Compareceu</Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};