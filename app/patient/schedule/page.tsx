"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, User } from "lucide-react";
import PatientLayout from "@/components/patient-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { doctorsService } from "services/doctorsApi.mjs";

interface Doctor {
    id: string;
    full_name: string;
    specialty: string;
    phone_mobile: string;
}

const APPOINTMENTS_STORAGE_KEY = "clinic-appointments";

export default function ScheduleAppointment() {
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");

    // novos campos
    const [tipoConsulta, setTipoConsulta] = useState("presencial");
    const [duracao, setDuracao] = useState("30");
    const [convenio, setConvenio] = useState("");
    const [queixa, setQueixa] = useState("");
    const [obsPaciente, setObsPaciente] = useState("");
    const [obsInternas, setObsInternas] = useState("");

    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: Doctor[] = await doctorsService.list();
            console.log(data);
            setDoctors(data || []);
        } catch (e: any) {
            console.error("Erro ao carregar lista de médicos:", e);
            setError("Não foi possível carregar a lista de médicos. Verifique a conexão com a API.");
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const availableTimes = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const doctorDetails = doctors.find((d) => d.id === selectedDoctor);
        const patientDetails = {
            id: "P001",
            full_name: "Paciente Exemplo Único",
            location: "Clínica Geral",
            phone: "(11) 98765-4321",
        };

        if (!patientDetails || !doctorDetails) {
            alert("Erro: Selecione o médico ou dados do paciente indisponíveis.");
            return;
        }

        const newAppointment = {
            id: new Date().getTime(),
            patientName: patientDetails.full_name,
            doctor: doctorDetails.full_name,
            specialty: doctorDetails.specialty,
            date: selectedDate,
            time: selectedTime,
            tipoConsulta,
            duracao,
            convenio,
            queixa,
            obsPaciente,
            obsInternas,
            notes,
            status: "agendada",
            phone: patientDetails.phone,
        };

        const storedAppointmentsRaw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        const currentAppointments = storedAppointmentsRaw ? JSON.parse(storedAppointmentsRaw) : [];
        const updatedAppointments = [...currentAppointments, newAppointment];
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updatedAppointments));

        alert(`Consulta com ${doctorDetails.full_name} agendada com sucesso!`);

        // resetar campos
        setSelectedDoctor("");
        setSelectedDate("");
        setSelectedTime("");
        setNotes("");
        setTipoConsulta("presencial");
        setDuracao("30");
        setConvenio("");
        setQueixa("");
        setObsPaciente("");
        setObsInternas("");
    };

    return (
        <PatientLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Agendar Consulta</h1>
                    <p className="text-gray-600">Escolha o médico, data e horário para sua consulta</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados da Consulta</CardTitle>
                                <CardDescription>Preencha as informações para agendar sua consulta</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Médico */}
                                    <div className="space-y-2">
                                        <Label htmlFor="doctor">Médico</Label>
                                        <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={loading}>
                                            <SelectTrigger id="doctor">
                                                <SelectValue placeholder="Selecione um médico" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {loading ? (
                                                    <SelectItem value="loading" disabled>
                                                        Carregando médicos...
                                                    </SelectItem>
                                                ) : error ? (
                                                    <SelectItem value="error" disabled>
                                                        Erro ao carregar
                                                    </SelectItem>
                                                ) : (
                                                    doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={doctor.id}>
                                                            {doctor.full_name} - {doctor.specialty}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Data e horário */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Data</Label>
                                            <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="time">Horário</Label>
                                            <Select value={selectedTime} onValueChange={setSelectedTime}>
                                                <SelectTrigger id="time">
                                                    <SelectValue placeholder="Selecione um horário" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableTimes.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {/* Tipo e Duração */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="tipoConsulta">Tipo de Consulta</Label>
                                            <Select value={tipoConsulta} onValueChange={setTipoConsulta}>
                                                <SelectTrigger id="tipoConsulta">
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="presencial">Presencial</SelectItem>
                                                    <SelectItem value="online">Telemedicina</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duracao">Duração (minutos)</Label>
                                            <Input id="duracao" type="number" min={10} max={120} value={duracao} onChange={(e) => setDuracao(e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Convênio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="convenio">Convênio (opcional)</Label>
                                        <Input id="convenio" placeholder="Nome do convênio do paciente" value={convenio} onChange={(e) => setConvenio(e.target.value)} />
                                    </div>

                                    {/* Queixa Principal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="queixa">Queixa Principal (opcional)</Label>
                                        <Textarea id="queixa" placeholder="Descreva brevemente o motivo da consulta..." value={queixa} onChange={(e) => setQueixa(e.target.value)} />
                                    </div>

                                    {/* Observações do Paciente */}
                                    <div className="space-y-2">
                                        <Label htmlFor="obsPaciente">Observações do Paciente (opcional)</Label>
                                        <Textarea id="obsPaciente" placeholder="Anotações relevantes informadas pelo paciente..." value={obsPaciente} onChange={(e) => setObsPaciente(e.target.value)} />
                                    </div>

                                    {/* Observações Internas */}
                                    <div className="space-y-2">
                                        <Label htmlFor="obsInternas">Observações Internas (opcional)</Label>
                                        <Textarea id="obsInternas" placeholder="Anotações para a equipe da clínica..." value={obsInternas} onChange={(e) => setObsInternas(e.target.value)} />
                                    </div>

                                    {/* Observações gerais */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Observações gerais (opcional)</Label>
                                        <Textarea id="notes" placeholder="Descreva brevemente o motivo da consulta ou observações importantes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                                    </div>

                                    {/* Botão */}
                                    <Button type="submit" className="w-full" disabled={!selectedDoctor || !selectedDate || !selectedTime}>
                                        Agendar Consulta
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Resumo */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Resumo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedDoctor && (
                                    <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{doctors.find((d) => d.id === selectedDoctor)?.full_name}</span>
                                    </div>
                                )}

                                {selectedDate && (
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{new Date(selectedDate).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                )}

                                {selectedTime && (
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm">{selectedTime}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Importantes</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-600 space-y-2">
                                <p>• Chegue com 15 minutos de antecedência</p>
                                <p>• Traga documento com foto</p>
                                <p>• Traga carteirinha do convênio</p>
                                <p>• Traga exames anteriores, se houver</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PatientLayout>
    );
}
