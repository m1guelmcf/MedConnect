"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
// Removi os imports do Select pois não são mais usados
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { toast } from "@/hooks/use-toast";

import { reportsApi } from "@/services/reportsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function NovoLaudoPage() {
    const router = useRouter();
    // const params = useParams(); // Não estava sendo usado diretamente, mas mantive comentado se precisar

    // Estado para garantir que temos o ID do paciente
    const [detectedPatientId, setDetectedPatientId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        exam: "",
        diagnosis: "",
        conclusion: "",
        cid_code: "",
        content_html: "",
        content_json: {},
        // Mantemos 'status' no estado apenas para envio interno à API (padrão 'draft')
        status: "draft",
        requested_by: "",
        due_at: new Date(),
        hide_date: false,
        hide_signature: false,
    });

    // 1. Função CAÇADORA de UUID na URL
    const findPatientIdInUrl = () => {
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        const matches = window.location.pathname.match(uuidRegex);

        if (matches && matches.length > 0) {
            return matches[matches.length - 1];
        }
        return null;
    };

    // 2. Detecta o ID ao carregar a página
    useEffect(() => {
        const id = findPatientIdInUrl();
        if (id) {
            console.log("ID do Paciente detectado:", id);
            setDetectedPatientId(id);
        } else {
            console.error("Não foi possível detectar o ID do paciente na URL");
            toast({
                title: "Erro Crítico",
                description: "Não foi possível identificar o paciente. Recarregue a página.",
                variant: "destructive"
            });
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [id]: checked }));
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setFormData(prev => ({ ...prev, due_at: date }));
        }
    };

    const handleEditorChange = (html: string, json: object) => {
        setFormData(prev => ({
            ...prev,
            content_html: html,
            content_json: json
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const patientIdToSend = detectedPatientId || findPatientIdInUrl();

        if (!patientIdToSend) {
            toast({ title: "Erro", description: "ID do Paciente perdido. Não é possível salvar.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            // Define o status padrão para envio (já que o campo visual foi removido)
            // Se quiser que nasça finalizado, mude 'draft' para 'completed' aqui.
            const statusToSend = 'draft';

            const laudoData = {
                exam: formData.exam,
                diagnosis: formData.diagnosis,
                conclusion: formData.conclusion,
                cid_code: formData.cid_code,
                content_html: formData.content_html,
                content_json: formData.content_json,
                status: statusToSend,
                requested_by: formData.requested_by,
                hide_date: formData.hide_date,
                hide_signature: formData.hide_signature,
                patient_id: patientIdToSend,
                due_at: formData.due_at.toISOString(),
            };

            console.log("Criando Laudo para Paciente ID:", patientIdToSend);

            await reportsApi.createReport(laudoData);

            toast({
                title: "Sucesso!",
                description: "Novo laudo criado com sucesso."
            });

            router.push(`/doctor/medicos/${patientIdToSend}/laudos`);
        } catch (error: any) {
            console.error("Failed to create laudo", error);

            let errorMessage = "Ocorreu um erro ao salvar.";
            if (error.message && error.message.includes("enum")) {
                errorMessage = "Erro de Status inválido.";
            }

            toast({
                title: "Erro ao criar laudo",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sidebar>
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Criar Novo Laudo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="exam">Exame</Label>
                                    <Input id="exam" value={formData.exam} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                                    <Input id="diagnosis" value={formData.diagnosis} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cid_code">Código CID</Label>
                                    <Input id="cid_code" value={formData.cid_code} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="requested_by">Solicitado Por</Label>
                                    <Input id="requested_by" value={formData.requested_by} onChange={handleInputChange} />
                                </div>

                                {/* CAMPO STATUS REMOVIDO DAQUI */}

                                <div className="space-y-2">
                                    <Label htmlFor="due_at">Data de Vencimento</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.due_at ? format(formData.due_at, "PPP") : <span>Escolha uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={formData.due_at} onSelect={handleDateChange} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="conclusion">Conclusão</Label>
                                <Textarea id="conclusion" value={formData.conclusion} onChange={handleInputChange} />
                            </div>

                            <div className="space-y-2">
                                <Label>Conteúdo do Laudo</Label>
                                <div className="rounded-md border border-input min-h-[200px]">
                                    <TiptapEditor content={formData.content_html} onChange={handleEditorChange} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="hide_date" checked={formData.hide_date} onCheckedChange={(checked) => handleCheckboxChange("hide_date", !!checked)} />
                                    <Label htmlFor="hide_date">Ocultar Data</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="hide_signature" checked={formData.hide_signature} onCheckedChange={(checked) => handleCheckboxChange("hide_signature", !!checked)} />
                                    <Label htmlFor="hide_signature">Ocultar Assinatura</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando..." : "Salvar Laudo"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Sidebar>
    );
}