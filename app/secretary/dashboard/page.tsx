"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { patientsService } from "@/services/patientsApi.mjs";
import { appointmentsService } from "@/services/appointmentsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function SecretaryDashboard() {
  // Estados
  const [patients, setPatients] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const [firstConfirmed, setFirstConfirmed] = useState<any>(null);
  const [nextAgendada, setNextAgendada] = useState<any>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // 🔹 Buscar pacientes
  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await patientsService.list();
        if (Array.isArray(data)) {
          setPatients(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Erro ao carregar pacientes:", error);
      } finally {
        setLoadingPatients(false);
      }
    }
    fetchPatients();
  }, []);

  // 🔹 Buscar consultas (confirmadas + 1ª do mês)
  useEffect(() => {
    async function fetchAppointments() {
      try {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        // Mesmo parâmetro de ordenação da página /secretary/appointments
        const queryParams = "order=scheduled_at.desc";
        const data = await appointmentsService.search_appointment(queryParams);

        if (!Array.isArray(data) || data.length === 0) {
          setFirstConfirmed(null);
          setNextAgendada(null);
          return;
        }

        // 🩵 1️⃣ Consultas confirmadas (para o card “Próxima Consulta Confirmada”)
        const confirmadas = data.filter((apt: any) => {
          const dataConsulta = new Date(apt.scheduled_at || apt.date);
          return apt.status === "confirmed" && dataConsulta >= hoje;
        });

        confirmadas.sort(
          (a: any, b: any) =>
            new Date(a.scheduled_at || a.date).getTime() -
            new Date(b.scheduled_at || b.date).getTime()
        );

        setFirstConfirmed(confirmadas[0] || null);

        // 💙 2️⃣ Consultas deste mês — pegar sempre a 1ª (mais próxima)
        const consultasMes = data.filter((apt: any) => {
          const dataConsulta = new Date(apt.scheduled_at);
          return dataConsulta >= inicioMes && dataConsulta <= fimMes;
        });

        if (consultasMes.length > 0) {
          consultasMes.sort(
            (a: any, b: any) =>
              new Date(a.scheduled_at).getTime() -
              new Date(b.scheduled_at).getTime()
          );
          setNextAgendada(consultasMes[0]);
        } else {
          setNextAgendada(null);
        }
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
      } finally {
        setLoadingAppointments(false);
      }
    }

    fetchAppointments();
  }, []);

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu portal de consultas médicas
          </p>
        </div>

        {/* Cards principais */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Próxima Consulta Confirmada */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Próxima Consulta Confirmada
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="text-muted-foreground text-sm">
                  Carregando próxima consulta...
                </div>
              ) : firstConfirmed ? (
                <>
                  <div className="text-2xl font-bold">
                    {new Date(
                      firstConfirmed.scheduled_at || firstConfirmed.date
                    ).toLocaleDateString("pt-BR")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {firstConfirmed.doctor_name
                      ? `Dr(a). ${firstConfirmed.doctor_name}`
                      : "Médico não informado"}{" "}
                    -{" "}
                    {new Date(firstConfirmed.scheduled_at).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhuma consulta confirmada encontrada
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultas Este Mês */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas Este Mês
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="text-muted-foreground text-sm">
                  Carregando consultas...
                </div>
              ) : nextAgendada ? (
                <>
                  <div className="text-lg font-bold">
                    {new Date(nextAgendada.scheduled_at).toLocaleDateString(
                      "pt-BR",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }
                    )}{" "}
                    às{" "}
                    {new Date(nextAgendada.scheduled_at).toLocaleTimeString(
                      "pt-BR",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nextAgendada.doctor_name
                      ? `Dr(a). ${nextAgendada.doctor_name}`
                      : "Médico não informado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {nextAgendada.patient_name
                      ? `Paciente: ${nextAgendada.patient_name}`
                      : ""}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhuma consulta agendada neste mês
                </div>
              )}
            </CardContent>
          </Card>

          {/* Perfil */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Dados completos</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards Secundários */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/secretary/schedule">
                <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                  <User className="mr-2 h-4 w-4" />
                  Agendar Nova Consulta
                </Button>
              </Link>
              <Link href="/secretary/appointments">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Consultas
                </Button>
              </Link>
              <Link href="/secretary/pacientes">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <User className="mr-2 h-4 w-4" />
                  Gerenciar Pacientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pacientes */}
          <Card>
            <CardHeader>
              <CardTitle>Pacientes</CardTitle>
              <CardDescription>Últimos pacientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPatients ? (
                <p className="text-sm text-muted-foreground">Carregando pacientes...</p>
              ) : patients.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum paciente cadastrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {patient.full_name || "Sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {patient.phone_mobile ||
                            patient.phone1 ||
                            "Sem telefone"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
                          {patient.convenio || "Particular"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  );
}
