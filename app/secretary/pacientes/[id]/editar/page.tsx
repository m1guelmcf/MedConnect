"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2, Paperclip, Upload } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { patientsService } from "@/services/patientsApi.mjs";
import Sidebar from "@/components/Sidebar";

export default function EditarPacientePage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.id;
    const { toast } = useToast();

    // Photo upload state
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    // Anexos state
    const [anexos, setAnexos] = useState<any[]>([]);
    const [isUploadingAnexo, setIsUploadingAnexo] = useState(false);
    const anexoInputRef = useRef<HTMLInputElement | null>(null);

    type FormData = {
        nome: string; // full_name
        cpf: string;
        dataNascimento: string; // birth_date
        sexo: string; // sex
        id?: string;
        nomeSocial?: string; // social_name
        rg?: string;
        documentType?: string; // document_type
        documentNumber?: string; // document_number
        ethnicity?: string;
        race?: string;
        naturality?: string;
        nationality?: string;
        profession?: string;
        maritalStatus?: string; // marital_status
        motherName?: string; // mother_name
        motherProfession?: string; // mother_profession
        fatherName?: string; // father_name
        fatherProfession?: string; // father_profession
        guardianName?: string; // guardian_name
        guardianCpf?: string; // guardian_cpf
        spouseName?: string; // spouse_name
        rnInInsurance?: boolean; // rn_in_insurance
        legacyCode?: string; // legacy_code
        notes?: string;
        email?: string;
        phoneMobile?: string; // phone_mobile
        phone1?: string;
        phone2?: string;
        cep?: string;
        street?: string;
        number?: string;
        complement?: string;
        neighborhood?: string;
        city?: string;
        state?: string;
        reference?: string;
        vip?: boolean;
        lastVisitAt?: string;
        nextAppointmentAt?: string;
        createdAt?: string;
        updatedAt?: string;
        createdBy?: string;
        updatedBy?: string;
        weightKg?: string;
        heightM?: string;
        bmi?: string;
        bloodType?: string;
        // Adicionei os campos do convênio para o tipo FormData
        convenio?: string;
        plano?: string;
        numeroMatricula?: string;
        validadeCarteira?: string;
        alergias?: string;
    };


    const [formData, setFormData] = useState<FormData>({
        nome: "",
        cpf: "",
        dataNascimento: "",
        sexo: "",
        id: "",
        nomeSocial: "",
        rg: "",
        documentType: "",
        documentNumber: "",
        ethnicity: "",
        race: "",
        naturality: "",
        nationality: "",
        profession: "",
        maritalStatus: "",
        motherName: "",
        motherProfession: "",
        fatherName: "",
        fatherProfession: "",
        guardianName: "",
        guardianCpf: "",
        spouseName: "",
        rnInInsurance: false,
        legacyCode: "",
        notes: "",
        email: "",
        phoneMobile: "",
        phone1: "",
        phone2: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        reference: "",
        vip: false,
        lastVisitAt: "",
        nextAppointmentAt: "",
        createdAt: "",
        updatedAt: "",
        createdBy: "",
        updatedBy: "",
        weightKg: "",
        heightM: "",
        bmi: "",
        bloodType: "",
        convenio: "",
        plano: "",
        numeroMatricula: "",
        validadeCarteira: "",
        alergias: "",
    });

    const [isGuiaConvenio, setIsGuiaConvenio] = useState(false);
    const [validadeIndeterminada, setValidadeIndeterminada] = useState(false);

    useEffect(() => {
        async function fetchPatient() {
            try {
                const res = await patientsService.getById(patientId);
                // Map API snake_case/nested to local camelCase form
                setFormData({
                    id: res[0]?.id ?? "",
                    nome: res[0]?.full_name ?? "",
                    nomeSocial: res[0]?.social_name ?? "",
                    cpf: res[0]?.cpf ?? "",
                    rg: res[0]?.rg ?? "",
                    documentType: res[0]?.document_type ?? "",
                    documentNumber: res[0]?.document_number ?? "",
                    sexo: res[0]?.sex ?? "",
                    dataNascimento: res[0]?.birth_date ?? "",
                    ethnicity: res[0]?.ethnicity ?? "",
                    race: res[0]?.race ?? "",
                    naturality: res[0]?.naturality ?? "",
                    nationality: res[0]?.nationality ?? "",
                    profession: res[0]?.profession ?? "",
                    maritalStatus: res[0]?.marital_status ?? "",
                    motherName: res[0]?.mother_name ?? "",
                    motherProfession: res[0]?.mother_profession ?? "",
                    fatherName: res[0]?.father_name ?? "",
                    fatherProfession: res[0]?.father_profession ?? "",
                    guardianName: res[0]?.guardian_name ?? "",
                    guardianCpf: res[0]?.guardian_cpf ?? "",
                    spouseName: res[0]?.spouse_name ?? "",
                    rnInInsurance: res[0]?.rn_in_insurance ?? false,
                    legacyCode: res[0]?.legacy_code ?? "",
                    notes: res[0]?.notes ?? "",
                    email: res[0]?.email ?? "",
                    phoneMobile: res[0]?.phone_mobile ?? "",
                    phone1: res[0]?.phone1 ?? "",
                    phone2: res[0]?.phone2 ?? "",
                    cep: res[0]?.cep ?? "",
                    street: res[0]?.street ?? "",
                    number: res[0]?.number ?? "",
                    complement: res[0]?.complement ?? "",
                    neighborhood: res[0]?.neighborhood ?? "",
                    city: res[0]?.city ?? "",
                    state: res[0]?.state ?? "",
                    reference: res[0]?.reference ?? "",
                    vip: res[0]?.vip ?? false,
                    lastVisitAt: res[0]?.last_visit_at ?? "",
                    nextAppointmentAt: res[0]?.next_appointment_at ?? "",
                    createdAt: res[0]?.created_at ?? "",
                    updatedAt: res[0]?.updated_at ?? "",
                    createdBy: res[0]?.created_by ?? "",
                    updatedBy: res[0]?.updated_by ?? "",
                    weightKg: res[0]?.weight_kg ? String(res[0].weight_kg) : "",
                    heightM: res[0]?.height_m ? String(res[0].height_m) : "",
                    bmi: res[0]?.bmi ? String(res[0].bmi) : "",
                    bloodType: res[0]?.blood_type ?? "",
                    // Os campos de convênio e alergias não vêm da API, então os deixamos vazios ou com valores padrão
                    convenio: "",
                    plano: "",
                    numeroMatricula: "",
                    validadeCarteira: "",
                    alergias: "",
                });

            } catch (e: any) {
                toast({ title: "Erro", description: e?.message || "Falha ao carregar paciente" });
            }
        }
        fetchPatient();
    }, [patientId, toast]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Build API payload (snake_case)
        const payload = {
            full_name: formData.nome || null,
            cpf: formData.cpf || null,
            email: formData.email || null,
            phone_mobile: formData.phoneMobile || null,
            birth_date: formData.dataNascimento || null,
            social_name: formData.nomeSocial || null,
            sex: formData.sexo || null,
            blood_type: formData.bloodType || null,
            weight_kg: formData.weightKg ? Number(formData.weightKg) : null,
            height_m: formData.heightM ? Number(formData.heightM) : null,
            street: formData.street || null,
            number: formData.number || null,
            complement: formData.complement || null,
            neighborhood: formData.neighborhood || null,
            city: formData.city || null,
            state: formData.state || null,
            cep: formData.cep || null,
        };

        try {
            await patientsService.update(patientId, payload);
            toast({
                title: "Sucesso",
                description: "Paciente atualizado com sucesso",
                variant: "default"
            });
            router.push("/secretary/pacientes");
        } catch (err: any) {
            console.error("Erro ao atualizar paciente:", err);
            toast({
                title: "Erro",
                description: err?.message || "Não foi possível atualizar o paciente",
                variant: "destructive"
            });
        }
    };

    return (
        <Sidebar>
            {/* O espaçamento foi reduzido aqui: de `p-4 sm:p-6 lg:p-8` para `p-2 sm:p-4 lg:p-6` */}
            <div className="space-y-6 p-2 sm:p-4 lg:p-6 max-w-10xl mx-auto">{/* Alterado padding responsivo */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/secretary/pacientes">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Editar Paciente</h1>
                            <p className="text-muted-foreground">Atualize as informações do paciente</p>
                        </div>
                    </div>
                    {/* Espaço reservado para anexos ou ações futuras */}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Dados Pessoais Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-6">Dados Pessoais</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Photo upload */}
                            <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                                <Label>Foto do paciente</Label>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                                        {photoUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={photoUrl} alt="Foto do paciente" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-muted-foreground text-sm text-center">Sem foto</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
                                        <Button type="button" variant="outline" disabled={isUploadingPhoto}>
                                            {isUploadingPhoto ? "Enviando..." : "Enviar foto"}
                                        </Button>
                                        {photoUrl && (
                                            <Button type="button" variant="ghost" disabled={isUploadingPhoto}>
                                                Remover
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange("nome", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpf">CPF *</Label>
                                <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange("cpf", e.target.value)} placeholder="000.000.000-00" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rg">RG</Label>
                                <Input id="rg" value={formData.rg} onChange={(e) => handleInputChange("rg", e.target.value)} placeholder="00.000.000-0" />
                            </div>

                            <div className="space-y-2">
                                <Label>Sexo *</Label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input type="radio" id="Masculino" name="sexo" value="Masculino" checked={formData.sexo === "Masculino"} onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-primary" />
                                        <Label htmlFor="Masculino">Masculino</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="radio" id="Feminino" name="sexo" value="Feminino" checked={formData.sexo === "Feminino"} onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-primary" />
                                        <Label htmlFor="Feminino">Feminino</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                                <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange("dataNascimento", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="etnia">Etnia</Label>
                                <Select value={formData.ethnicity} onValueChange={(value) => handleInputChange("ethnicity", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="branca">Branca</SelectItem>
                                        <SelectItem value="preta">Preta</SelectItem>
                                        <SelectItem value="parda">Parda</SelectItem>
                                        <SelectItem value="amarela">Amarela</SelectItem>
                                        <SelectItem value="indigena">Indígena</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="raca">Raça</Label>
                                <Select value={formData.race} onValueChange={(value) => handleInputChange("race", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="caucasiana">Caucasiana</SelectItem>
                                        <SelectItem value="negroide">Negroide</SelectItem>
                                        <SelectItem value="mongoloide">Mongoloide</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="naturalidade">Naturalidade</Label>
                                <Input id="naturalidade" value={formData.naturality} onChange={(e) => handleInputChange("naturality", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                                <Select value={formData.nationality} onValueChange={(value) => handleInputChange("nationality", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="brasileira">Brasileira</SelectItem>
                                        <SelectItem value="estrangeira">Estrangeira</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profissao">Profissão</Label>
                                <Input id="profissao" value={formData.profession} onChange={(e) => handleInputChange("profissao", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estadoCivil">Estado civil</Label>
                                <Select value={formData.maritalStatus} onValueChange={(value) => handleInputChange("maritalStatus", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                        <SelectItem value="casado">Casado(a)</SelectItem>
                                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeMae">Nome da mãe</Label>
                                <Input id="nomeMae" value={formData.motherName} onChange={(e) => handleInputChange("motherName", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profissaoMae">Profissão da mãe</Label>
                                <Input id="profissaoMae" value={formData.motherProfession} onChange={(e) => handleInputChange("motherProfession", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomePai">Nome do pai</Label>
                                <Input id="nomePai" value={formData.fatherName} onChange={(e) => handleInputChange("fatherName", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="profissaoPai">Profissão do pai</Label>
                                <Input id="profissaoPai" value={formData.fatherProfession} onChange={(e) => handleInputChange("fatherProfession", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeResponsavel">Nome do responsável</Label>
                                <Input id="nomeResponsavel" value={formData.guardianName} onChange={(e) => handleInputChange("guardianName", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cpfResponsavel">CPF do responsável</Label>
                                <Input id="cpfResponsavel" value={formData.guardianCpf} onChange={(e) => handleInputChange("guardianCpf", e.target.value)} placeholder="000.000.000-00" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeEsposo">Nome do esposo(a)</Label>
                                <Input id="nomeEsposo" value={formData.spouseName} onChange={(e) => handleInputChange("spouseName", e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="guiaConvenio" checked={isGuiaConvenio} onCheckedChange={(checked) => setIsGuiaConvenio(checked === true)} />
                                <Label htmlFor="guiaConvenio">RN na Guia do convênio</Label>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea id="observacoes" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} placeholder="Digite observações sobre o paciente..." className="mt-2" />
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-6">Contato</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail *</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="celular">Celular *</Label>
                                <Input id="celular" value={formData.phoneMobile} onChange={(e) => handleInputChange("phoneMobile", e.target.value)} placeholder="(00) 00000-0000" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone1">Telefone 1</Label>
                                <Input id="telefone1" value={formData.phone1} onChange={(e) => handleInputChange("phone1", e.target.value)} placeholder="(00) 0000-0000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone2">Telefone 2</Label>
                                <Input id="telefone2" value={formData.phone2} onChange={(e) => handleInputChange("phone2", e.target.value)} placeholder="(00) 0000-0000" />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-6">Endereço</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input id="cep" value={formData.cep} onChange={(e) => handleInputChange("cep", e.target.value)} placeholder="00000-000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endereco">Endereço</Label>
                                <Input id="endereco" value={formData.street} onChange={(e) => handleInputChange("street", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" value={formData.number} onChange={(e) => handleInputChange("number", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input id="complemento" value={formData.complement} onChange={(e) => handleInputChange("complement", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" value={formData.neighborhood} onChange={(e) => handleInputChange("neighborhood", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AC">Acre</SelectItem>
                                        <SelectItem value="AL">Alagoas</SelectItem>
                                        <SelectItem value="AP">Amapá</SelectItem>
                                        <SelectItem value="AM">Amazonas</SelectItem>
                                        <SelectItem value="BA">Bahia</SelectItem>
                                        <SelectItem value="CE">Ceará</SelectItem>
                                        <SelectItem value="DF">Distrito Federal</SelectItem>
                                        <SelectItem value="ES">Espírito Santo</SelectItem>
                                        <SelectItem value="GO">Goiás</SelectItem>
                                        <SelectItem value="MA">Maranhão</SelectItem>
                                        <SelectItem value="MT">Mato Grosso</SelectItem>
                                        <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                        <SelectItem value="MG">Minas Gerais</SelectItem>
                                        <SelectItem value="PA">Pará</SelectItem>
                                        <SelectItem value="PB">Paraíba</SelectItem>
                                        <SelectItem value="PR">Paraná</SelectItem>
                                        <SelectItem value="PE">Pernambuco</SelectItem>
                                        <SelectItem value="PI">Piauí</SelectItem>
                                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                        <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                        <SelectItem value="RO">Rondônia</SelectItem>
                                        <SelectItem value="RR">Roraima</SelectItem>
                                        <SelectItem value="SC">Santa Catarina</SelectItem>
                                        <SelectItem value="SP">São Paulo</SelectItem>
                                        <SelectItem value="SE">Sergipe</SelectItem>
                                        <SelectItem value="TO">Tocantins</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Medical Information Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-6">Informações Médicas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                                <Select value={formData.bloodType} onValueChange={(value) => handleInputChange("bloodType", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="peso">Peso (kg)</Label>
                                <Input id="peso" type="number" value={formData.weightKg} onChange={(e) => handleInputChange("weightKg", e.target.value)} placeholder="0.0" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="altura">Altura (m)</Label>
                                <Input id="altura" type="number" step="0.01" value={formData.heightM} onChange={(e) => handleInputChange("heightM", e.target.value)} placeholder="0.00" />
                            </div>

                            <div className="space-y-2">
                                <Label>IMC</Label>
                                <Input value={formData.weightKg && formData.heightM ? (Number.parseFloat(formData.weightKg) / Number.parseFloat(formData.heightM) ** 2).toFixed(2) : ""} disabled placeholder="Calculado automaticamente" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label htmlFor="alergias">Alergias</Label>
                            <Textarea id="alergias" value={formData.alergias} onChange={(e) => handleInputChange("alergias", e.target.value)} placeholder="Ex: AAS, Dipirona, etc." className="mt-2" />
                        </div>
                    </div>

                    {/* Insurance Information Section */}
                    <div className="bg-card rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-6">Informações de convênio</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="convenio">Convênio</Label>
                                <Select value={formData.convenio} onValueChange={(value) => handleInputChange("convenio", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Particular">Particular</SelectItem>
                                        <SelectItem value="SUS">SUS</SelectItem>
                                        <SelectItem value="Unimed">Unimed</SelectItem>
                                        <SelectItem value="Bradesco">Bradesco Saúde</SelectItem>
                                        <SelectItem value="Amil">Amil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plano">Plano</Label>
                                <Input id="plano" value={formData.plano} onChange={(e) => handleInputChange("plano", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numeroMatricula">Nº de matrícula</Label>
                                <Input id="numeroMatricula" value={formData.numeroMatricula} onChange={(e) => handleInputChange("numeroMatricula", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validadeCarteira">Validade da Carteira</Label>
                                <Input id="validadeCarteira" type="date" value={formData.validadeCarteira} onChange={(e) => handleInputChange("validadeCarteira", e.target.value)} disabled={validadeIndeterminada} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="validadeIndeterminada" checked={validadeIndeterminada} onCheckedChange={(checked) => setValidadeIndeterminada(checked === true)} />
                                <Label htmlFor="validadeIndeterminada">Validade Indeterminada</Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-4">
                        <Link href="/secretary/pacientes">
                            <Button type="button" variant="outline" className="w-full sm:w-auto">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
}