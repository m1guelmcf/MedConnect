// Caminho: app/patient/login/page.tsx

import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PatientLoginPage() {
    // NOTA: Esta página de login específica para pacientes se tornou obsoleta
    // com a criação da nossa página de login central em /login.
    // Mantemos este arquivo por enquanto para evitar quebrar outras partes do código,
    // mas o ideal no futuro seria deletar esta página e redirecionar
    // /patient/login para /login.

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors duration-200 font-medium">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar ao início
                    </Link>
                </div>

                {/* --- ALTERAÇÃO PRINCIPAL AQUI --- */}
                {/* Removemos as props desnecessárias (title, description, role, etc.) */}
                {/* O novo LoginForm é autônomo e não precisa mais delas. */}
                <LoginForm>
                    {/* Este bloco é passado como 'children' para o LoginForm */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Não tem uma conta? </span>
                        <Link href="/patient/register">
                            <span className="font-semibold text-primary hover:underline cursor-pointer">
                                Crie uma agora
                            </span>
                        </Link>
                    </div>
                </LoginForm>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">Problemas para acessar? Entre em contato conosco</p>
                </div>
            </div>
       </div>
    );
}