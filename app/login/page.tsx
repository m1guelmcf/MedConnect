// Caminho: app/login/page.tsx

import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // Importa o ícone de seta

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* PAINEL ESQUERDO: O Formulário */}
      <div className="relative flex flex-col items-center justify-center p-8 bg-background">
        {/* Link para Voltar */}
        <div className="absolute top-8 left-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à página inicial
          </Link>
        </div>

        {/* O contêiner principal que agora terá a sombra e o estilo de card */}
        <div className="w-full max-w-md bg-card p-10 rounded-2xl shadow-xl">
          {/* NOVO: Bloco da Logo e Nome (Painel Esquerdo) */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <img
              src="/Logo MedConnect.png" // Caminho CORRETO para a logo
              alt="Logo MedConnect"
              className="w-18 h-18 object-contain" // Verifique se w-12 h-12 é o tamanho desejado
            />
            <span className="text-3xl font-extrabold text-primary">
              MedConnect
            </span>
          </div>
          {/* FIM: Bloco da Logo e Nome */}

          <div className="text-center mb-8">
            {/* Título de boas-vindas movido para baixo da logo */}
            <h1 className="text-3xl font-bold text-foreground">
              Acesse sua conta
            </h1>
            <p className="text-muted-foreground mt-2">
              Bem-vindo(a) de volta ao MedConnect!
            </p>
          </div>

          <LoginForm>
            {/* Children para o LoginForm */}
            <div className="mt-4 text-center text-sm">
              <Link href="/esqueci-minha-senha">
                <span className="text-muted-foreground hover:text-primary cursor-pointer underline">
                  Esqueceu sua senha?
                </span>
              </Link>
            </div>
          </LoginForm>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Não tem uma conta de paciente?{" "}
            </span>
            <Link href="/patient/register">
              <span className="font-semibold text-primary hover:underline cursor-pointer">
                Crie uma agora
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* PAINEL DIREITO: A Imagem e Branding */}
      <div className="hidden lg:block relative">
        {/* Usamos o componente <Image> para otimização e performance */}
        <Image
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070" // Uma imagem profissional de alta qualidade
          alt="Médica utilizando um tablet na clínica MedConnect"
          fill
          style={{ objectFit: "cover" }}
          priority // Ajuda a carregar a imagem mais rápido
        />
        {/* Camada de sobreposição para escurecer a imagem e destacar o texto */}
        <div className="absolute inset-0 bg-primary/80 flex flex-col items-start justify-end p-12 text-left">
          {/* BLOCO DE NOME ADICIONADO */}
          <div className="mb-6 border-l-4 border-primary-foreground pl-4">
            <h1 className="text-5xl font-extrabold text-primary-foreground tracking-wider">
              MedConnect
            </h1>
          </div>
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Tecnologia e Cuidado a Serviço da Sua Saúde.
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Acesse seu portal para uma experiência de saúde integrada, segura e
            eficiente.
          </p>
        </div>
      </div>
    </div>
  );
}
