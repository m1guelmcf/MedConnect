"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/Sidebar";
import WeeklyScheduleCard from "@/components/ui/WeeklyScheduleCard";

import { useEffect, useState, useMemo } from "react";

import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

type Doctor = {
    id: string;
    full_name: string;
    specialty: string;
    active: boolean;
};

type Availability = {
    id: string;
    doctor_id: string;
    weekday: string;
    start_time: string;
    end_time: string;
};

export default function AllAvailabilities() {
    const [availabilities, setAvailabilities] = useState<Availability[] | null>(null);
    const [doctors, setDoctors] = useState<Doctor[] | null>(null);

    // 🔎 Filtros
    const [search, setSearch] = useState("");
    const [specialty, setSpecialty] = useState("all");

    // 🔄 Paginação
    const ITEMS_PER_PAGE = 6;
    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const doctorsList = await doctorsService.list();
                setDoctors(doctorsList);

                const availabilityList = await AvailabilityService.list();
                setAvailabilities(availabilityList);
            } catch (e: any) {
                alert(`${e?.error} ${e?.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 🎯 Obter todas as especialidades existentes
    const specialties = useMemo(() => {
        if (!doctors) return [];
        const unique = Array.from(new Set(doctors.map((d) => d.specialty)));
        return unique;
    }, [doctors]);

    // 🔍 Filtrar médicos por especialidade + nome
    const filteredDoctors = useMemo(() => {
        if (!doctors) return [];

        return doctors.filter((doctor) => (specialty === "all" ? true : doctor.specialty === specialty)).filter((doctor) => doctor.full_name.toLowerCase().includes(search.toLowerCase()));
    }, [doctors, search, specialty]);

    // 📄 Paginação (após filtros!)
    const totalPages = Math.ceil(filteredDoctors.length / ITEMS_PER_PAGE);
    const paginatedDoctors = filteredDoctors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const goNext = () => setPage((p) => Math.min(p + 1, totalPages));
    const goPrev = () => setPage((p) => Math.max(p - 1, 1));

    if (loading) {
        return (
            <Sidebar>
                <div className="p-6 text-muted-foreground">Carregando dados...</div>
            </Sidebar>
        );
    }

    if (!doctors || !availabilities) {
        return (
            <Sidebar>
                <div className="p-6 text-destructive font-medium">Não foi possível carregar médicos ou disponibilidades.</div>
            </Sidebar>
        );
    }

    return (
        <Sidebar>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Disponibilidade dos Médicos</h1>
                    <p className="text-muted-foreground">Visualize a agenda semanal individual de cada médico.</p>
                </div>
                <Card>
                    <CardContent>
                        {/* 🔎 Filtros */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            {/* Filtro por nome */}
                            <Filter className="w-4 h-4 mr-2" />
                            <Input
                                placeholder="Buscar por nome do médico..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full md:w-1/3"
                            />

                            {/* Filtro por especialidade */}
                            <Select
                                onValueChange={(value) => {
                                    setSpecialty(value);
                                    setPage(1);
                                }}
                                defaultValue="all"
                            >
                                <SelectTrigger className="w-full md:w-64">
                                    <SelectValue placeholder="Especialidade" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">Todas as especialidades</SelectItem>
                                    {specialties.map((sp) => (
                                        <SelectItem key={sp} value={sp}>
                                            {sp}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                {/* GRID de cards */}
                <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-6">
                    {paginatedDoctors.map((doctor) => {
                        const doctorAvailabilities = availabilities.filter((a) => a.doctor_id === doctor.id);

                        return (
                            <Card key={doctor.id}>
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold">{doctor.full_name}</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <WeeklyScheduleCard doctorId={doctor.id} />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* 📄 Paginação */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-4">
                        <Button variant="outline" onClick={goPrev} disabled={page === 1}>
                            Anterior
                        </Button>

                        <span className="text-muted-foreground font-medium">
                            Página {page} de {totalPages}
                        </span>

                        <Button variant="outline" onClick={goNext} disabled={page === totalPages}>
                            Próxima
                        </Button>
                    </div>
                )}
            </div>
        </Sidebar>
    );
}
