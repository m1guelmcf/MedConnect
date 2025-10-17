"use client";

import ManagerLayout from "@/components/manager-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, User } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usersService } from "services/usersApi.mjs";
import { doctorsService } from "services/doctorsApi.mjs";

export default function ManagerDashboard() {
    // 🔹 Estados para usuários
    const [firstUser, setFirstUser] = useState<any>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // 🔹 Estados para médicos
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);

    // 🔹 Buscar primeiro usuário
    useEffect(() => {
        async function fetchFirstUser() {
            try {
                const data = await usersService.list_roles();
                if (Array.isArray(data) && data.length > 0) {
                    setFirstUser(data[0]);
                }
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
            } finally {
                setLoadingUser(false);
            }
        }

        fetchFirstUser();
    }, []);

    // 🔹 Buscar 3 primeiros médicos
    useEffect(() => {
        async function fetchDoctors() {
            try {
                const data = await doctorsService.list(); // ajuste se seu service tiver outro método
                if (Array.isArray(data)) {
                    setDoctors(data.slice(0, 3)); // pega os 3 primeiros
                }
            } catch (error) {
                console.error("Erro ao carregar médicos:", error);
            } finally {
                setLoadingDoctors(false);
            }
        }

        fetchDoctors();
    }, []);

    return (
        <ManagerLayout>
            <div className="space-y-6">
                {/* Cabeçalho */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Bem-vindo ao seu portal de consultas médicas</p>
                </div>

                {/* Cards principais */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Relatórios gerenciais</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">Relatórios disponíveis</p>
                        </CardContent>
                    </Card>

                    {/* Card 2 — Gestão de usuários */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gestão de usuários</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loadingUser ? (
                                <div className="text-gray-500 text-sm">Carregando usuário...</div>
                            ) : firstUser ? (
                                <>
                                    <div className="text-2xl font-bold">{firstUser.full_name || "Sem nome"}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {firstUser.email || "Sem e-mail cadastrado"}
                                    </p>
                                </>
                            ) : (
                                <div className="text-sm text-gray-500">Nenhum usuário encontrado</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Card 3 — Perfil */}
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

                {/* Cards secundários */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Card — Ações rápidas */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ações Rápidas</CardTitle>
                            <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/manager/home">
                                <Button className="w-full justify-start">
                                    <User className="mr-2 h-4 w-4" />
                                    Gestão de Médicos
                                </Button>
                            </Link>
                            <Link href="/manager/usuario">
                                <Button variant="outline" className="w-full justify-start bg-transparent">
                                    <User className="mr-2 h-4 w-4" />
                                    Usuários Cadastrados
                                </Button>
                            </Link>
                            <Link href="/manager/home/novo">
                                <Button variant="outline" className="w-full justify-start bg-transparent">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Adicionar Novo Médico
                                </Button>
                            </Link>
                            <Link href="/manager/usuario/novo">
                                <Button variant="outline" className="w-full justify-start bg-transparent">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar novo Usuário
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Card — Gestão de Médicos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestão de Médicos</CardTitle>
                            <CardDescription>Médicos cadastrados recentemente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingDoctors ? (
                                <p className="text-sm text-gray-500">Carregando médicos...</p>
                            ) : doctors.length === 0 ? (
                                <p className="text-sm text-gray-500">Nenhum médico cadastrado.</p>
                            ) : (
                                <div className="space-y-4">
                                    {doctors.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                                        >
                                            <div>
                                                <p className="font-medium">{doc.full_name || "Sem nome"}</p>
                                                <p className="text-sm text-gray-600">
                                                    {doc.specialty || "Sem especialidade"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-green-700">
                                                    {doc.active ? "Ativo" : "Inativo"}
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
        </ManagerLayout>
    );
}
