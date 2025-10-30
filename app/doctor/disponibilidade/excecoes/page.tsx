"use client";

import type React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import DoctorLayout from "@/components/doctor-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Calendar as CalendarIcon, MapPin, Phone, User, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { exceptionsService } from "@/services/exceptionApi.mjs";

// IMPORTAR O COMPONENTE CALENDÁRIO DA SHADCN
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns"; // Usaremos o date-fns para formatação e comparação de datas
import { userInfo } from "os";

const APPOINTMENTS_STORAGE_KEY = "clinic-appointments";

// --- TIPAGEM DA CONSULTA SALVA NO LOCALSTORAGE ---
interface LocalStorageAppointment {
    id: number;
    patientName: string;
    doctor: string;
    specialty: string;
    date: string; // Data no formato YYYY-MM-DD
    time: string; // Hora no formato HH:MM
    status: "agendada" | "confirmada" | "cancelada" | "realizada";
    location: string;
    phone: string;
}

const LOGGED_IN_DOCTOR_NAME = "Dr. João Santos";

// Função auxiliar para comparar se duas datas (Date objects) são o mesmo dia
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
};

// --- COMPONENTE PRINCIPAL ---

export default function ExceptionPage() {
    const [allAppointments, setAllAppointments] = useState<LocalStorageAppointment[]>([]);
    const router = useRouter();
    const [filteredAppointments, setFilteredAppointments] = useState<LocalStorageAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    var userInfo;
    const doctorIdTemp = "3bb9ee4a-cfdd-4d81-b628-383907dfa225";
    const [tipo, setTipo] = useState<string>("");
   
    useEffect (()=>{
        userInfo = JSON.parse(localStorage.getItem("user_info") || "{}")
    })

    // NOVO ESTADO 1: Armazena os dias com consultas (para o calendário)
    const [bookedDays, setBookedDays] = useState<Date[]>([]);

    // NOVO ESTADO 2: Armazena a data selecionada no calendário
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(new Date());

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        //setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const apiPayload = {
            doctor_id: doctorIdTemp,
            created_by: doctorIdTemp,
            date: selectedCalendarDate ? format(selectedCalendarDate, "yyyy-MM-dd") : "",
            start_time: ((formData.get("horarioEntrada") + ":00") as string) || undefined,
            end_time: ((formData.get("horarioSaida") + ":00") as string) || undefined,
            kind: tipo || undefined,
            reason: formData.get("reason"),
        };
        console.log(apiPayload);
        try {
            const res = await exceptionsService.create(apiPayload);
            console.log(res);

            let message = "Exceção cadastrada com sucesso";
            try {
                if (!res[0].id) {
                    throw new Error(`${res.error} ${res.message}` || "A API retornou erro");
                } else {
                    console.log(message);
                }
            } catch {}

            toast({
                title: "Sucesso",
                description: message,
            });
            router.push("/doctor/dashboard"); // adicionar página para listar a disponibilidade
        } catch (err: any) {
            toast({
                title: "Erro",
                description: err?.message || "Não foi possível cadastrar a exceção",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const displayDate = selectedCalendarDate ? new Date(selectedCalendarDate).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) : "Selecione uma data";

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Adicione exceções</h1>
                    <p className="text-gray-600">Altere a disponibilidade em casos especiais para o Dr. João Silva</p>
                </div>

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Consultas para: {displayDate}</h2>
                    <Button disabled={isLoading} variant="outline" size="sm">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Atualizar Agenda
                    </Button>
                </div>

                {/* NOVO LAYOUT DE DUAS COLUNAS */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* COLUNA 1: CALENDÁRIO */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="mr-2 h-5 w-5" />
                                    Calendário
                                </CardTitle>
                                <p className="text-sm text-gray-500">Selecione a data desejada.</p>
                            </CardHeader>
                            <CardContent className="flex justify-center p-2">
                                <Calendar
                                    mode="single"
                                    selected={selectedCalendarDate}
                                    onSelect={setSelectedCalendarDate}
                                    autoFocus
                                    // A CHAVE DO HIGHLIGHT: Passa o array de datas agendadas
                                    modifiers={{ booked: bookedDays }}
                                    // Define o estilo CSS para o modificador 'booked'
                                    modifiersClassNames={{
                                        booked: "bg-blue-600 text-white aria-selected:!bg-blue-700 hover:!bg-blue-700/90",
                                    }}
                                    className="rounded-md border p-2"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* COLUNA 2: FORM PARA ADICIONAR EXCEÇÃO */}
                    <div className="lg:col-span-2 space-y-4">
                        {isLoading ? (
                            <p className="text-center text-lg text-gray-500">Carregando a agenda...</p>
                        ) : !selectedCalendarDate ? (
                            <p className="text-center text-lg text-gray-500">Selecione uma data.</p>
                        ) : (
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados </h2>
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-5 gap-6">
                                            <div>
                                                <Label htmlFor="horarioEntrada" className="text-sm font-medium text-gray-700">
                                                    Horario De Entrada
                                                </Label>
                                                <Input type="time" id="horarioEntrada" name="horarioEntrada" required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label htmlFor="horarioSaida" className="text-sm font-medium text-gray-700">
                                                    Horario De Saida
                                                </Label>
                                                <Input type="time" id="horarioSaida" name="horarioSaida" required className="mt-1" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                                                Tipo
                                            </Label>
                                            <Select onValueChange={(value) => setTipo(value)} value={tipo}>
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="bloqueio">Bloqueio </SelectItem>
                                                    <SelectItem value="liberacao">Liberação</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                                                Motivo
                                            </Label>
                                            <Input type="textarea" id="reason" name="reason" required className="mt-1" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4">
                                    <Link href="/doctor/disponibilidade">
                                        <Button variant="outline">Cancelar</Button>
                                    </Link>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                        Salvar Exceção
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
}
