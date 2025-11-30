// Caminho: app/login/page.tsx

"use client";

import { usersService } from "@/services/usersApi.mjs";
import { LoginForm } from "@/components/LoginForm";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";
import RenderFromTemplateContext from "next/dist/client/components/render-from-template-context";

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleOpenModal = () => {
    // Tenta pegar o email do input do formulário de login
    const emailInput = document.querySelector(
      'input[type="email"]'
    ) as HTMLInputElement;
    if (emailInput?.value) {
      setEmail(emailInput.value);
    }
    setIsModalOpen(true);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setMessage({
        type: "error",
        text: "Por favor, insira um e-mail válido.",
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Chama o método que já faz o fetch corretamente
      const data = await usersService.resetPassword(email);

      console.log("Resposta resetPassword:", data);

      setMessage({
        type: "success",
        text: "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
      });

      setTimeout(() => {
        setIsModalOpen(false);
        setMessage(null);
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Erro no reset de senha:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Erro ao enviar e-mail. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMessage(null);
    setEmail("");
  };

  return (
    <>
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
          <div className="w-full max-w-md bg-card p-10 rounded-2xl shadow-xl border-2 border-border mt-8">
            {/* NOVO: Bloco da Logo e Nome (Painel Esquerdo) */}
            <div className="flex items-center justify-center space-x-3 mb-8">
              <img
                src="/Logo MedConnect.png" // Caminho da sua logo
                alt="Logo MediConnect"
                className="w-16 h-16 object-contain" // Mesmo tamanho que usamos na página inicial
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
                <button
                  onClick={handleOpenModal}
                  className="text-muted-foreground hover:text-primary cursor-pointer underline bg-transparent border-none"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </LoginForm>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                Não tem uma conta de paciente?{" "}
              </span>
              <Link href="/patient/register">
                <span className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer">
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
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070"
            alt="Médica utilizando um tablet na clínica MedConnect"
            fill
            style={{ objectFit: "cover" }}
            priority
            className="dark:opacity-80"
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
              Acesse seu portal para uma experiência de saúde integrada, segura
              e eficiente.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Recuperação de Senha */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-card p-8 rounded-2xl shadow-2xl mx-4">
            {/* Botão de fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Recuperar Senha
              </h2>
              <p className="text-muted-foreground mt-2">
                Insira seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
            </div>

            {/* Input de e-mail */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              {/* Mensagem de feedback */}
              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "success"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                {/* Botão Cancelar – Azul contornado */}
                <Button
                  variant="outline"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Cancelar
                </Button>

                {/* Botão Resetar Senha – Azul sólido */}
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Enviando..." : "Resetar Senha"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
