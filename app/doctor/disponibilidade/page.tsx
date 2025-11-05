"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DoctorLayout from "@/components/doctor-layout";
import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function AvailabilityPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");
    const doctorIdTemp = "3bb9ee4a-cfdd-4d81-b628-383907dfa225";
    const [modalidadeConsulta, setModalidadeConsulta] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await AvailabilityService.list();
                console.log(response);
            } catch (e: any) {
                alert(`${e?.error} ${e?.message}`);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const apiPayload = {
            doctor_id: doctorIdTemp,
            created_by: doctorIdTemp,
            weekday: (formData.get("weekday") as string) || undefined,
            start_time: (formData.get("horarioEntrada") as string) || undefined,
            end_time: (formData.get("horarioSaida") as string) || undefined,
            slot_minutes: Number(formData.get("duracaoConsulta")) || undefined,
            appointment_type: modalidadeConsulta || undefined,
            active: true,
        };
        console.log(apiPayload);

        try {
            const res = await AvailabilityService.create(apiPayload);
            console.log(res);

            let message = "disponibilidade cadastrada com sucesso";
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
            router.push("#"); // adicionar página para listar a disponibilidade
        } catch (err: any) {
            toast({
                title: "Erro",
                description: err?.message || "Não foi possível cadastrar o paciente",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DoctorLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Definir Disponibilidade</h1>
                        <p className="text-gray-600">Defina sua disponibilidade para consultas </p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados </h2>

                        <div className="space-y-6">
                            {/* Ajuste de responsividade: removemos o grid para os dias da semana e focamos no div interno */}
                            <div> 
                                <Label className="text-sm font-medium text-gray-700">Dia Da Semana</Label>
                                {/* NOVO: Grid responsivo para os radio buttons dos dias da semana */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-x-2 gap-y-1 mt-2">
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="monday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Segunda</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="tuesday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Terça</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="wednesday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Quarta</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="thursday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Quinta</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="friday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Sexta</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="saturday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Sábado</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input type="radio" name="weekday" value="sunday" className="text-blue-600" />
                                        <span className="whitespace-nowrap text-sm">Domingo</span>
                                    </label>
                                </div>
                            </div>

                            {/* NOVO: Grid responsivo para os campos de horário e duração */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
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
                                <div>
                                    <Label htmlFor="duracaoConsulta" className="text-sm font-medium text-gray-700">
                                        Duração Da Consulta (min)
                                    </Label>
                                    <Input type="number" id="duracaoConsulta" name="duracaoConsulta" required className="mt-1" />
                                </div>
                                {/* A modalidade de consulta agora vai ocupar o espaço restante na linha ou ficar embaixo, dependendo do grid */}
                            </div>

                            <div>
                                <Label htmlFor="modalidadeConsulta" className="text-sm font-medium text-gray-700">
                                    Modalidade De Consulta
                                </Label>
                                <Select onValueChange={(value) => setModalidadeConsulta(value)} value={modalidadeConsulta}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="presencial">Presencial </SelectItem>
                                        <SelectItem value="telemedicina">Telemedicina</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* NOVO: Ajuste de responsividade para os botões */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
                        <Link href="/doctor/disponibilidade/excecoes">
                            <Button variant="outline" className="w-full sm:w-auto">Adicionar Exceção</Button>
                        </Link>
                        <Link href="/doctor/dashboard">
                            <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                        </Link>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                            Salvar Disponibilidade
                        </Button>
                    </div>
                </form>
            </div>
        </DoctorLayout>
    );
}