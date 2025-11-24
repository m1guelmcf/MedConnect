 "use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "@/components/ui/tiptap-editor";

import { reportsApi } from "@/services/reportsApi.mjs";
import DoctorLayout from "@/components/doctor-layout";




export default function NovoLaudoPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;

    const [formData, setFormData] = useState({
        order_number: "",
        exam: "",
        diagnosis: "",
        conclusion: "",
        cid_code: "",
        content_html: "",
        content_json: {}, // Added for the JSON content from the editor
        status: "draft",
        requested_by: "",
        due_at: new Date(),
        hide_date: false,
        hide_signature: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
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

    // Updated to handle both HTML and JSON from the editor
    const handleEditorChange = (html: string, json: object) => {
        setFormData(prev => ({ 
            ...prev, 
            content_html: html,
            content_json: json 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const laudoData = {
                ...formData,
                patient_id: patientId,
                due_at: formData.due_at.toISOString(), // Ensure date is in ISO format for the API
            };
            
            await reportsApi.createReport(laudoData);
            
            // You can use a toast notification here for better user feedback
            // toast({ title: "Laudo criado com sucesso!" });
            
            router.push(`/doctor/medicos/${patientId}/laudos`);
        } catch (error: any) {
            console.error("Failed to create laudo", error);
            // You can use a toast notification for errors
            // toast({ title: "Erro ao criar laudo", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DoctorLayout>
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
                                    <Input id="exam" value={formData.exam} onChange={handleInputChange} />
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
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select onValueChange={(value) => handleSelectChange("status", value)} defaultValue={formData.status}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Rascunho</SelectItem>
                                            <SelectItem value="final">Finalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
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
                                <div className="rounded-md border border-input">
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
        </DoctorLayout>
    );
}