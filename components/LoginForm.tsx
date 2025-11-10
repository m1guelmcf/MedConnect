// ARQUIVO COMPLETO E CORRIGIDO PARA: components/LoginForm.tsx

"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, api } from "@/services/api.mjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

interface LoginFormProps {
    children?: React.ReactNode;
}

interface FormState {
    email: string;
    password: string;
}

export function LoginForm({ children }: LoginFormProps) {
    const [form, setForm] = useState<FormState>({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const [userRoles, setUserRoles] = useState<string[]>([]);
    
    // *** MUDANÇA 1: A função agora recebe o objeto 'user' como parâmetro ***
    const handleRoleSelection = (selectedDashboardRole: string, user: any) => {
        if (!user) {
            toast({ title: "Erro de Sessão", description: "Não foi possível encontrar os dados do usuário. Tente novamente.", variant: "destructive" });
            setUserRoles([]);
            return;
        }

        const roleInLowerCase = selectedDashboardRole.toLowerCase();
        console.log("Salvando no localStorage com o perfil:", roleInLowerCase);

        const completeUserInfo = { ...user, user_metadata: { ...user.user_metadata, role: roleInLowerCase } };
        localStorage.setItem("user_info", JSON.stringify(completeUserInfo));

        let redirectPath = "";
        switch (roleInLowerCase) {
            case "manager": redirectPath = "/manager/home"; break;
            case "doctor": redirectPath = "/doctor/medicos"; break;
            case "secretary": redirectPath = "/secretary/pacientes"; break;
            case "patient": redirectPath = "/patient/dashboard"; break;
            case "finance": redirectPath = "/finance/home"; break;
        }

        if (redirectPath) {
            toast({ title: `Entrando como ${selectedDashboardRole}...` });
            router.push(redirectPath);
        } else {
            toast({ title: "Erro", description: "Perfil selecionado inválido.", variant: "destructive" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");

        try {
            const authData = await login(form.email, form.password);
            const user = authData.user;
            if (!user || !user.id) {
                throw new Error("Resposta de autenticação inválida.");
            }

            const rolesData = await api.get(`/rest/v1/user_roles?user_id=eq.${user.id}&select=role`);
            if (!rolesData || rolesData.length === 0) {
                throw new Error("Nenhum perfil de acesso foi encontrado para este usuário.");
            }

            const rolesFromApi: string[] = rolesData.map((r: any) => r.role);
            
            // *** MUDANÇA 2: Passamos o objeto 'user' diretamente para a função de seleção ***
            const handleSelectionWithUser = (role: string) => handleRoleSelection(role, user);

            if (rolesFromApi.includes("admin")) {
                const allRoles = ["manager", "doctor", "secretary", "patient", "finance"];
                setUserRoles(allRoles);
                // Atualizamos o onClick para usar a nova função que já tem o 'user'
                const roleButtons = allRoles.map((role) => (
                    <Button key={role} variant="outline" className="h-11 text-base" onClick={() => handleSelectionWithUser(role)}>
                        Entrar como: {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                ));
                // Precisamos de um estado para renderizar os botões
                setRoleSelectionUI(roleButtons); 
                setIsLoading(false);
                return;
            }

            const displayRoles = new Set<string>();
            rolesFromApi.forEach((role) => {
                switch (role) {
                    case "gestor": displayRoles.add("manager"); displayRoles.add("finance"); break;
                    case "medico": displayRoles.add("doctor"); break;
                    case "secretaria": displayRoles.add("secretary"); break;
                    case "paciente": displayRoles.add("patient"); break;
                }
            });

            const finalRoles = Array.from(displayRoles);

            if (finalRoles.length === 1) {
                handleSelectionWithUser(finalRoles[0]);
            } else {
                setUserRoles(finalRoles);
                // Atualizamos o onClick aqui também
                const roleButtons = finalRoles.map((role) => (
                    <Button key={role} variant="outline" className="h-11 text-base" onClick={() => handleSelectionWithUser(role)}>
                        Entrar como: {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                ));
                setRoleSelectionUI(roleButtons);
                setIsLoading(false);
            }
        } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_info");
            toast({
                title: "Erro no Login",
                description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    // Estado para guardar os botões de seleção de perfil
    const [roleSelectionUI, setRoleSelectionUI] = useState<React.ReactNode | null>(null);

    return (
        <Card className="w-full bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
                {!roleSelectionUI ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <Input id="email" type="email" placeholder="seu.email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10 h-11" required disabled={isLoading} autoComplete="username" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Digite sua senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 pr-12 h-11" required disabled={isLoading} autoComplete="current-password" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground" disabled={isLoading}>
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-in fade-in-50">
                        <h3 className="text-lg font-medium text-center text-foreground">Você tem múltiplos perfis</h3>
                        <p className="text-sm text-muted-foreground text-center">Selecione com qual perfil deseja entrar:</p>
                        <div className="flex flex-col space-y-3 pt-2">
                            {roleSelectionUI}
                        </div>
                    </div>
                )}
                {children}
            </CardContent>
        </Card>
    );
}