import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Plus } from "lucide-react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"

export default function PatientDashboard() {
  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Bem-vindo ao seu portal de consultas médicas</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próxima Consulta</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Jan</div>
              <p className="text-xs text-muted-foreground">Dr. Silva - 14:30</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Este Mês</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">2 realizadas, 1 agendada</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Dados completos</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/patient/schedule">
                <Button className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Agendar Nova Consulta
                </Button>
              </Link>
              <Link href="/patient/appointments">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Minhas Consultas
                </Button>
              </Link>
              <Link href="/patient/profile">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <User className="mr-2 h-4 w-4" />
                  Atualizar Dados
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
              <CardDescription>Suas consultas agendadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Silva</p>
                    <p className="text-sm text-gray-600">Cardiologia</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">15 Jan</p>
                    <p className="text-sm text-gray-600">14:30</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Dra. Santos</p>
                    <p className="text-sm text-gray-600">Dermatologia</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">22 Jan</p>
                    <p className="text-sm text-gray-600">10:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Sidebar>
  )
}
