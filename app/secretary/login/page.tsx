// Caminho: app/(secretary)/login/page.tsx

import { LoginForm } from "@/components/LoginForm";
import Link from "next/link"; // Adicionado para o link de "Voltar"

export default function SecretaryLoginPage() {
    // NOTA: Esta página se tornou obsoleta com a criação do /login central.
    // O ideal no futuro é deletar esta página e redirecionar os usuários.

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">Área da Secretária</h1>
                <p className="text-muted-foreground mb-8">Acesse o sistema de gerenciamento</p>
                
                {/* --- ALTERAÇÃO PRINCIPAL AQUI --- */}
                {/* Chamando o LoginForm unificado sem props desnecessárias */}
                <LoginForm>
                    {/* Adicionamos um link de "Voltar" como filho (children) */}
                    <div className="mt-6 text-center text-sm">
                        <Link href="/">
                            <span className="font-semibold text-primary hover:underline cursor-pointer">
                                Voltar à página inicial
                            </span>
                        </Link>
                    </div>
                </LoginForm>
            </div>
       </div>
    );
}