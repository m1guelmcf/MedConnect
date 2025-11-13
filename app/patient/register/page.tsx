"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usersService } from "@/services/usersApi.mjs" // Mantém a importação
import { isValidCPF } from "@/lib/utils"

export default function PatientRegister() {
  // REMOVIDO: Estados para 'showPassword' e 'showConfirmPassword'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    // REMOVIDO: Campos 'password' e 'confirmPassword'
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // --- VALIDAÇÃO DE CPF ---
    if (!isValidCPF(formData.cpf)) {
      toast({
        title: "CPF Inválido",
        description: "O CPF informado não é válido. Verifique os dígitos.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // --- LÓGICA DE REGISTRO COM ENDPOINT PÚBLICO ---
    try {
      // ALTERADO: Payload ajustado para o endpoint 'register-patient'
      const payload = {
        email: formData.email.trim().toLowerCase(),
        full_name: formData.name,
        phone_mobile: formData.phone, // O endpoint espera 'phone_mobile'
        cpf: formData.cpf.replace(/\D/g, ''),
        birth_date: formData.birthDate,
      }

      // ALTERADO: Chamada para a nova função de serviço
      await usersService.registerPatient(payload)

      // ALTERADO: Mensagem de sucesso para refletir o fluxo de confirmação por e-mail
      toast({
        title: "Cadastro enviado com sucesso!",
        description: "Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada para ativar sua conta.",
      })

      // Redireciona para a página de login
      router.push("/login")

    } catch (error: any) {
      console.error("Erro no registro:", error)
      toast({
        title: "Erro ao Criar Conta",
        description: error.message || "Não foi possível concluir o cadastro. Verifique seus dados e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao início
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crie sua Conta de Paciente</CardTitle>
            <CardDescription>Preencha seus dados para acessar o portal MedConnect</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* REMOVIDO: Seção de senha e confirmação de senha */}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : "Criar Conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Faça login aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}