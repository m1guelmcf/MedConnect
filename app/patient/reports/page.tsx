"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { FileText, Download, Eye, Calendar, User, X } from "lucide-react"
import Sidebar from "@/components/Sidebar"

interface Report {
  id: string
  title: string
  doctor: string
  date: string
  type: string
  status: "disponivel" | "pendente"
  description: string
  content: {
    patientInfo: {
      name: string
      age: number
      gender: string
      id: string
    }
    examDetails: {
      requestingDoctor: string
      examDate: string
      reportDate: string
      technique: string
    }
    findings: string
    conclusion: string
    recommendations?: string
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: "1",
        title: "Exame de Sangue - Hemograma Completo",
        doctor: "Dr. João Silva",
        date: "2024-01-15",
        type: "Exame Laboratorial",
        status: "disponivel",
        description: "Hemograma completo com contagem de células sanguíneas",
        content: {
          patientInfo: {
            name: "Maria Silva Santos",
            age: 35,
            gender: "Feminino",
            id: "123.456.789-00",
          },
          examDetails: {
            requestingDoctor: "Dr. João Silva - CRM 12345",
            examDate: "15/01/2024",
            reportDate: "15/01/2024",
            technique: "Análise automatizada com confirmação microscópica",
          },
          findings:
            "Hemácias: 4.5 milhões/mm³ (VR: 4.0-5.2)\nHemoglobina: 13.2 g/dL (VR: 12.0-15.5)\nHematócrito: 40% (VR: 36-46)\nLeucócitos: 7.200/mm³ (VR: 4.000-11.000)\nPlaquetas: 280.000/mm³ (VR: 150.000-450.000)\n\nFórmula leucocitária:\n- Neutrófilos: 65% (VR: 50-70%)\n- Linfócitos: 28% (VR: 20-40%)\n- Monócitos: 5% (VR: 2-8%)\n- Eosinófilos: 2% (VR: 1-4%)",
          conclusion:
            "Hemograma dentro dos parâmetros normais. Não foram observadas alterações significativas na série vermelha, branca ou plaquetária.",
          recommendations: "Manter acompanhamento médico regular. Repetir exame conforme orientação médica.",
        },
      },
      {
        id: "2",
        title: "Radiografia do Tórax",
        doctor: "Dra. Maria Santos",
        date: "2024-01-10",
        type: "Exame de Imagem",
        status: "disponivel",
        description: "Radiografia PA e perfil do tórax",
        content: {
          patientInfo: {
            name: "Maria Silva Santos",
            age: 35,
            gender: "Feminino",
            id: "123.456.789-00",
          },
          examDetails: {
            requestingDoctor: "Dra. Maria Santos - CRM 67890",
            examDate: "10/01/2024",
            reportDate: "10/01/2024",
            technique: "Radiografia digital PA e perfil",
          },
          findings:
            "Campos pulmonares livres, sem sinais de consolidação ou derrame pleural. Silhueta cardíaca dentro dos limites normais. Estruturas ósseas íntegras. Diafragmas em posição normal.",
          conclusion: "Radiografia de tórax sem alterações patológicas evidentes.",
          recommendations: "Correlacionar com quadro clínico. Acompanhamento conforme indicação médica.",
        },
      },
      {
        id: "3",
        title: "Eletrocardiograma",
        doctor: "Dr. Carlos Oliveira",
        date: "2024-01-08",
        type: "Exame Cardiológico",
        status: "pendente",
        description: "ECG de repouso para avaliação cardíaca",
        content: {
          patientInfo: {
            name: "Maria Silva Santos",
            age: 35,
            gender: "Feminino",
            id: "123.456.789-00",
          },
          examDetails: {
            requestingDoctor: "Dr. Carlos Oliveira - CRM 54321",
            examDate: "08/01/2024",
            reportDate: "",
            technique: "ECG de repouso",
          },
          findings: "",
          conclusion: "",
          recommendations: "",
        },
      },
      {
        id: "4",
        title: "Ultrassom Abdominal",
        doctor: "Dra. Ana Costa",
        date: "2024-01-05",
        type: "Exame de Imagem",
        status: "disponivel",
        description: "Ultrassonografia do abdome total",
        content: {
          patientInfo: {
            name: "Maria Silva Santos",
            age: 35,
            gender: "Feminino",
            id: "123.456.789-00",
          },
          examDetails: {
            requestingDoctor: "Dra. Ana Costa - CRM 98765",
            examDate: "05/01/2024",
            reportDate: "05/01/2024",
            technique: "Ultrassom convencional",
          },
          findings:
            "Viscerais bem posicionadas. Rim direito e esquerdo com contornos normais. Vesícula com volume dentro do normal.",
          conclusion: "Ultrassom abdominal sem alterações patológicas evidentes.",
          recommendations: "Acompanhamento conforme indicação médica.",
        },
      },
    ]
    setReports(mockReports)
  }, [])

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
      // Simular loading
      toast({
        title: "Preparando download...",
        description: "Gerando PDF do laudo médico",
      })

      // Criar conteúdo HTML do laudo para conversão em PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Laudo Médico - ${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; color: #555; }
            .content { white-space: pre-line; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LAUDO MÉDICO</h1>
            <h2>${report.title}</h2>
            <p><strong>Tipo:</strong> ${report.type}</p>
          </div>
          
          <div class="section">
            <div class="section-title">DADOS DO PACIENTE</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Nome:</span> ${report.content.patientInfo.name}</div>
              <div class="info-item"><span class="label">Idade:</span> ${report.content.patientInfo.age} anos</div>
              <div class="info-item"><span class="label">Sexo:</span> ${report.content.patientInfo.gender}</div>
              <div class="info-item"><span class="label">CPF:</span> ${report.content.patientInfo.id}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DETALHES DO EXAME</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Médico Solicitante:</span> ${report.content.examDetails.requestingDoctor}</div>
              <div class="info-item"><span class="label">Data do Exame:</span> ${report.content.examDetails.examDate}</div>
              <div class="info-item"><span class="label">Data do Laudo:</span> ${report.content.examDetails.reportDate}</div>
              <div class="info-item"><span class="label">Técnica:</span> ${report.content.examDetails.technique}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ACHADOS</div>
            <div class="content">${report.content.findings}</div>
          </div>

          <div class="section">
            <div class="section-title">CONCLUSÃO</div>
            <div class="content">${report.content.conclusion}</div>
          </div>

          ${
            report.content.recommendations
              ? `
          <div class="section">
            <div class="section-title">RECOMENDAÇÕES</div>
            <div class="content">${report.content.recommendations}</div>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Documento gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            <p>Este é um documento médico oficial. Mantenha-o em local seguro.</p>
          </div>
        </body>
        </html>
      `

      // Criar blob com o conteúdo HTML
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      // Criar link temporário para download
      const link = document.createElement("a")
      link.href = url
      link.download = `laudo-${report.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${report.date}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpar URL temporária
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

  const availableReports = reports.filter((report) => report.status === "disponivel")
  const pendingReports = reports.filter((report) => report.status === "pendente")

  return (
    <Sidebar>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Laudos</h1>
          <p className="text-gray-600 mt-2">Visualize e baixe seus laudos médicos e resultados de exames</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Laudos Disponíveis</h2>
            <div className="grid gap-4">
              {availableReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.doctor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.date).toLocaleDateString("pt-BR")}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {report.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{report.description}</p>
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
                        Baixar PDF
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Laudos Pendentes</h2>
            <div className="grid gap-4">
              {pendingReports.map((report) => (
                <Card key={report.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.doctor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.date).toLocaleDateString("pt-BR")}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{report.description}</p>
                    <p className="text-sm text-yellow-600 font-medium">
                      Laudo em processamento. Você será notificado quando estiver disponível.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reports.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum laudo encontrado</h3>
              <p className="text-gray-600">Seus laudos médicos aparecerão aqui após a realização de exames.</p>
            </CardContent>
          </Card>
        )}

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold">{selectedReport?.title}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedReport?.type} - {selectedReport?.doctor}
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseModal} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do Paciente</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nome</p>
                      <p className="text-sm">{selectedReport.content.patientInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Idade</p>
                      <p className="text-sm">{selectedReport.content.patientInfo.age} anos</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Sexo</p>
                      <p className="text-sm">{selectedReport.content.patientInfo.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">CPF</p>
                      <p className="text-sm">{selectedReport.content.patientInfo.id}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detalhes do Exame</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Médico Solicitante</p>
                      <p className="text-sm">{selectedReport.content.examDetails.requestingDoctor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data do Exame</p>
                      <p className="text-sm">{selectedReport.content.examDetails.examDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data do Laudo</p>
                      <p className="text-sm">{selectedReport.content.examDetails.reportDate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Técnica</p>
                      <p className="text-sm">{selectedReport.content.examDetails.technique}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-line text-sm leading-relaxed">{selectedReport.content.findings}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedReport.content.conclusion}</p>
                  </CardContent>
                </Card>

                {selectedReport.content.recommendations && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedReport.content.recommendations}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={() => handleDownloadReport(selectedReport.id)} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                  <Button variant="outline" onClick={handleCloseModal}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Sidebar>
  )
}
