"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AvailabilityService } from "@/services/availabilityApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";

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

interface WeeklyScheduleProps {
    doctorId?: string;
}

export default function WeeklyScheduleCard({ doctorId }: WeeklyScheduleProps) {
    const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }[]>>({});
    const [loading, setLoading] = useState(true);

    const weekdaysPT: Record<string, string> = {
        sunday: "Domingo",
        monday: "Segunda",
        tuesday: "Terça",
        wednesday: "Quarta",
        thursday: "Quinta",
        friday: "Sexta",
        saturday: "Sábado",
    };

    const formatTime = (time?: string | null) => time?.split(":")?.slice(0, 2).join(":") ?? "";

    function formatAvailability(data: Availability[]) {
        const grouped = data.reduce((acc: any, item) => {
            const { weekday, start_time, end_time } = item;

            if (!acc[weekday]) acc[weekday] = [];

            acc[weekday].push({ start: start_time, end: end_time });

            return acc;
        }, {});

        return grouped;
    }

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const availabilityList = await AvailabilityService.list();

                const filtered = availabilityList.filter((a: Availability) => a.doctor_id == doctorId);

                const formatted = formatAvailability(filtered);
                setSchedule(formatted);
            } catch (err) {
                console.error("Erro ao carregar horários:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return (
        <div className="space-y-4 grid md:grid-cols-7 gap-2">
            {loading ? (
                <p className="text-sm text-gray-500 col-span-7 text-center">Carregando...</p>
            ) : (
                ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "Saturday"].map((day) => {
                    const times = schedule[day] || [];
                    return (
                        <div key={day} className="space-y-4">
                            <div className="flex flex-col items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <p className="font-medium capitalize">{weekdaysPT[day]}</p>
                                <div className="text-center">
                                    {times.length > 0 ? (
                                        times.map((t, i) => (
                                            <p key={i} className="text-sm text-gray-600">
                                                {formatTime(t.start)} <br /> {formatTime(t.end)}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Sem horário</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
