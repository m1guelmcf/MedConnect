"use client"

import { useState, useEffect } from "react"
import PatientLayout from "@/components/patient-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, Calendar, FileText } from "lucide-react"
import Sidebar from "@/components/Sidebar"

interface PatientData {
  name: string
  email: string
  phone: string
  cpf: string
  birthDate: string
  address: string
}

export default function PatientProfile() {
  const [patientData, setPatientData] = useState<PatientData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    birthDate: "",
    address: "",
  })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem("patientData")
    if (data) {
      setPatientData(JSON.parse(data))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("patientData", JSON.stringify(patientData))
    setIsEditing(false)
    alert("Dados atualizados com sucesso!")
  }

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meus Dados</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
          <Button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            variant={isEditing ? "default" : "outline"}
          >
            {isEditing ? "Salvar Alterações" : "Editar Dados"}
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
                <CardDescription>Seus dados pessoais básicos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={patientData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={patientData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={patientData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Contato
                </CardTitle>
                <CardDescription>Informações de contato</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={patientData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={patientData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Textarea
                    id="address"
                    value={patientData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
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
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{patientData.name}</p>
                    <p className="text-sm text-gray-500">Paciente</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-4 w-4 text-gray-500" />
                    <span className="truncate">{patientData.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{patientData.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>
                      {patientData.birthDate
                        ? new Date(patientData.birthDate).toLocaleDateString("pt-BR")
                        : "Não informado"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Carteirinha do Convênio
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Histórico Médico
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Exames Recentes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Sidebar>
  )
}
