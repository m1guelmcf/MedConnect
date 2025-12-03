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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarShadcn } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { User, StickyNote, CalendarDays, Stethoscope, Check, ChevronsUpDown } from "lucide-react";
import { smsService } from "@/services/Sms.mjs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Importações do Combobox ---
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ScheduleForm() {
  // --- ESTADOS ---
  const [role, setRole] = useState<string>("paciente");
  const [userId, setUserId] = useState<string | null>(null);

  // Estados de Paciente
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [openPatientCombobox, setOpenPatientCombobox] = useState(false);

  // Estados de Médico
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [openDoctorCombobox, setOpenDoctorCombobox] = useState(false);

  // Estados de Agendamento
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Configurações
  const [tipoConsulta] = useState("presencial");
  const [duracao] = useState("30");
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [availabilityCounts, setAvailabilityCounts] = useState<Record<string, number>>({});
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  
  const calendarRef = useRef<HTMLDivElement | null>(null);

  // --- HELPER FUNCTIONS ---
  const getWeekdayNumber = (weekday: string) =>
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(weekday.toLowerCase()) + 1;

  const getBrazilDate = (date: Date) =>
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));

  // --- EFFECTS ---
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
      const disponibilidadeDia = disponibilidades.find((d: any) => getWeekdayNumber(d.weekday) === diaAPI);
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
      const ocupados = (consultas || []).map((c: any) => String(c.scheduled_at).split("T")[1]?.slice(0, 5));
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

  // --- SUBMIT ---
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
        description: `Consulta marcada para ${dateFormatted} às ${selectedTime}.`,
      });

      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setNotes("");
      setSelectedPatient("");
    } catch (err) {
      console.error("❌ Erro ao agendar consulta:", err);
      toast({ title: "Erro", description: "Falha ao agendar consulta." });
    }
  };

  // --- TOOLTIP ---
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
    <div className="w-full min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Agendar Consulta
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Preencha os dados abaixo para marcar seu horário.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
          
          {/* == ESQUERDA == */}
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* BLOCO 1: SELEÇÃO */}
              <Card className="h-full border shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-primary" />
                        Dados da Consulta
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                  
                  {/* COMBOBOX DE PACIENTE */}
                  {["secretaria", "gestor", "admin"].includes(role) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selecione o Paciente</Label>
                      
                      <Popover open={openPatientCombobox} onOpenChange={setOpenPatientCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPatientCombobox}
                            className="w-full justify-between"
                          >
                            {selectedPatient
                              ? patients.find((p) => p.id === selectedPatient)?.full_name
                              : "Buscar paciente..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        
                        {/* AQUI: align="start" e w igual ao trigger garantem que não invada a lateral */}
                        <PopoverContent 
                          className="w-[--radix-popover-trigger-width] min-w-0 p-0" 
                          align="start"
                          side="bottom"
                        >
                          <Command>
                            <CommandInput placeholder="Procurar paciente..." />
                            
                            {/* AQUI: max-h-[130px] no mobile deixa a lista bem compacta */}
                            <CommandList className="max-h-[130px] md:max-h-[300px] overflow-y-auto">
                              <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
                              <CommandGroup>
                                {patients.map((p) => (
                                  <CommandItem
                                    key={p.id}
                                    value={p.full_name}
                                    onSelect={() => {
                                      setSelectedPatient(p.id === selectedPatient ? "" : p.id);
                                      setOpenPatientCombobox(false);
                                    }}
                                    className="text-xs md:text-sm py-1.5 md:py-2"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3 w-3 md:h-4 md:w-4",
                                        selectedPatient === p.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <span className="truncate">{p.full_name}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* COMBOBOX DE MÉDICO */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selecione o Médico</Label>
                    
                    <Popover open={openDoctorCombobox} onOpenChange={setOpenDoctorCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openDoctorCombobox}
                          className="w-full justify-between"
                          disabled={loadingDoctors}
                        >
                          {loadingDoctors ? "Carregando..." : (
                            selectedDoctor
                            ? doctors.find((doctor) => doctor.id === selectedDoctor)?.full_name
                            : "Buscar médico..."
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      {/* AQUI: Configurações de largura e posicionamento corrigidos */}
                      <PopoverContent 
                        className="w-[--radix-popover-trigger-width] min-w-0 p-0" 
                        align="start"
                        side="bottom"
                      >
                        <Command>
                          <CommandInput placeholder="Procurar médico..." />
                          
                          {/* AQUI: Altura reduzida no mobile */}
                          <CommandList className="max-h-[130px] md:max-h-[300px] overflow-y-auto">
                            <CommandEmpty>Nenhum médico encontrado.</CommandEmpty>
                            <CommandGroup>
                              {doctors.map((doctor) => (
                                <CommandItem
                                  key={doctor.id}
                                  value={doctor.full_name}
                                  onSelect={() => {
                                    setSelectedDoctor(doctor.id === selectedDoctor ? "" : doctor.id);
                                    setOpenDoctorCombobox(false);
                                  }}
                                  className="text-xs md:text-sm py-1.5 md:py-2"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-3 w-3 md:h-4 md:w-4",
                                      selectedDoctor === doctor.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col truncate">
                                    <span className="truncate font-medium">{doctor.full_name}</span>
                                    <span className="text-[10px] md:text-xs text-muted-foreground truncate">{doctor.specialty}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    <p className="text-xs text-muted-foreground mt-1">
                        Digite para filtrar por nome.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* BLOCO 2: CALENDÁRIO */}
              <Card className="h-full border shadow-sm flex flex-col">
                <CardHeader className="pb-3 border-b bg-muted/20">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        Data Disponível
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center pt-4 pb-4">
                  <div ref={calendarRef} className="flex justify-center w-full overflow-x-auto">
                    <CalendarShadcn
                      mode="single"
                      disabled={!selectedDoctor}
                      selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        const formatted = format(new Date(date.getTime() + 12 * 60 * 60 * 1000), "yyyy-MM-dd");
                        setSelectedDate(formatted);
                      }}
                      className="rounded-md border p-3 w-fit"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BLOCO 3: OBSERVAÇÕES */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/20">
                <CardTitle className="text-base flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-primary" />
                    Observações (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Textarea
                  placeholder="Instruções especiais, sintomas ou motivos da consulta..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="resize-none w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* == DIREITA == */}
          <div className="w-full">
            <div className="xl:sticky xl:top-6">
                <Card className="border-2 border-primary shadow-lg h-full flex flex-col">
                <CardHeader className="pb-4 border-b border-primary/20 bg-primary/5">
                    <CardTitle className="text-primary flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Resumo da Consulta
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-5 flex-1">
                    
                    <div className="grid grid-cols-2 gap-4 xl:grid-cols-1">
                        <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Médico</p>
                        <p className="text-sm font-semibold text-foreground break-words">
                            {selectedDoctor ? doctors.find((d) => d.id === selectedDoctor)?.full_name : "—"}
                        </p>
                        </div>
                        <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Data</p>
                        <p className="text-sm font-semibold text-foreground">
                            {selectedDate ? format(new Date(selectedDate + "T12:00:00"), "dd/MM/yyyy") : "—"}
                        </p>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                    <Label htmlFor="time-select" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Horário da Sessão
                    </Label>
                    <Select
                        value={selectedTime}
                        onValueChange={setSelectedTime}
                        disabled={loadingSlots || availableTimes.length === 0}
                    >
                        <SelectTrigger id="time-select" className="bg-white w-full border-primary/30 focus:ring-primary">
                        <SelectValue
                            placeholder={
                            loadingSlots ? "Carregando..." : availableTimes.length === 0 ? "Selecione uma data" : "Escolha o horário"
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

                    <div className="pt-4 border-t border-dashed space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium capitalize">{tipoConsulta}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duração estimada:</span>
                        <span className="font-medium">{duracao} min</span>
                    </div>
                    </div>

                    <div className="pt-4 space-y-3 mt-auto">
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md py-6 h-auto text-base transition-all"
                        disabled={!selectedDoctor || !selectedDate || !selectedTime}
                    >
                        Confirmar Agendamento
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                        setSelectedDoctor("");
                        setSelectedDate("");
                        setSelectedTime("");
                        setNotes("");
                        setSelectedPatient("");
                        }}
                        className="w-full text-muted-foreground hover:text-destructive"
                    >
                        Limpar Formulário
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </div>
          </div>

        </div>
      </div>

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            zIndex: 60,
            background: "rgba(0,0,0,0.85)",
            color: "white",
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            pointerEvents: "none",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}