"use client";

import { usersService } from "services/usersApi.mjs";
import { doctorsService } from "services/doctorsApi.mjs";
import { appointmentsService } from "services/appointmentsApi.mjs";
import { AvailabilityService } from "services/availabilityApi.mjs";
import { Calendar as CalendarShadcn } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";

import { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, Clock, User, StickyNote } from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";


interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
}

interface Disponibilidade {
  id?: string;
  doctor_id?: string;
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
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
  const [availableWeekdays, setAvailableWeekdays] = useState<number[]>([]); // 1..7
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({}); // "yyyy-MM-dd" -> count

  const calendarRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // --- Helpers ---
  const getWeekdayNumber = (weekday: string) =>
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
      .indexOf(weekday.toLowerCase()) + 1; // monday=1 ... sunday=7

  const getBrazilDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));

  // --- Fetch doctors ---
  const fetchDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    try {
      const data: Doctor[] = await doctorsService.list();
      setDoctors(data || []);
    } catch (e) {
      console.error("Erro ao buscar médicos:", e);
      toast({ title: "Erro", description: "Não foi possível carregar médicos." });
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  // --- Load disponibilidades details for selected doctor and compute weekdays ---
  const loadDoctorDisponibilidades = useCallback(async (doctorId?: string) => {
    if (!doctorId) {
      setDisponibilidades([]);
      setAvailableWeekdays([]);
      setAvailabilityCounts({});
      return;
    }

    try {
      const disp: Disponibilidade[] = await AvailabilityService.listById(doctorId);
      setDisponibilidades(disp || []);
      const nums = (disp || []).map((d) => getWeekdayNumber(d.weekday)).filter(Boolean);
      setAvailableWeekdays(Array.from(new Set(nums)));
      // compute counts preview for next 90 days
      await computeAvailabilityCountsPreview(doctorId, disp || []);
    } catch (e) {
      console.error("Erro disponibilidades:", e);
      setDisponibilidades([]);
      setAvailableWeekdays([]);
      setAvailabilityCounts({});
    }
  }, []);

  // --- Compute availability counts for next 90 days (efficient) ---
  const computeAvailabilityCountsPreview = async (doctorId: string, dispList: Disponibilidade[]) => {
    try {
      const today = new Date();
      const start = format(today, "yyyy-MM-dd");
      const endDate = addDays(today, 90);
      const end = format(endDate, "yyyy-MM-dd");

      // fetch appointments for this doctor for the whole window (one call)
      const appointments = await appointmentsService.search_appointment(
        `doctor_id=eq.${doctorId}&scheduled_at=gte.${start}T00:00:00Z&scheduled_at=lt.${end}T23:59:59Z`
      );

      // group appointments by date
      const apptsByDate: Record<string, number> = {};
      (appointments || []).forEach((a: any) => {
        const d = String(a.scheduled_at).split("T")[0];
        apptsByDate[d] = (apptsByDate[d] || 0) + 1;
      });

      const counts: Record<string, number> = {};
      for (let i = 0; i <= 90; i++) {
        const d = addDays(today, i);
        const key = format(d, "yyyy-MM-dd");
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // 1..7

        // find all disponibilidades matching this weekday
        const dailyDisp = dispList.filter((p) => getWeekdayNumber(p.weekday) === dayOfWeek);

        if (dailyDisp.length === 0) {
          counts[key] = 0;
          continue;
        }

        // compute total possible slots for the day summing multiple intervals
        let possible = 0;
        dailyDisp.forEach((p) => {
          const [sh, sm] = p.start_time.split(":").map(Number);
          const [eh, em] = p.end_time.split(":").map(Number);
          const startMin = sh * 60 + sm;
          const endMin = eh * 60 + em;
          const slot = p.slot_minutes || 30;
          // inclusive handling: if start==end -> 1 slot? normally not, we do Math.floor((end - start)/slot) + 1 if end >= start
          if (endMin >= startMin) {
            possible += Math.floor((endMin - startMin) / slot) + 1;
          }
        });

        const occupied = apptsByDate[key] || 0;
        const free = Math.max(0, possible - occupied);
        counts[key] = free;
      }

      setAvailabilityCounts(counts);
    } catch (e) {
      console.error("Erro ao calcular contagens de disponibilidade:", e);
      setAvailabilityCounts({});
    }
  };

  // --- When doctor changes ---
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorDisponibilidades(selectedDoctor);
    } else {
      setDisponibilidades([]);
      setAvailableWeekdays([]);
      setAvailabilityCounts({});
    }
    setSelectedDate("");
    setSelectedTime("");
    setAvailableTimes([]);
  }, [selectedDoctor, loadDoctorDisponibilidades]);

  // --- Fetch available times for date --- (same logic, but shows toast if none)
  const fetchAvailableSlots = useCallback(
    async (doctorId: string, date: string) => {
      if (!doctorId || !date) return;
      setLoadingSlots(true);
      setAvailableTimes([]);

      try {
        const disponibilidades: Disponibilidade[] = await AvailabilityService.listById(doctorId);

        const consultas = await appointmentsService.search_appointment(
          `doctor_id=eq.${doctorId}&scheduled_at=gte.${date}T00:00:00Z&scheduled_at=lt.${date}T23:59:59Z`
        );

        const diaJS = new Date(date).getDay(); // 0..6
        const diaAPI = diaJS === 0 ? 7 : diaJS;

        const disponibilidadeDia = disponibilidades.find(
          (d) => getWeekdayNumber(d.weekday) === diaAPI
        );

        if (!disponibilidadeDia) {
          setAvailableTimes([]);
          toast({ title: "Nenhuma disponibilidade", description: "Nenhuma disponibilidade cadastrada para este dia." });
          setLoadingSlots(false);
          return;
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

        if (livres.length === 0) {
          toast({ title: "Sem horários livres", description: "Todos os horários estão ocupados neste dia." });
        }

        setAvailableTimes(livres);
      } catch (err) {
        console.error(err);
        setAvailableTimes([]);
        toast({ title: "Erro", description: "Falha ao carregar horários." });
      } finally {
        setLoadingSlots(false);
      }
    },
    []
  );

  // run fetchAvailableSlots when date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots(selectedDoctor, selectedDate);
    } else {
      setAvailableTimes([]);
    }
    setSelectedTime("");
  }, [selectedDoctor, selectedDate, fetchAvailableSlots]);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({ title: "Preencha os campos", description: "Selecione médico, data e horário." });
      return;
    }

    try {
      const doctor = doctors.find((d) => d.id === selectedDoctor);
      const paciente = await usersService.getMe();

      const body = {
        doctor_id: doctor?.id,
        patient_id: paciente.user.id,
        scheduled_at: `${selectedDate}T${selectedTime}:00`, // saving as local-ish string (you chose UTC elsewhere)
        duration_minutes: Number(duracao),
        notes,
        appointment_type: tipoConsulta,
      };

      await appointmentsService.create(body);
      toast({ title: "Agendado", description: "Consulta agendada com sucesso." });

      // reset
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setAvailableTimes([]);
      setNotes("");
      // refresh counts
      if (selectedDoctor) computeAvailabilityCountsPreview(selectedDoctor, disponibilidades);
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao agendar consulta." });
    }
  };

  // --- Calendar tooltip via event delegation ---
  useEffect(() => {
    const cont = calendarRef.current;
    if (!cont) return;

    const onMove = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      if (!target) return;
      // find closest button that likely is a day cell
      const btn = target.closest("button");
      if (!btn) {
        setTooltip(null);
        return;
      }
      // many calendar implementations put the date in aria-label, e.g. "November 13, 2025"
      const aria = btn.getAttribute("aria-label") || btn.textContent || "";
      // try to parse date from aria-label: new Date(aria) works for many locales
      const parsed = new Date(aria);
      if (isNaN(parsed.getTime())) {
        // sometimes aria-label is like "13" (just day) - try data-day attribute
        const dataDay = btn.getAttribute("data-day");
        if (dataDay) {
          // try parse yyyy-mm-dd
          const pd = new Date(dataDay);
          if (!isNaN(pd.getTime())) {
            const key = format(pd, "yyyy-MM-dd");
            const count = availabilityCounts[key] ?? 0;
            setTooltip({
              x: ev.pageX + 10,
              y: ev.pageY + 10,
              text: `${count} horário${count !== 1 ? "s" : ""} disponíveis`,
            });
            return;
          }
        }
        setTooltip(null);
        return;
      }
      // parsed is valid - convert to yyyy-MM-dd
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
    <PatientLayout>
      <div className="max-w-6xl mx-auto space-y-4 px-4">
        <h1 className="text-2xl font-semibold">Agendar Consulta</h1>

        <Card className="border rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Dados da Consulta</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              {/* LEFT */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Médico</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o médico">
                        {selectedDoctor && doctors.find(d => d.id === selectedDoctor)?.full_name}
                      </SelectValue>
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
                  <Label className="text-sm">Data</Label>
                  <div ref={calendarRef} className="rounded-lg border p-2">
                    <CalendarShadcn
                          mode="single"
                          disabled={!selectedDoctor}
                          selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (!date) return;
                            const fixedDate = new Date(date.getTime() + 12 * 60 * 60 * 1000);
                            const formatted = format(fixedDate, "yyyy-MM-dd");
                            setSelectedDate(formatted);
                          }}
                          className="rounded-md border shadow-sm p-2"
                          modifiers={{ selected: selectedDate ? new Date(selectedDate + 'T12:00:00') : undefined }}
                          modifiersClassNames={{
                            selected:
                              "bg-blue-600 text-white hover:bg-blue-700 rounded-md",
                          }}
                        />


                
                  </div>
             
              </div>

                <div>
                  <Label className="text-sm">Observações</Label>
                  <Textarea
                    placeholder="Instruções para o médico..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* RIGHT */}
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
                          {selectedDoctor ? (
                            <div className="font-medium">
                              {doctors.find((d) => d.id === selectedDoctor)?.full_name}
                            </div>
                          ) : (
                            <div className="text-gray-500">Médico</div>
                          )}
                          <div className="text-xs text-gray-500">
                            {selectedDoctor ? doctors.find(d => d.id === selectedDoctor)?.specialty : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">{tipoConsulta} • {duracao} min</div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <div>
                          {selectedDate ? (
                            <div className="font-medium">{selectedDate.split("-").reverse().join("/")}</div>
                          ) : (
                            <div className="text-gray-500">Data</div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">—</div>
                    </div>

                   {/* Horário */} 
                   <div className="space-y-2"> 
                        <Label>Horário</Label>
                       <Select onValueChange={setSelectedTime} disabled={
                        loadingSlots || availableTimes.length === 0
                        } > 
                      <SelectTrigger> <SelectValue placeholder={ 
                        loadingSlots ? "Carregando horários..." : availableTimes.length === 0 ? "Nenhum horário disponível" : "Selecione o horário"
                         } /> 
                         </SelectTrigger> 
                         <SelectContent> {
                         availableTimes.map((h) => ( <SelectItem key={h} value={h}> {h} </SelectItem> ))
                         } </SelectContent>
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
                      setAvailableTimes([]);
                      setNotes("");
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

        {/* Tooltip element */}
        {tooltip && (
          <div
            ref={tooltipRef}
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
    </PatientLayout>
  );
}
