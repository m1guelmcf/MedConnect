// Caminho: app/patient/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuthLayout } from "@/hooks/useAuthLayout";
import { patientsService } from "@/services/patientsApi.mjs";
import { usersService } from "@/services/usersApi.mjs"; // Adicionado import
import { api } from "@/services/api.mjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PatientProfileData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  cep: string;
  street: string;
  number: string;
  city: string;
  avatarFullUrl?: string;
}

export default function PatientProfile() {
  const { user, isLoading: isAuthLoading } = useAuthLayout({
    requiredRole: ["paciente", "admin", "medico", "gestor", "secretaria"],
  });

  const [patientData, setPatientData] = useState<PatientProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Função auxiliar para construir URL do avatar
  const buildAvatarUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    const baseUrl = "https://yuanqfswhberkoevtmfr.supabase.co";
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const separator = cleanPath.includes('?') ? '&' : '?';
    return `${baseUrl}/storage/v1/object/avatars/${cleanPath}${separator}t=${new Date().getTime()}`;
  };

  useEffect(() => {
    if (user?.id) {
      const loadData = async () => {
        try {
          // 1. Busca dados médicos (Tabela Patients)
          const patientDetails = await patientsService.getById(user.id);
          
          // 2. Busca dados de sistema frescos (Tabela Profiles via getMe)
          // Isso garante que pegamos o avatar real do banco, não do cache local
          const userSystemData = await usersService.getMe();
          
          const freshAvatarPath = userSystemData?.profile?.avatar_url;
          const freshAvatarUrl = buildAvatarUrl(freshAvatarPath);

          setPatientData({
            name: patientDetails.full_name || user.name,
            email: user.email,
            phone: patientDetails.phone_mobile || "",
            cpf: patientDetails.cpf || "",
            birthDate: patientDetails.birth_date || "",
            cep: patientDetails.cep || "",
            street: patientDetails.street || "",
            number: patientDetails.number || "",
            city: patientDetails.city || "",
            avatarFullUrl: freshAvatarUrl, // Usa a URL fresca do banco
          });
        } catch (error) {
          console.error("Erro ao buscar detalhes:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar seus dados completos.",
            variant: "destructive",
          });
        }
      };
      loadData();
    }
  }, [user?.id, user?.email, user?.name]); // Removi user.avatarFullUrl para não depender do cache

  const handleInputChange = (
    field: keyof PatientProfileData,
    value: string
  ) => {
    setPatientData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const updateLocalSession = (updates: { full_name?: string; avatar_url?: string }) => {
    try {
      const storedUserString = localStorage.getItem("user_info");
      if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        
        if (!storedUser.user_metadata) storedUser.user_metadata = {};
        if (updates.full_name) storedUser.user_metadata.full_name = updates.full_name;
        if (updates.avatar_url) storedUser.user_metadata.avatar_url = updates.avatar_url;
        
        if (!storedUser.profile) storedUser.profile = {};
        if (updates.full_name) storedUser.profile.full_name = updates.full_name;
        if (updates.avatar_url) storedUser.profile.avatar_url = updates.avatar_url;

        localStorage.setItem("user_info", JSON.stringify(storedUser));
      }
    } catch (e) {
      console.error("Erro ao atualizar sessão local:", e);
    }
  };

  const handleSave = async () => {
    if (!patientData || !user) return;
    setIsSaving(true);
    try {
      const patientPayload = {
        full_name: patientData.name,
        cpf: patientData.cpf,
        birth_date: patientData.birthDate,
        phone_mobile: patientData.phone,
        cep: patientData.cep,
        street: patientData.street,
        number: patientData.number,
        city: patientData.city,
      };
      
      await patientsService.update(user.id, patientPayload);
      await api.patch(`/rest/v1/profiles?id=eq.${user.id}`, {
        full_name: patientData.name,
      });
      
      updateLocalSession({ full_name: patientData.name });

      toast({
        title: "Sucesso!",
        description: "Seus dados foram atualizados. A página será recarregada.",
      });
      
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      await api.storage.upload("avatars", filePath, file);
      await api.patch(`/rest/v1/profiles?id=eq.${user.id}`, {
        avatar_url: filePath,
      });

      const newFullUrl = buildAvatarUrl(filePath);
      
      setPatientData((prev) =>
        prev ? { ...prev, avatarFullUrl: newFullUrl } : null
      );

      updateLocalSession({ avatar_url: filePath });

      toast({
        title: "Sucesso!",
        description: "Sua foto de perfil foi atualizada.",
      });

      setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      toast({
        title: "Erro de Upload",
        description: "Não foi possível enviar sua foto.",
        variant: "destructive",
      });
    }
  };

  if (isAuthLoading || !patientData) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Carregando seus dados...</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Dados</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isEditing
              ? isSaving
                ? "Salvando..."
                : "Salvar Alterações"
              : "Editar Dados"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={patientData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={patientData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={patientData.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contato e Endereço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={patientData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua / Logradouro</Label>
                    <Input
                      id="street"
                      value={patientData.street}
                      onChange={(e) =>
                        handleInputChange("street", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={patientData.number}
                      onChange={(e) =>
                        handleInputChange("number", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={patientData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative group">
                    <Avatar
                      className="w-16 h-16 cursor-pointer border-2 border-transparent group-hover:border-blue-500 transition-all"
                      onClick={handleAvatarClick}
                    >
                      <AvatarImage src={patientData.avatarFullUrl} className="object-cover" />
                      <AvatarFallback className="text-2xl bg-gray-200 text-gray-700 font-bold">
                        {getInitials(patientData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 cursor-pointer hover:bg-blue-700 shadow-md transition-colors"
                      onClick={handleAvatarClick}
                      title="Alterar foto"
                    >
                      <Upload className="w-3 h-3" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      className="hidden"
                      accept="image/png, image/jpeg, image/jpg"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{patientData.name}</p>
                    <p className="text-sm text-gray-500">Paciente</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{patientData.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{patientData.phone || "Não informado"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {patientData.birthDate
                        ? new Date(patientData.birthDate).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" }
                          )
                        : "Não informado"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}