"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usersService } from "@/services/usersApi.mjs";
import { patientsService } from "@/services/patientsApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarShadcn } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { User, StickyNote, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ScheduleForm() {
  // Estado do usuário e role
  const [role, setRole] = useState<string>("paciente");
  const [userId, setUserId] = useState<string | null>(null);

  // Listas e seleções
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Outras configs
  const [tipoConsulta] = useState("presencial");
  const [duracao] = useState("30");
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({});
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // Funções auxiliares
  const getWeekdayNumber = (weekday: string) =>
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      .indexOf(weekday.toLowerCase()) + 1;

  const getBrazilDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));

  // 🔹 Buscar dados do usuário e role
  useEffect(() => {
    (async () => {
      try {
        const me = await usersService.getMe();
        const currentRole = me?.roles?.[0] || "paciente";
        setRole(currentRole);
        setUserId(me?.user?.id || null);

        if (["secretaria", "gestor", "admin"].includes(currentRole)) {
          const pats = await patientsService.list();
          setPatients(pats || []);
        }
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
      }
    })();
  }, []);

  // 🔹 Buscar médicos
  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data = await doctorsService.list();
      setDoctors(data || []);
    } catch (err) {
      console.error("Erro ao buscar médicos:", err);
      toast({ title: "Erro", description: "Não foi possível carregar médicos." });
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // 🔹 Buscar disponibilidades
  const loadDoctorDisponibilidades = useCallback(async (doctorId?: string) => {
    if (!doctorId) return;
    try {
      const disp = await AvailabilityService.listById(doctorId);
      setDisponibilidades(disp || []);
      await computeAvailabilityCountsPreview(doctorId, disp || []);
    } catch (err) {
      console.error("Erro ao buscar disponibilidades:", err);
      setDisponibilidades([]);
    }
  }, []);

  const computeAvailabilityCountsPreview = async (doctorId: string, dispList: any[]) => {
    try {
      const today = new Date();
      const start = format(today, "yyyy-MM-dd");
      const endDate = addDays(today, 90);
      const end = format(endDate, "yyyy-MM-dd");

      const appointments = await appointmentsService.search_appointment(
        `doctor_id=eq.${doctorId}&scheduled_at=gte.${start}T00:00:00Z&scheduled_at=lt.${end}T23:59:59Z`
      );

      const apptsByDate: Record<string, number> = {};
      (appointments || []).forEach((a: any) => {
        const d = String(a.scheduled_at).split("T")[0];
        apptsByDate[d] = (apptsByDate[d] || 0) + 1;
      });

      const counts: Record<string, number> = {};
      for (let i = 0; i <= 90; i++) {
        const d = addDays(today, i);
        const key = format(d, "yyyy-MM-dd");
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const dailyDisp = dispList.filter((p) => getWeekdayNumber(p.weekday) === dayOfWeek);
        if (dailyDisp.length === 0) {
          counts[key] = 0;
          continue;
        }
        let possible = 0;
        dailyDisp.forEach((p) => {
          const [sh, sm] = p.start_time.split(":").map(Number);
          const [eh, em] = p.end_time.split(":").map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          const slot = p.slot_minutes || 30;
          if (endMin >= startMin) possible += Math.floor((endMin - startMin) / slot) + 1;
        });
        const occupied = apptsByDate[key] || 0;
        counts[key] = Math.max(0, possible - occupied);
      }
      setAvailabilityCounts(counts);
    } catch (err) {
      console.error("Erro ao calcular contagens:", err);
      setAvailabilityCounts({});
    }
  };

  // 🔹 Quando médico muda
  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorDisponibilidades(selectedDoctor);
    } else {
      setDisponibilidades([]);
      setAvailabilityCounts({});
    }
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes([]);
  }, [selectedDoctor, loadDoctorDisponibilidades]);

  // 🔹 Buscar horários disponíveis
  const fetchAvailableSlots = useCallback(async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    setAvailableTimes([]);
    try {
      const disponibilidades = await AvailabilityService.listById(doctorId);
      const consultas = await appointmentsService.search_appointment(
        `doctor_id=eq.${doctorId}&scheduled_at=gte.${date}T00:00:00Z&scheduled_at=lt.${date}T23:59:59Z`
      );
      const diaJS = new Date(date).getDay();
      const diaAPI = diaJS === 0 ? 7 : diaJS;
      const disponibilidadeDia = disponibilidades.find(
        (d: any) => getWeekdayNumber(d.weekday) === diaAPI
      );
      if (!disponibilidadeDia) {
        toast({ title: "Nenhuma disponibilidade", description: "Nenhum horário para este dia." });
        return setAvailableTimes([]);
      }
      const [startHour, startMin] = disponibilidadeDia.start_time.split(":").map(Number);
      const [endHour, endMin] = disponibilidadeDia.end_time.split(":").map(Number);
      const slot = disponibilidadeDia.slot_minutes || 30;
      const horariosGerados: string[] = [];
      let atual = new Date(date);
      atual.setHours(startHour, startMin, 0, 0);
      const end = new Date(date);
      end.setHours(endHour, endMin, 0, 0);
      while (atual <= end) {
        horariosGerados.push(atual.toTimeString().slice(0, 5));
        atual = new Date(atual.getTime() + slot * 60000);
      }
      const ocupados = (consultas || []).map((c: any) =>
        String(c.scheduled_at).split("T")[1]?.slice(0, 5)
      );
      const livres = horariosGerados.filter((h) => !ocupados.includes(h));
      setAvailableTimes(livres);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao carregar horários." });
    } finally {
      setLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchAvailableSlots(selectedDoctor, selectedDate);
  }, [selectedDoctor, selectedDate, fetchAvailableSlots]);

  // 🔹 Submeter agendamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isSecretaryLike = ["secretaria", "admin", "gestor"].includes(role);
    const patientId = isSecretaryLike ? selectedPatient : userId;

    if (!patientId || !selectedDoctor || !selectedDate || !selectedTime) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos." });
      return;
    }

    try {
      const body = {
        doctor_id: selectedDoctor,
        patient_id: patientId,
        scheduled_at: `${selectedDate}T${selectedTime}:00`,
        duration_minutes: Number(duracao),
        notes,
        appointment_type: tipoConsulta,
      };

      await appointmentsService.create(body);
        const dateFormatted = selectedDate.split("-").reverse().join("/");
        toast({
          title: "Consulta agendada!",
          description: `Consulta marcada para ${dateFormatted} às ${selectedTime} com o(a) médico(a) ${
            doctors.find((d) => d.id === selectedDoctor)?.full_name || ""
          }.`,
      });

      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setSelectedPatient("");
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao agendar consulta." });
    }
  };

  // 🔹 Tooltip no calendário
  useEffect(() => {
    const cont = calendarRef.current;
    if (!cont) return;
    const onMove = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const btn = target?.closest("button");
      if (!btn) return setTooltip(null);
      const aria = btn.getAttribute("aria-label") || btn.textContent || "";
      const parsed = new Date(aria);
      if (isNaN(parsed.getTime())) return setTooltip(null);
      const key = format(getBrazilDate(parsed), "yyyy-MM-dd");
      const count = availabilityCounts[key] ?? 0;
      setTooltip({
        x: ev.pageX + 10,
        y: ev.pageY + 10,
        text: `${count} horário${count !== 1 ? "s" : ""} disponíveis`,
      });
    };
    const onLeave = () => setTooltip(null);
    cont.addEventListener("mousemove", onMove);
    cont.addEventListener("mouseleave", onLeave);
    return () => {
      cont.removeEventListener("mousemove", onMove);
      cont.removeEventListener("mouseleave", onLeave);
    };
  }, [availabilityCounts]);

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
      <h1 className="text-2xl font-semibold">Agendar Consulta</h1>

      <Card className="border rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Dados da Consulta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              {/* Se secretária/gestor/admin → mostrar campo Paciente */}
              {["secretaria", "gestor", "admin"].includes(role) && (
                <div>
                  <Label>Paciente</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Médico</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDoctors ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : (
                      doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.full_name} — {d.specialty}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Data</Label>
                <div ref={calendarRef} className="rounded-lg border p-2">
                  <CalendarShadcn
                    mode="single"
                    disabled={!selectedDoctor}
                    selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const formatted = format(new Date(date.getTime() + 12 * 60 * 60 * 1000), "yyyy-MM-dd");
                      setSelectedDate(formatted);
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Instruções para o médico..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Card className="shadow-md rounded-xl bg-blue-50 border border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">Resumo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-gray-900 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div className="text-xs">
                        {selectedDoctor
                          ? doctors.find((d) => d.id === selectedDoctor)?.full_name
                          : "Médico"}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {tipoConsulta} • {duracao} min
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Select onValueChange={setSelectedTime} disabled={loadingSlots || availableTimes.length === 0}>
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
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <StickyNote className="h-4 w-4" />
                      <div className="italic text-gray-700">{notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-full md:w-auto px-4 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700"
                  disabled={!selectedDoctor || !selectedDate || !selectedTime}
                >
                  Agendar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedDoctor("");
                    setSelectedDate("");
                    setSelectedTime("");
                    setNotes("");
                    setSelectedPatient("");
                  }}
                  className="px-3"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 60,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "6px 8px",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
