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
import { doctorsService } from "@/services/doctorsApi.mjs";

import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Calendar, Trash2 } from "lucide-react";
import { AvailabilityEditModal } from "@/components/ui/availability-edit-modal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
                                            <span className="whitespace-nowrap text-sm">Sábado</span>
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

                    <div className="flex justify-between gap-4">
                        <Link href="/doctor/disponibilidade/excecoes">
                            <Button variant="default">Adicionar Exceção</Button>
                        </Link>
                        <div>
                            <Link href="/doctor/dashboard">
                                <Button variant="outline">Cancelar</Button>
                            </Link>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                Salvar Disponibilidade
                            </Button>
                        </div>
                    </div>
                </form>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Horário Semanal</CardTitle>
                            <CardDescription>Confira ou altere a sua disponibilidade da semana</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 grid md:grid-cols-7 gap-2">
                            {["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => {
                                const times = schedule[day] || [];
                                return (
                                    <div key={day} className="space-y-4">
                                        <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div>
                                                <p className="font-medium capitalize">{weekdaysPT[day]}</p>
                                            </div>
                                            <div className="text-center">
                                                {times.length > 0 ? (
                                                    times.map((t, i) => (
                                                        <div key={i}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <p  className="text-sm text-gray-600 hover:text-accent-foreground hover:bg-gray-200">
                                                                        {formatTime(t.start)} <br /> {formatTime(t.end)}
                                                                    </p>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleOpenModal(t, day)}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                    onClick={() => openDeleteDialog(t, day)}
                                                                    className="text-red-600">
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
            
        </DoctorLayout>
    );
}
