// ARQUIVO COMPLETO PARA: app/manager/usuario/novo/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { usersService } from "@/services/usersApi.mjs";
import { doctorsService } from "@/services/doctorsApi.mjs";
import { login } from "services/api.mjs";
import { isValidCPF } from "@/lib/utils"; // 1. IMPORTAÇÃO DA FUNÇÃO DE VALIDAÇÃO
import Sidebar from "@/components/Sidebar";

interface UserFormData {
    email: string;
    nomeCompleto: string;
    telefone: string;
    papel: string;
    senha: string;
    confirmarSenha: string;
    cpf: string;
    crm: string;
    crm_uf: string;
    specialty: string;
}

const defaultFormData: UserFormData = {
    email: "",
    nomeCompleto: "",
    telefone: "",
    papel: "",
    senha: "",
    confirmarSenha: "",
    cpf: "",
    crm: "",
    crm_uf: "",
    specialty: "",
};

const cleanNumber = (value: string): string => value.replace(/\D/g, "");
const formatPhone = (value: string): string => {
    const cleaned = cleanNumber(value).substring(0, 11);
    if (cleaned.length === 11) return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return cleaned;
};

export default function NovoUsuarioPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<UserFormData>(defaultFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (key: keyof UserFormData, value: string) => {
        let updatedValue = value;
        if (key === "telefone") {
            updatedValue = formatPhone(value);
        } else if (key === "crm_uf") {
            updatedValue = value.toUpperCase();
        }
        setFormData((prev) => ({ ...prev, [key]: updatedValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.email || !formData.nomeCompleto || !formData.papel || !formData.senha || !formData.confirmarSenha || !formData.cpf) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        if (formData.senha !== formData.confirmarSenha) {
            setError("A Senha e a Confirmação de Senha não coincidem.");
            return;
        }

        // 2. VALIDAÇÃO DO CPF ANTES DO ENVIO
        if (!isValidCPF(formData.cpf)) {
            setError("O CPF informado é inválido. Por favor, verifique os dígitos.");
            return;
        }

        if (formData.papel === "medico") {
            if (!formData.crm || !formData.crm_uf) {
                setError("Para a função 'Médico', o CRM e a UF do CRM são obrigatórios.");
                return;
            }
        }

        setIsSaving(true);

        try {
            if (formData.papel === "medico") {
                const doctorPayload = {
                    email: formData.email.trim().toLowerCase(),
                    full_name: formData.nomeCompleto,
                    cpf: formData.cpf,
                    crm: formData.crm,
                    crm_uf: formData.crm_uf,
                    specialty: formData.specialty || null,
                    phone_mobile: formData.telefone || null,
                };
                await doctorsService.create(doctorPayload);
            } else {
                const isPatient = formData.papel === "paciente";
                const userPayload = {
                    email: formData.email.trim().toLowerCase(),
                    password: formData.senha,
                    full_name: formData.nomeCompleto,
                    phone: formData.telefone || null,
                    roles: [formData.papel, "paciente"],
                    cpf: formData.cpf,
                    create_patient_record: isPatient,
                    phone_mobile: isPatient ? formData.telefone || null : undefined,
                };
                await usersService.create_user(userPayload);
            }
            router.push("/manager/usuario");
        } catch (e: any) {
            console.error("Erro ao criar usuário:", e);
            // 3. MENSAGEM DE ERRO MELHORADA
            const detail = e.message?.split('detail:"')[1]?.split('"')[0] || e.message;
            setError(detail.replace(/\\/g, "") || "Não foi possível criar o usuário. Verifique os dados e tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const isMedico = formData.papel === "medico";

    return (
        <Sidebar>
            <div className="w-full h-full p-4 md:p-8 flex justify-center items-start">
                <div className="w-full max-w-screen-lg space-y-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div>
                            <h1 className="text-3xl font-extrabold">Novo Usuário</h1>
                            <p className="text-md text-muted-foreground">Preencha os dados para cadastrar um novo usuário no sistema.</p>
                        </div>
                        <Link href="/manager/usuario">
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-10 border rounded-xl shadow-lg">
                        {error && (
                            <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive">
                                <p className="font-semibold">Erro no Cadastro:</p>
                                <p className="text-sm break-words">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                                <Input id="nomeCompleto" value={formData.nomeCompleto} onChange={(e) => handleInputChange("nomeCompleto", e.target.value)} placeholder="Nome e Sobrenome" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="exemplo@dominio.com" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="papel">Papel (Função) *</Label>
                                <Select value={formData.papel} onValueChange={(v) => handleInputChange("papel", v)} required>
                                    <SelectTrigger id="papel">
                                        <SelectValue placeholder="Selecione uma função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                        <SelectItem value="gestor">Gestor</SelectItem>
                                        <SelectItem value="medico">Médico</SelectItem>
                                        <SelectItem value="secretaria">Secretária</SelectItem>
                                        <SelectItem value="paciente">Usuário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isMedico && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="crm">CRM *</Label>
                                        <Input id="crm" value={formData.crm} onChange={(e) => handleInputChange("crm", e.target.value)} placeholder="Número do CRM" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="crm_uf">UF do CRM *</Label>
                                        <Input id="crm_uf" value={formData.crm_uf} onChange={(e) => handleInputChange("crm_uf", e.target.value)} placeholder="Ex: SP" maxLength={2} required />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="specialty">Especialidade (opcional)</Label>
                                        <Input id="specialty" value={formData.specialty} onChange={(e) => handleInputChange("specialty", e.target.value)} placeholder="Ex: Cardiologia" />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha *</Label>
                                <Input id="senha" type="password" value={formData.senha} onChange={(e) => handleInputChange("senha", e.target.value)} placeholder="Mínimo 8 caracteres" minLength={8} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                                <Input id="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={(e) => handleInputChange("confirmarSenha", e.target.value)} placeholder="Repita a senha" required />
                                {formData.senha && formData.confirmarSenha && formData.senha !== formData.confirmarSenha && <p className="text-xs text-destructive">As senhas não coincidem.</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <Input id="telefone" value={formData.telefone} onChange={(e) => handleInputChange("telefone", e.target.value)} placeholder="(00) 00000-0000" maxLength={15} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cpf">Cpf *</Label>
                            <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange("cpf", e.target.value)} placeholder="Apenas números" required />
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                            <Link href="/manager/usuario">
                                <Button type="button" variant="outline" disabled={isSaving}>
                                    Cancelar
                                </Button>
                            </Link>
                            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                {isSaving ? "Salvando..." : "Salvar Usuário"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </Sidebar>
    );
}
