"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DoctorLayout from "@/components/doctor-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import TiptapEditor from "@/components/ui/tiptap-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { reportsApi } from "@/services/reportsApi.mjs";

export default function EditarLaudoPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id as string;
    const laudoId = params.laudoId as string;

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    useEffect(() => {
        if (laudoId) {
            setLoading(true);
            reportsApi.getReportById(laudoId)
                .then((data: any) => {
                    console.log("Fetched report data:", data);
                    // The API now returns an array, get the first element
                    const reportData = Array.isArray(data) && data.length > 0 ? data[0] : null;
                    if (reportData) {
                        setFormData({
                            ...reportData,
                            due_at: reportData.due_at ? new Date(reportData.due_at) : null,
                        });
                    }
                })
                .catch(error => {
                    console.error("Failed to fetch report details:", error);
                    // Here you could add a toast notification to inform the user
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // If there's no laudoId, we shouldn't be in a loading state.
            setLoading(false);
        }
    }, [laudoId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id: string, checked: boolean) => {
        setFormData((prev: any) => ({ ...prev, [id]: checked }));
    };
    
    const handleDateChange = (date: Date | undefined) => {
        console.log("Date selected:", date);
        if (date) {
            setFormData((prev: any) => ({ ...prev, due_at: date }));
        }
    };

    const handleDateSelect = (date: Date | undefined) => {
        handleDateChange(date);
        setIsDatePickerOpen(false); // Close the dialog after selection
    };

    const handleEditorChange = (html: string, json: object) => {
        setFormData((prev: any) => ({ 
            ...prev, 
            content_html: html,
            content_json: json 
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { id, patient_id, created_at, updated_at, created_by, updated_by, ...updateData } = formData;
            await reportsApi.updateReport(laudoId, updateData);
            // toast({ title: "Laudo atualizado com sucesso!" });
            router.push(`/doctor/medicos/${patientId}/laudos`);
        } catch (error) {
            console.error("Failed to update laudo", error);
            // toast({ title: "Erro ao atualizar laudo", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <DoctorLayout>
                 <div className="container mx-auto p-4">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/4" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full" /></div>
                                <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-10 w-full" /></div>
                            </div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-24 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-1/6" /><Skeleton className="h-40 w-full" /></div>
                            <div className="flex justify-end space-x-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DoctorLayout>
        )
    }

    return (
        <DoctorLayout>
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Laudo - {formData.order_number}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="exam">Exame</Label>
                                    <Input id="exam" value={formData.exam || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis">Diagnóstico</Label>
                                    <Input id="diagnosis" value={formData.diagnosis || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cid_code">Código CID</Label>
                                    <Input id="cid_code" value={formData.cid_code || ''} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="requested_by">Solicitado Por</Label>
                                    <Input id="requested_by" value={formData.requested_by || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select onValueChange={(value) => handleSelectChange("status", value)} value={formData.status}>
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
                                    <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.due_at ? format(new Date(formData.due_at), "PPP") : <span>Escolha uma data</span>}
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.due_at ? new Date(formData.due_at) : undefined}
                                                onSelect={handleDateSelect}
                                                initialFocus
                                            />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="conclusion">Conclusão</Label>
                                <Textarea id="conclusion" value={formData.conclusion || ''} onChange={handleInputChange} />
                            </div>

                            <div className="space-y-2">
                                <Label>Conteúdo do Laudo</Label>
                                <div className="rounded-md border border-input">
                                    <TiptapEditor content={formData.content_html || ''} onChange={handleEditorChange} />
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
                                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DoctorLayout>
    );
}