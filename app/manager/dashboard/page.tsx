"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus, User } from "lucide-react"; // Removi 'Calendar' que não estava sendo usado
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usersService } from "services/usersApi.mjs";
import { doctorsService } from "services/doctorsApi.mjs";
import Sidebar from "@/components/Sidebar";
import { api } from "services/api.mjs"; // <-- ADICIONEI ESTE IMPORT

export default function ManagerDashboard() {
  // 🔹 Estados para usuários
  const [firstUser, setFirstUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔹 Estados para médicos
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

    // 🔹 Buscar primeiro usuário (LÓGICA ATUALIZADA)
    useEffect(() => {
        async function fetchFirstUser() {
            setLoadingUser(true); // Garante que o estado de loading inicie como true
            try {
                // 1. Busca a lista de usuários com seus cargos (roles)
                const rolesData = await usersService.list_roles();

                // 2. Verifica se a lista não está vazia
                if (Array.isArray(rolesData) && rolesData.length > 0) {
                    const firstUserRole = rolesData[0];
                    const firstUserId = firstUserRole.user_id;

                    if (!firstUserId) {
                        throw new Error("O primeiro usuário da lista não possui um ID válido.");
                    }

                    // 3. Usa o ID para buscar o perfil (com nome e email) do usuário
                    const profileData = await api.get(
                        `/rest/v1/profiles?select=full_name,email&id=eq.${firstUserId}`
                    );

                    // 4. Verifica se o perfil foi encontrado
                    if (Array.isArray(profileData) && profileData.length > 0) {
                        const userProfile = profileData[0];
                        // 5. Combina os dados do cargo e do perfil e atualiza o estado
                        setFirstUser({
                            ...firstUserRole,
                            ...userProfile
                        });
                    } else {
                        // Se não encontrar o perfil, exibe os dados que temos
                        setFirstUser(firstUserRole);
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
                setFirstUser(null); // Limpa o usuário em caso de erro
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


          {/* Card 2 — Gestão de usuários */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gestão de usuários
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingUser ? (
                <div className="text-muted-foreground text-sm">
                  Carregando usuário...
                </div>
              ) : firstUser ? (
                <>
                  <div className="text-2xl font-bold">
                    {firstUser.full_name || "Sem nome"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {firstUser.email || "Sem e-mail cadastrado"}
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Nenhum usuário encontrado
                </div>
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
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/manager/home">
                <Button className="w-full justify-start">
                  <User className="mr-2 h-4 w-4" />
                  Gestão de Médicos
                </Button>
              </Link>
              <Link href="/manager/usuario">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <User className="mr-2 h-4 w-4" />
                  Usuários Cadastrados
                </Button>
              </Link>
              <Link href="/manager/home/novo">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Novo Médico
                </Button>
              </Link>
              <Link href="/manager/usuario/novo">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                >
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
              <CardDescription>
                Médicos cadastrados recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDoctors ? (
                <p className="text-sm text-muted-foreground">Carregando médicos...</p>
              ) : doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum médico cadastrado.
                </p>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {doc.full_name || "Sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {doc.specialty || "Sem especialidade"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-primary">
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
    </Sidebar>
  );
}