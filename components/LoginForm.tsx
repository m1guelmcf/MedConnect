// Caminho: components/LoginForm.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Nossos serviços de API centralizados e limpos
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

    // --- NOVOS ESTADOS PARA CONTROLE DE MÚLTIPLOS PERFIS ---
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [authenticatedUser, setAuthenticatedUser] = useState<any>(null);

    /**
     * --- NOVA FUNÇÃO ---
     * Finaliza o login com o perfil de dashboard escolhido e redireciona.
     */
    const handleRoleSelection = (selectedDashboardRole: string) => {
        const user = authenticatedUser;
        if (!user) {
            toast({ title: "Erro de Sessão", description: "Não foi possível encontrar os dados do usuário. Tente novamente.", variant: "destructive" });
            setUserRoles([]); // Volta para a tela de login
            return;
        }

         // AQUI ESTÁ A CORREÇÃO:
    const roleInLowerCase = selectedDashboardRole.toLowerCase();
    
    // Adicionando o log que você pediu:
    console.log("Salvando no localStorage com o perfil:", roleInLowerCase);

    const completeUserInfo = { ...user, user_metadata: { ...user.user_metadata, role: roleInLowerCase } };
    localStorage.setItem("user_info", JSON.stringify(completeUserInfo));

    let redirectPath = "";
    switch (roleInLowerCase) { // Usamos a variável em minúsculas aqui também
        case "manager":
            redirectPath = "/manager/home";
            break;
        case "doctor":
            redirectPath = "/doctor/medicos";
            break;
        case "secretary":
            redirectPath = "/secretary/pacientes";
            break;
        case "patient":
            redirectPath = "/patient/dashboard";
            break;
        case "finance":
            redirectPath = "/finance/home";
            break;
    }

    if (redirectPath) {
        toast({ title: `Entrando como ${selectedDashboardRole}...` });
        router.push(redirectPath);
    } else {
        toast({ title: "Erro", description: "Perfil selecionado inválido.", variant: "destructive" });
    }
};

    /**
     * --- FUNÇÃO ATUALIZADA ---
     * Lida com a submissão do formulário, busca os perfis e decide o próximo passo.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user_info");

        try {
            // A chamada de login continua a mesma
            const authData = await login(form.email, form.password);
            const user = authData.user;
            if (!user || !user.id) {
                throw new Error("Resposta de autenticação inválida.");
            }

            // Armazena o usuário para uso posterior na seleção de perfil
            setAuthenticatedUser(user);

            // A busca de roles também continua a mesma, usando nosso 'api.get'
            const rolesData = await api.get(`/rest/v1/user_roles?user_id=eq.${user.id}&select=role`);

            if (!rolesData || rolesData.length === 0) {
                throw new Error("Nenhum perfil de acesso foi encontrado para este usuário.");
            }

            const rolesFromApi: string[] = rolesData.map((r: any) => r.role);

            // --- AQUI COMEÇA A NOVA LÓGICA DE DECISÃO ---

            // Caso 1: Usuário é ADMIN, mostra todos os dashboards possíveis.
            if (rolesFromApi.includes("admin")) {
                setUserRoles(["manager", "doctor", "secretary", "patient", "finance"]);
                setIsLoading(false); // Para o loading para mostrar a tela de seleção
                return;
            }

            // Mapeia os roles da API para os perfis de dashboard que o usuário pode acessar
            const displayRoles = new Set<string>();
            rolesFromApi.forEach((role) => {
                switch (role) {
                    case "gestor":
                        displayRoles.add("manager");
                        displayRoles.add("finance");
                        break;
                    case "medico":
                        displayRoles.add("doctor");
                        break;
                    case "secretaria":
                        displayRoles.add("secretary");
                        break;
                    case "patient": // Mapeamento de 'patient' (ou outro nome que você use para patiente)
                        displayRoles.add("patient");
                        break;
                }
            });

            const finalRoles = Array.from(displayRoles);

            // Caso 2: Se o usuário tem apenas UM perfil de dashboard, redireciona direto.
            if (finalRoles.length === 1) {
                handleRoleSelection(finalRoles[0]);
            }
            // Caso 3: Se tem múltiplos perfis (ex: 'gestor'), mostra a tela de seleção.
            else {
                setUserRoles(finalRoles);
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
        }

        setIsLoading(false);
    };

    // --- JSX ATUALIZADO COM RENDERIZAÇÃO CONDICIONAL ---
    return (
        <Card className="w-full bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
                {userRoles.length === 0 ? (
                    // VISÃO 1: Formulário de Login (se nenhum perfil foi carregado ainda)
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
                    // VISÃO 2: Tela de Seleção de Perfil (se múltiplos perfis foram encontrados)
                    <div className="space-y-4 animate-in fade-in-50">
                        <h3 className="text-lg font-medium text-center text-foreground">Você tem múltiplos perfis</h3>
                        <p className="text-sm text-muted-foreground text-center">Selecione com qual perfil deseja entrar:</p>
                        <div className="flex flex-col space-y-3 pt-2">
                            {userRoles.map((role) => (
                                <Button 
                                    key={role} 
                                    variant="outline" 
                                    className="h-11 text-base" 
                                    // AQUI ESTÁ A CORREÇÃO:
                                    onClick={() => handleRoleSelection(role === 'paciente' ? 'patient' : role)}
                                >
                                    Entrar como: {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {children}
            </CardContent>
        </Card>
    );
}
