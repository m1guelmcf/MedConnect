// ARQUIVO COMPLETO PARA: app/patient/profile/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import PatientLayout from "@/components/patient-layout";
import { useAuthLayout } from "@/hooks/useAuthLayout";
import { patientsService } from "@/services/patientsApi.mjs";
import { api } from "@/services/api.mjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const { user, isLoading: isAuthLoading } = useAuthLayout({ requiredRole: 'patient' });
  const [patientData, setPatientData] = useState<PatientProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      const fetchPatientDetails = async () => {
        try {
          const patientDetails = await patientsService.getById(user.id);
          setPatientData({
            name: patientDetails.full_name || user.name,
            email: user.email,
            phone: patientDetails.phone_mobile || '',
            cpf: patientDetails.cpf || '',
            birthDate: patientDetails.birth_date || '',
            cep: patientDetails.cep || '',
            street: patientDetails.street || '',
            number: patientDetails.number || '',
            city: patientDetails.city || '',
            avatarFullUrl: user.avatarFullUrl,
          });
        } catch (error) {
          console.error("Erro ao buscar detalhes do paciente:", error);
          toast({ title: "Erro", description: "Não foi possível carregar seus dados completos.", variant: "destructive" });
        }
      };
      fetchPatientDetails();
    }
  }, [user]);

  const handleInputChange = (field: keyof PatientProfileData, value: string) => {
    setPatientData((prev) => (prev ? { ...prev, [field]: value } : null));
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
      toast({ title: "Sucesso!", description: "Seus dados foram atualizados." });
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast({ title: "Erro", description: "Não foi possível salvar suas alterações.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split('.').pop();
    
    // *** A CORREÇÃO ESTÁ AQUI ***
    // O caminho salvo no banco de dados não deve conter o nome do bucket.
    const filePath = `${user.id}/avatar.${fileExt}`;

    try {
      await api.storage.upload('avatars', filePath, file);
      await api.patch(`/rest/v1/profiles?id=eq.${user.id}`, { avatar_url: filePath });

      const newFullUrl = `https://yuanqfswhberkoevtmfr.supabase.co/storage/v1/object/public/avatars/${filePath}?t=${new Date().getTime()}`;
      setPatientData(prev => prev ? { ...prev, avatarFullUrl: newFullUrl } : null);

      toast({ title: "Sucesso!", description: "Sua foto de perfil foi atualizada." });
    } catch (error) {
      console.error("Erro no upload do avatar:", error);
      toast({ title: "Erro de Upload", description: "Não foi possível enviar sua foto.", variant: "destructive" });
    }
  };

  if (isAuthLoading || !patientData) {
    return <PatientLayout><div>Carregando seus dados...</div></PatientLayout>;
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Dados</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))} disabled={isSaving}>
            {isEditing ? (isSaving ? "Salvando..." : "Salvar Alterações") : "Editar Dados"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center"><User className="mr-2 h-5 w-5" />Informações Pessoais</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Nome Completo</Label><Input id="name" value={patientData.name} onChange={(e) => handleInputChange("name", e.target.value)} disabled={!isEditing} /></div>
                  <div><Label htmlFor="cpf">CPF</Label><Input id="cpf" value={patientData.cpf} onChange={(e) => handleInputChange("cpf", e.target.value)} disabled={!isEditing} /></div>
                </div>
                <div><Label htmlFor="birthDate">Data de Nascimento</Label><Input id="birthDate" type="date" value={patientData.birthDate} onChange={(e) => handleInputChange("birthDate", e.target.value)} disabled={!isEditing} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5" />Contato e Endereço</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={patientData.email} disabled /></div>
                  <div><Label htmlFor="phone">Telefone</Label><Input id="phone" value={patientData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} disabled={!isEditing} /></div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    <div><Label htmlFor="cep">CEP</Label><Input id="cep" value={patientData.cep} onChange={(e) => handleInputChange("cep", e.target.value)} disabled={!isEditing} /></div>
                    <div className="md:col-span-2"><Label htmlFor="street">Rua / Logradouro</Label><Input id="street" value={patientData.street} onChange={(e) => handleInputChange("street", e.target.value)} disabled={!isEditing} /></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="number">Número</Label><Input id="number" value={patientData.number} onChange={(e) => handleInputChange("number", e.target.value)} disabled={!isEditing} /></div>
                    <div><Label htmlFor="city">Cidade</Label><Input id="city" value={patientData.city} onChange={(e) => handleInputChange("city", e.target.value)} disabled={!isEditing} /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Resumo do Perfil</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-16 h-16 cursor-pointer" onClick={handleAvatarClick}>
                      <AvatarImage src={patientData.avatarFullUrl} />
                      <AvatarFallback className="text-2xl">{patientData.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/80" onClick={handleAvatarClick}>
                      <Upload className="w-3 h-3" />
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/png, image/jpeg" />
                  </div>
                  <div>
                    <p className="font-medium">{patientData.name}</p>
                    <p className="text-sm text-gray-500">Paciente</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center text-sm"><Mail className="mr-2 h-4 w-4 text-gray-500" /><span className="truncate">{patientData.email}</span></div>
                  <div className="flex items-center text-sm"><Phone className="mr-2 h-4 w-4 text-gray-500" /><span>{patientData.phone || "Não informado"}</span></div>
                  <div className="flex items-center text-sm"><Calendar className="mr-2 h-4 w-4 text-gray-500" /><span>{patientData.birthDate ? new Date(patientData.birthDate).toLocaleDateString("pt-BR", { timeZone: 'UTC' }) : "Não informado"}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}