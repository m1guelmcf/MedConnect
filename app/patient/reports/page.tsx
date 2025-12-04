"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { FileText, Download, Eye, Calendar, User, X, Loader2 } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import { useAuthLayout } from "@/hooks/useAuthLayout"
import { reportsApi } from "@/services/reportsApi.mjs"

interface Report {
    id: string;
    order_number: string;
    patient_id: string;
    status: string;
    exam: string;
    requested_by: string;
    cid_code: string;
    diagnosis: string;
    conclusion: string;
    content_html: string;
    content_json: any;
    hide_date: boolean;
    hide_signature: boolean;
    due_at: string;
    created_by: string;
    updated_by: string;
    created_at: string;
    updated_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
    const requiredRole = useMemo(() => ["paciente"], []);
  const { user, isLoading: isAuthLoading } = useAuthLayout({ requiredRole });


  useEffect(() => {
    if (user) {
      const fetchReports = async () => {
        try {
          setIsLoading(true);
          const fetchedReports = await reportsApi.getReports(user.id);
          setReports(fetchedReports);
        } catch (error) {
          console.error("Erro ao buscar laudos:", error)
          toast({
            title: "Erro ao buscar laudos",
            description: "Não foi possível carregar os laudos. Tente novamente.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false);
        }
      }
      fetchReports()
    }
  }, [user?.id])

  const handleViewReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setIsViewModalOpen(true)
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId)
    if (!report) return

    try {
      toast({
        title: "Preparando download...",
        description: "Gerando PDF do laudo médico",
      })

      const htmlContent = report.content_html;

      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `laudo-${report.order_number}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      toast({
        title: "Download concluído!",
        description: "O laudo foi baixado com sucesso",
      })
    } catch (error) {
      console.error("Erro ao baixar laudo:", error)
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o laudo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleCloseModal = () => {
    setIsViewModalOpen(false)
    setSelectedReport(null)
  }

  const availableReports = reports.filter((report) => report.status.toLowerCase() === "draft")
  const pendingReports = reports.filter((report) => report.status.toLowerCase() !== "draft")

  if (isLoading || isAuthLoading) {
    return (
        <Sidebar>
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Laudos</h1>
          <p className="text-muted-foreground mt-2">Visualize e baixe seus laudos médicos e resultados de exames</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Laudos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponíveis</CardTitle>
              <Eye className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableReports.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingReports.length}</div>
            </CardContent>
          </Card>
        </div>

        {availableReports.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Laudos Disponíveis</h2>
            <div className="grid gap-4">
              {availableReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.exam}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.requested_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Finalizado
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{report.diagnosis}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReport(report.id)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Baixar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pendingReports.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Laudos Pendentes</h2>
            <div className="grid gap-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.exam}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.requested_by}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                     <p className="text-muted-foreground mb-4">{report.diagnosis}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-500 font-medium">
                      Laudo em processamento. Você será notificado quando estiver disponível.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reports.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum laudo encontrado</h3>
              <p className="text-muted-foreground">Seus laudos médicos aparecerão aqui após a realização de exames.</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold">{selectedReport?.exam}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedReport?.order_number}
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseModal} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6 mt-4" dangerouslySetInnerHTML={{ __html: selectedReport.content_html }} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  )
}