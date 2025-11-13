"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { usersService } from "@/services/usersApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";

import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2 } from "lucide-react";
import { AvailabilityEditModal } from "@/components/ui/availability-edit-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Sidebar from "@/components/Sidebar";

// ... (Interfaces de tipo omitidas para brevidade, pois não foram alteradas)

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

type Doctor = {
    id: string;
    user_id: string | null;
    crm: string;
    crm_uf: string;
    specialty: string;
    full_name: string;
    cpf: string;
    email: string;
    phone_mobile: string | null;
    phone2: string | null;
    cep: string | null;
    street: string | null;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string | null;
    state: string | null;
    birth_date: string | null;
    rg: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string | null;
    max_days_in_advance: number;
    rating: number | null;
}

type Availability = {
    id: string;
    doctor_id: string;
    weekday: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    appointment_type: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string | null;
};

export default function AvailabilityPage() {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }[]>>({});
    const formatTime = (time?: string | null) => time?.split(":")?.slice(0, 2).join(":") ?? "";
    const [userData, setUserData] = useState<UserData>();
    const [availability, setAvailability] = useState<any | null>(null);
    const [doctorId, setDoctorId] = useState<string>();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [modalidadeConsulta, setModalidadeConsulta] = useState<string>("");
    const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const selectAvailability = (schedule: { start: string; end: string;}, day: string) => {
        const selected = availability.filter((a: Availability) =>
            a.start_time === schedule.start &&
            a.end_time === schedule.end &&
            a.weekday === day
        );
        setSelectedAvailability(selected[0]);
    }

    const handleOpenModal = (schedule: { start: string; end: string;}, day: string) => {
        selectAvailability(schedule, day)
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setSelectedAvailability(null);
        setIsModalOpen(false);
    };

    const handleEdit = async (formData:{ start_time: "", end_time: "", slot_minutes: "", appointment_type: "", id:""}) => {
        if (isLoading) return;
        setIsLoading(true);

        const apiPayload = {
            start_time: formData.start_time,
            end_time: formData.end_time,
            slot_minutes: formData.slot_minutes,
            appointment_type: formData.appointment_type,
        };
        console.log(apiPayload);

        try {
            const res = await AvailabilityService.update(formData.id, apiPayload);
            console.log(res);

            let message = "disponibilidade editada com sucesso";
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
            router.push("#")
        } catch (err: any) {
            toast({
                title: "Erro",
                description: err?.message || "Não foi possível editar a disponibilidade",
            });
        } finally {
            setIsLoading(false);
            handleCloseModal();
            fetchData()
        }
    };

        // Mapa de tradução
    const weekdaysPT: Record<string, string> = {
        sunday: "Domingo",
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
    };
    const fetchData = async () => {
            try {
                const loggedUser = await usersService.getMe();
                const doctorList = await doctorsService.list();
                setUserData(loggedUser);
                const doctor = findDoctorById(loggedUser.user.id, doctorList);
                setDoctorId(doctor?.id);
                console.log(doctor);
                // Busca disponibilidade
                const availabilityList = await AvailabilityService.list();
            
                // Filtra já com a variável local
                const filteredAvail = availabilityList.filter(
                (disp: { doctor_id: string }) => disp.doctor_id === doctor?.id
                );
                setAvailability(filteredAvail);
            } catch (e: any) {
                alert(`${e?.error} ${e?.message}`);
            }
        };

    useEffect(() => {        
        fetchData();
    }, []);

    // Função auxiliar para filtrar o id do doctor correspondente ao user logado
    function findDoctorById(id: string, doctors: Doctor[]) {
        return doctors.find((doctor) => doctor.user_id === id);
    }
    
    
    function formatAvailability(data: Availability[]) {
        // Agrupar os horários por dia da semana
        const schedule = data.reduce((acc: any, item) => {
            const { weekday, start_time, end_time } = item;
            
            // Se o dia ainda não existe, cria o array
            if (!acc[weekday]) {
                acc[weekday] = [];
            }
            
            // Adiciona o horário do dia
            acc[weekday].push({
                start: start_time,
                end: end_time,
            });
            
            return acc;
        }, {} as Record<string, { start: string; end: string }[]>);
        
        return schedule;
    }
    
    useEffect(() => {
        if (availability) {
            const formatted = formatAvailability(availability);
            setSchedule(formatted);
        }
    }, [availability]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const apiPayload = {
            doctor_id: doctorId,
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
                description: err?.message || "Não foi possível criar a disponibilidade",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const openDeleteDialog = (schedule: { start: string; end: string;}, day: string) => {
        selectAvailability(schedule, day)
        setDeleteDialogOpen(true);
    };

    const handleDeleteAvailability = async (AvailabilityId: string) => {
            try {
                const res = await AvailabilityService.delete(AvailabilityId);
    
                let message = "Disponibilidade deletada com sucesso";
                try {
                    if (res) {
                        throw new Error(`${res.error} ${res.message}` || "A API retornou erro");
                    } else {
                        console.log(message);
                    }
                } catch {}
    
                toast({
                    title: "Sucesso",
                    description: message,
                });
    
                setAvailability((prev: Availability[]) => prev.filter((p) => String(p.id) !== String(AvailabilityId)));
            } catch (e: any) {
                toast({
                    title: "Erro",
                    description: e?.message || "Não foi possível deletar a disponibilidade",
                });
            }
            setDeleteDialogOpen(false);
            setSelectedAvailability(null);
        };

    return (
        <Sidebar>
            <div className="space-y-6 flex-1 overflow-y-auto p-6">
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
                            {/* **AJUSTE DE RESPONSIVIDADE: DIAS DA SEMANA** */}
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Dia Da Semana</Label>
                                {/* O antigo 'flex gap-4 mt-2 flex-nowrap' foi substituído por um grid responsivo: */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-x-4 gap-y-2 mt-2">
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

                            {/* **AJUSTE DE RESPONSIVIDADE: HORÁRIO E DURAÇÃO** */}
                            {/* Ajustado para 1 coluna em móvel, 2 em tablet e 5 em desktop (mantendo o que já existia com ajustes) */}
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
                                {/* O Select de modalidade fica fora deste grid para ocupar uma linha inteira em telas menores, como no original, garantindo clareza */}
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

                    {/* **AJUSTE DE RESPONSIVIDADE: BOTÕES DE AÇÃO** */}
                    {/* Alinha à direita em telas maiores e empilha (com o botão primário no final) em telas menores */}
                    {/* Alteração aqui: Adicionado w-full aos Links e Buttons para ocuparem a largura total em telas pequenas */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                        <Link href="/doctor/disponibilidade/excecoes" className="w-full sm:w-auto">
                            <Button variant="default" className="w-full sm:w-auto">Adicionar Exceção</Button>
                        </Link>
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"> {/* Ajustado para empilhar os botões Cancelar e Salvar em telas pequenas */}
                            <Link href="/doctor/dashboard" className="w-full sm:w-auto">
                                <Button variant="outline" className="w-full sm:w-auto">Cancelar</Button>
                            </Link>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                                Salvar Disponibilidade
                            </Button>
                        </div>
                    </div>
                </form>
                
                {/* **AJUSTE DE RESPONSIVIDADE: CARD DE HORÁRIO SEMANAL** */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário Semanal</CardTitle>
                            <CardDescription>Confira ou altere a sua disponibilidade da semana</CardDescription>
                        </CardHeader>
                        {/* Define um grid responsivo para os dias da semana (1 coluna em móvel, 2 em pequeno, 3 em médio e 7 em telas grandes) */}
                        <CardContent className="space-y-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                            {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => {
                                const times = schedule[day] || [];
                                return (
                                    <div key={day} className="space-y-4">
                                        <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg h-full">
                                            <p className="font-medium capitalize text-center mb-2">{weekdaysPT[day]}</p>
                                            <div className="text-center w-full">
                                                {times.length > 0 ? (
                                                    times.map((t, i) => (
                                                        <div key={i}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <p  className="text-sm text-gray-600 cursor-pointer p-1 rounded hover:text-accent-foreground hover:bg-gray-200 transition-colors duration-150">
                                                                        {formatTime(t.start)} - {formatTime(t.end)}
                                                                    </p>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleOpenModal(t, day)}>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                    onClick={() => openDeleteDialog(t, day)}
                                                                    className="text-red-600 focus:bg-red-50 focus:text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Excluir
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">Sem horário</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
                
                {/* AlertDialog e Modal de Edição (não precisam de grandes ajustes de layout, apenas garantindo que os componentes sejam responsivos internamente) */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>Tem certeza que deseja excluir esta disponibilidade? Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => selectedAvailability && handleDeleteAvailability(selectedAvailability.id)} className="bg-red-600 hover:bg-red-700">
                                    Excluir
                                </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
            <AvailabilityEditModal
                availability={selectedAvailability}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleEdit}
            />
            
        </Sidebar>
    );
}