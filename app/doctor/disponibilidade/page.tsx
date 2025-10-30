"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DoctorLayout from "@/components/doctor-layout";
import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UserPermissions {
    isAdmin: boolean;
    isManager: boolean;
    isDoctor: boolean;
    isSecretary: boolean;
    isAdminOrManager: boolean;
}

interface UserData {
    user: {
        id: string;
        email: string;
        email_confirmed_at: string | null;
        created_at: string | null;
        last_sign_in_at: string | null;
    };
    profile: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        avatar_url: string | null;
        disabled: boolean;
        created_at: string | null;
        updated_at: string | null;
    };
    roles: string[];
    permissions: UserPermissions;
}

export default function AvailabilityPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState<UserData>();
    const [modalidadeConsulta, setModalidadeConsulta] = useState<string>("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await AvailabilityService.list();
                console.log(response);
                const user = await usersService.getMe();
                console.log(user);
                setUserData(user);
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
            doctor_id: userData?.user.id,
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
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Dia Da Semana</Label>
                                    <div className="flex gap-4 mt-2 flex-nowrap">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="monday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Segunda-Feira</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="tuesday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Terça-Feira</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="wednesday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Quarta-Feira</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="thursday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Quinta-Feira</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="friday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Sexta-Feira</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="saturday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Sabado</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="weekday" value="sunday" className="text-blue-600" />
                                            <span className="whitespace-nowrap text-sm">Domingo</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

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
                                <div>
                                    <Label htmlFor="duracaoConsulta" className="text-sm font-medium text-gray-700">
                                        Duração Da Consulta (min)
                                    </Label>
                                    <Input type="number" id="duracaoConsulta" name="duracaoConsulta" required className="mt-1" />
                                </div>
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

                    <div className="flex justify-end gap-4">
                        <Link href="/doctor/disponibilidade/excecoes">
                            <Button variant="outline">Adicionar Exceção</Button>
                        </Link>
                        <Link href="/doctor/dashboard">
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Salvar Disponibilidade
                        </Button>
                    </div>
                </form>
            </div>
        </DoctorLayout>
    );
}
