"use client";

import { usersService } from "services/usersApi.mjs";
import { doctorsService } from "services/doctorsApi.mjs";
import { appointmentsService } from "services/appointmentsApi.mjs";
import { AvailabilityService } from "services/availabilityApi.mjs";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User } from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const API_URL = " https://yuanqfswhberkoevtmfr.supabase.co/";

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
}

interface Disponibilidade {
  weekday: string;
  start_time: string;
  end_time: string;
  slot_minutes?: number;
}

export default function ScheduleAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [tipoConsulta, setTipoConsulta] = useState("presencial");
  const [duracao, setDuracao] = useState("30");
  const [notes, setNotes] = useState("");

  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data: Doctor[] = await doctorsService.list();
      setDoctors(data || []);
    } catch (e) {
      console.error("Erro ao buscar médicos:", e);
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const fetchAvailableSlots = useCallback(
    async (doctorId: string, date: string) => {
      if (!doctorId || !date) return;
      setLoadingSlots(true);
      setAvailableTimes([]);

      try {
        const disponibilidades: Disponibilidade[] =
          await AvailabilityService.listById(doctorId);
        const consultas = await appointmentsService.search_appointment(
          `doctor_id=eq.${doctorId}&scheduled_at=gte.${date}&scheduled_at=lt.${date}T23:59:59`
        );

        const diaJS = new Date(date).getDay();
        // Ajuste: Sunday = 0 -> API pode esperar 1-7
        const diaAPI = diaJS === 0 ? 7 : diaJS;

        console.log("Disponibilidades recebidas: ", disponibilidades);
        console.log("Consultas do dia: ", consultas);

        const disponibilidadeDia = disponibilidades.find(
          (d: Disponibilidade) => Number(diaAPI) === getWeekdayNumber(d.weekday)
        );

        if (!disponibilidadeDia) {
          console.log("Nenhuma disponibilidade para este dia");
          setAvailableTimes([]);
          setLoadingSlots(false);
          return;
        }

        const [startHour, startMin] = disponibilidadeDia.start_time
          .split(":")
          .map(Number);
        const [endHour, endMin] = disponibilidadeDia.end_time
          .split(":")
          .map(Number);
        const slot = disponibilidadeDia.slot_minutes || 30;

        const horariosGerados: string[] = [];
        let atual = new Date(date);
        atual.setHours(startHour, startMin, 0, 0);

        const end = new Date(date);
        end.setHours(endHour, endMin, 0, 0);

        while (atual < end) {
          horariosGerados.push(atual.toTimeString().slice(0, 5));
          atual = new Date(atual.getTime() + slot * 60 * 1000);
        }

        const ocupados = consultas.map((c: any) =>
          c.scheduled_at.split("T")[1].slice(0, 5)
        );
        const livres = horariosGerados.filter((h) => !ocupados.includes(h));

        setAvailableTimes(livres);
      } catch (err) {
        console.error(err);
        setAvailableTimes([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  const getWeekdayNumber = (weekday: string) => {
    // Converte weekday API para número: 1=Monday ... 7=Sunday
    switch (weekday.toLowerCase()) {
      case "monday":
        return 1;
      case "tuesday":
        return 2;
      case "wednesday":
        return 3;
      case "thursday":
        return 4;
      case "friday":
        return 5;
      case "saturday":
        return 6;
      case "sunday":
        return 7;
      default:
        return 0;
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots(selectedDoctor, selectedDate);
    } else {
      setAvailableTimes([]);
    }
    setSelectedTime("");
  }, [selectedDoctor, selectedDate, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Selecione médico, data e horário.");
      return;
    }

    const doctor = doctors.find((d) => d.id === selectedDoctor);
    const scheduledISO = `${selectedDate}T${selectedTime}:00Z`;

    const paciente = await usersService.getMe();
    const body = {
      doctor_id: doctor?.id,
      patient_id: paciente.user.id,
      scheduled_at: scheduledISO,
      duration_minutes: Number(duracao),
      created_by: paciente.user.id,
    };

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Erro ao agendar consulta");

      alert("Consulta agendada com sucesso!");
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableTimes([]);
    } catch (err) {
      console.error(err);
      alert("Falha ao agendar consulta");
    }
  };

  return (
    <PatientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Agendar Consulta</h1>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Consulta</CardTitle>
            <CardDescription>Escolha o médico, data e horário</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Médico */}
              <div className="space-y-2">
                <Label>Médico</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <SelectItem value="loading" disabled>
                        Carregando...
                      </SelectItem>
                    ) : (
                      doctors.map((d: Doctor) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name} - {d.specialty}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  disabled={!selectedDoctor}
                />
              </div>

              {/* Horário */}
              <div className="space-y-2">
                <Label>Horário</Label>
                <Select
                  value={selectedTime}
                  onValueChange={setSelectedTime}
                  disabled={loadingSlots || availableTimes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingSlots
                          ? "Carregando horários..."
                          : availableTimes.length === 0
                          ? "Nenhum horário disponível"
                          : "Selecione o horário"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo e duração */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select value={tipoConsulta} onValueChange={setTipoConsulta}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duração (min)</Label>
                  <Input
                    type="number"
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    min={10}
                    max={120}
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <Button
                type="submit"
                disabled={!selectedDoctor || !selectedDate || !selectedTime}
                className="w-full"
              >
                Agendar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" /> Resumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDoctor && (
              <p>
                <User className="inline-block w-4 h-4 mr-1" />
                {doctors.find((d) => d.id === selectedDoctor)?.full_name}
              </p>
            )}
            {selectedDate && (
              <p>
                <Calendar className="inline-block w-4 h-4 mr-1" />
                {new Date(selectedDate).toLocaleDateString("pt-BR")}
              </p>
            )}
            {selectedTime && (
              <p>
                <Clock className="inline-block w-4 h-4 mr-1" />
                {selectedTime}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  );
}
