"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, Plus, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import SecretaryLayout from "@/components/secretary-layout";
import { patientsService } from "@/services/patientsApi.mjs";

export default function NovoPacientePage() {
    const [anexosOpen, setAnexosOpen] = useState(false);
    const [anexos, setAnexos] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const adicionarAnexo = () => {
        setAnexos([...anexos, `Documento ${anexos.length + 1}`]);
    };

    const removerAnexo = (index: number) => {
        setAnexos(anexos.filter((_, i) => i !== index));
    };


    const cleanNumber = (value: string): string => value.replace(/\D/g, '');

    const formatCPF = (value: string): string => {
        const cleaned = cleanNumber(value).substring(0, 11);
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatCEP = (value: string): string => {
        const cleaned = cleanNumber(value).substring(0, 8);
        return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    };

    const formatPhoneMobile = (value: string): string => {
        const cleaned = cleanNumber(value).substring(0, 11);
        if (cleaned.length > 10) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '+55 ($1) $2-$3');
        }
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '+55 ($1) $2-$3');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        const form = e.currentTarget;
        const formData = new FormData(form);

        const apiPayload = {
            full_name: (formData.get("nome") as string) || "", // obrigatório
            social_name: (formData.get("nomeSocial") as string) || undefined,
            cpf: (formatCPF(formData.get("cpf") as string)) || "", // obrigatório
            email: (formData.get("email") as string) || "", // obrigatório
            phone_mobile: (formatPhoneMobile(formData.get("celular") as string)) || "", // obrigatório
            birth_date: formData.get("dataNascimento") ? new Date(formData.get("dataNascimento") as string) : undefined,
            sex: (formData.get("sexo") as string) || undefined,
            blood_type: (formData.get("tipoSanguineo") as string) || undefined,
            weight_kg: formData.get("peso") ? parseFloat(formData.get("peso") as string) : undefined,
            height_m: formData.get("altura") ? parseFloat(formData.get("altura") as string) : undefined,
            cep: (formatCEP(formData.get("cep") as string)) || undefined,
            street: (formData.get("endereco") as string) || undefined,
            number: (formData.get("numero") as string) || undefined,
            complement: (formData.get("complemento") as string) || undefined,
            neighborhood: (formData.get("bairro") as string) || undefined,
            city: (formData.get("cidade") as string) || undefined,
            state: (formData.get("estado") as string) || undefined,
        };

        console.log(apiPayload.email)
        console.log(apiPayload.cep)
        console.log(apiPayload.phone_mobile)

        const errors: string[] = [];
        const fullName = apiPayload.full_name?.trim() || "";
        if (!fullName || fullName.length < 2 || fullName.length > 255) {
            errors.push("Nome deve ter entre 2 e 255 caracteres.");
        }

        const cpf = apiPayload.cpf || "";
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
            errors.push("CPF deve estar no formato XXX.XXX.XXX-XX.");
        }

        const sex = apiPayload.sex;
        const allowedSex = ["Masculino", "Feminino", "outro"];
        if (!sex || !allowedSex.includes(sex)) {
            errors.push("Sexo é obrigatório e deve ser masculino, feminino ou outro.");
        }

        if (!apiPayload.birth_date) {
            errors.push("Data de nascimento é obrigatória.");
        }

        const phoneMobile = apiPayload.phone_mobile || "";
        if (phoneMobile && !/^\+55 \(\d{2}\) \d{4,5}-\d{4}$/.test(phoneMobile)) {
            errors.push("Celular deve estar no formato +55 (XX) XXXXX-XXXX.");
        }

        const cep = apiPayload.cep || "";
        if (cep && !/^\d{5}-\d{3}$/.test(cep)) {
            errors.push("CEP deve estar no formato XXXXX-XXX.");
        }

        const state = apiPayload.state || "";
        if (state && state.length !== 2) {
            errors.push("Estado (UF) deve ter 2 caracteres.");
        }
        if (errors.length) {
            toast({ title: "Corrija os campos", description: errors[0] });
            console.log("campos errados")
            setIsLoading(false);
            return;
        }

        try {
            const res = await patientsService.create(apiPayload);
            console.log(res)

            let message = "Paciente cadastrado com sucesso";
            try {
                if (!res[0].id) {
                    throw new Error(`${res.error} ${res.message}`|| "A API retornou erro");
                } else {
                    console.log(message)
                }
            } catch {}

            toast({
                title: "Sucesso",
                description: message,
            });
            router.push("/manager/pacientes");
        } catch (err: any) {
            toast({
                title: "Erro",
                description: err?.message || "Não foi possível cadastrar o paciente",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SecretaryLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Novo Paciente</h1>
                        <p className="text-gray-600">Cadastre um novo paciente no sistema</p>
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados Pessoais</h2>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>
                                <Button variant="outline" type="button" size="sm">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Carregar Foto
                                </Button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nome" className="text-sm font-medium text-gray-700">
                                        Nome *
                                    </Label>
                                    <Input id="nome" name="nome" placeholder="Nome completo" required className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="nomeSocial" className="text-sm font-medium text-gray-700">
                                        Nome Social
                                    </Label>
                                    <Input id="nomeSocial" name="nomeSocial" placeholder="Nome social ou apelido" className="mt-1" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                                        CPF *
                                    </Label>
                                    <Input id="cpf" name="cpf" placeholder="000.000.000-00" required className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="rg" className="text-sm font-medium text-gray-700">
                                        RG
                                    </Label>
                                    <Input id="rg" name="rg" placeholder="00.000.000-0" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="outrosDocumentos" className="text-sm font-medium text-gray-700">
                                        Outros Documentos
                                    </Label>
                                    <Select name="outrosDocumentos">
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cnh">CNH</SelectItem>
                                            <SelectItem value="passaporte">Passaporte</SelectItem>
                                            <SelectItem value="carteira-trabalho">Carteira de Trabalho</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Sexo *</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="sexo" value="Masculino" className="text-blue-600" required/>
                                            <span className="text-sm">Masculino</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="sexo" value="Feminino" className="text-blue-600" required/>
                                            <span className="text-sm">Feminino</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="dataNascimento" className="text-sm font-medium text-gray-700">
                                        Data de Nascimento *
                                    </Label>
                                    <Input id="dataNascimento" name="dataNascimento" type="date" className="mt-1" required/>
                                </div>
                                <div>
                                    <Label htmlFor="estadoCivil" className="text-sm font-medium text-gray-700">
                                        Estado Civil
                                    </Label>
                                    <Select name="estadoCivil">
                                        <SelectTrigger className="mt-1">
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
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="etnia" className="text-sm font-medium text-gray-700">
                                        Etnia
                                    </Label>
                                    <Select name="etnia">
                                        <SelectTrigger className="mt-1">
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
                                <div>
                                    <Label htmlFor="raca" className="text-sm font-medium text-gray-700">
                                        Raça
                                    </Label>
                                    <Select name="raca">
                                        <SelectTrigger className="mt-1">
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
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="naturalidade" className="text-sm font-medium text-gray-700">
                                        Naturalidade
                                    </Label>
                                    <Select name="naturalidade">
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="aracaju">Aracaju</SelectItem>
                                            <SelectItem value="salvador">Salvador</SelectItem>
                                            <SelectItem value="recife">Recife</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="nacionalidade" className="text-sm font-medium text-gray-700">
                                        Nacionalidade
                                    </Label>
                                    <Select name="nacionalidade">
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="brasileira">Brasileira</SelectItem>
                                            <SelectItem value="estrangeira">Estrangeira</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="profissao" className="text-sm font-medium text-gray-700">
                                    Profissão
                                </Label>
                                <Input id="profissao" name="profissao" placeholder="Profissão" className="mt-1" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomeMae" className="text-sm font-medium text-gray-700">
                                        Nome da Mãe
                                    </Label>
                                    <Input id="nomeMae" name="nomeMae" placeholder="Nome da mãe" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="profissaoMae" className="text-sm font-medium text-gray-700">
                                        Profissão da Mãe
                                    </Label>
                                    <Input id="profissaoMae" name="profissaoMae" placeholder="Profissão da mãe" className="mt-1" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomePai" className="text-sm font-medium text-gray-700">
                                        Nome do Pai
                                    </Label>
                                    <Input id="nomePai" name="nomePai" placeholder="Nome do pai" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="profissaoPai" className="text-sm font-medium text-gray-700">
                                        Profissão do Pai
                                    </Label>
                                    <Input id="profissaoPai" name="profissaoPai" placeholder="Profissão do pai" className="mt-1" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomeResponsavel" className="text-sm font-medium text-gray-700">
                                        Nome do Responsável
                                    </Label>
                                    <Input id="nomeResponsavel" name="nomeResponsavel" placeholder="Nome do responsável" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="cpfResponsavel" className="text-sm font-medium text-gray-700">
                                        CPF do Responsável
                                    </Label>
                                    <Input id="cpfResponsavel" name="cpfResponsavel" placeholder="000.000.000-00" className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="nomeEsposo" className="text-sm font-medium text-gray-700">
                                    Nome do Esposo(a)
                                </Label>
                                <Input id="nomeEsposo" name="nomeEsposo" placeholder="Nome do esposo(a)" className="mt-1" />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox id="rnGuia" name="rnGuia" />
                                <Label htmlFor="rnGuia" className="text-sm text-gray-700">
                                    RN na Guia do convênio
                                </Label>
                            </div>

                            <div>
                                <Label htmlFor="codigoLegado" className="text-sm font-medium text-gray-700">
                                    Código Legado
                                </Label>
                                <Input id="codigoLegado" name="codigoLegado" placeholder="Código do sistema anterior" className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                                    Observações
                                </Label>
                                <Textarea id="observacoes" name="observacoes" placeholder="Observações gerais sobre o paciente" className="min-h-[100px] mt-1" />
                            </div>

                            <Collapsible open={anexosOpen} onOpenChange={setAnexosOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" type="button" className="w-full justify-between p-0 h-auto text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                                                <span className="text-white text-xs">📎</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Anexos do paciente</span>
                                        </div>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${anexosOpen ? "rotate-180" : ""}`} />
                                    </Button>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="space-y-4 mt-4">
                                    {anexos.map((anexo, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                            <span className="text-sm">{anexo}</span>
                                            <Button variant="ghost" size="sm" onClick={() => removerAnexo(index)} type="button">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={adicionarAnexo} type="button" size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Anexo
                                    </Button>
                                </CollapsibleContent>
                            </Collapsible>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contato</h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        E-mail *
                                    </Label>
                                    <Input id="email" name="email" type="email" placeholder="email@exemplo.com" className="mt-1" required/>
                                </div>
                                <div>
                                    <Label htmlFor="celular" className="text-sm font-medium text-gray-700">
                                        Celular *
                                    </Label>
                                    <div className="flex mt-1">
                                        <Select>
                                            <SelectTrigger className="w-20 rounded-r-none">
                                                <SelectValue placeholder="+55" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="+55">+55</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input id="celular" name="celular" placeholder="(XX) XXXXX-XXXX" className="rounded-l-none" required/>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="telefone1" className="text-sm font-medium text-gray-700">
                                        Telefone 1
                                    </Label>
                                    <Input id="telefone1" name="telefone1" placeholder="(XX) XXXX-XXXX" className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="telefone2" className="text-sm font-medium text-gray-700">
                                    Telefone 2
                                </Label>
                                <Input id="telefone2" name="telefone2" placeholder="(XX) XXXX-XXXX" className="mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Endereço</h2>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="cep" className="text-sm font-medium text-gray-700">
                                    CEP
                                </Label>
                                <Input id="cep" name="cep" placeholder="00000-000" className="mt-1 max-w-xs" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                                        Endereço
                                    </Label>
                                    <Input id="endereco" name="endereco" placeholder="Rua, Avenida..." className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                                        Número
                                    </Label>
                                    <Input id="numero" name="numero" placeholder="123" className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                                    Complemento
                                </Label>
                                <Input id="complemento" name="complemento" placeholder="Apto, Bloco..." className="mt-1" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                                        Bairro
                                    </Label>
                                    <Input id="bairro" name="bairro" placeholder="Bairro" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                                        Cidade
                                    </Label>
                                    <Input id="cidade" name="cidade" placeholder="Cidade" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                                        Estado
                                    </Label>
                                    <Select name="estado">
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SE">Sergipe</SelectItem>
                                            <SelectItem value="BA">Bahia</SelectItem>
                                            <SelectItem value="AL">Alagoas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Médicas</h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <Label htmlFor="tipoSanguineo" className="text-sm font-medium text-gray-700">
                                        Tipo Sanguíneo
                                    </Label>
                                    <Select name="tipoSanguineo">
                                        <SelectTrigger className="mt-1">
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
                                <div>
                                    <Label htmlFor="peso" className="text-sm font-medium text-gray-700">
                                        Peso
                                    </Label>
                                    <div className="relative mt-1">
                                        <Input id="peso" name="peso" type="number" placeholder="70" />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">kg</span>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="altura" className="text-sm font-medium text-gray-700">
                                        Altura
                                    </Label>
                                    <div className="relative mt-1">
                                        <Input id="altura" name="altura" type="number" step="0.01" placeholder="1.70" />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">m</span>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="imc" className="text-sm font-medium text-gray-700">
                                        IMC
                                    </Label>
                                    <div className="relative mt-1">
                                        <Input id="imc" name="imc" placeholder="Calculado automaticamente" disabled />
                                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">kg/m²</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="alergias" className="text-sm font-medium text-gray-700">
                                    Alergias
                                </Label>
                                <Textarea id="alergias" name="alergias" placeholder="Ex: AAS, Dipirona, etc." className="min-h-[80px] mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações de Convênio</h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="convenio" className="text-sm font-medium text-gray-700">
                                        Convênio
                                    </Label>
                                    <Select name="convenio">
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="particular">Particular</SelectItem>
                                            <SelectItem value="sus">SUS</SelectItem>
                                            <SelectItem value="unimed">Unimed</SelectItem>
                                            <SelectItem value="bradesco">Bradesco Saúde</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="plano" className="text-sm font-medium text-gray-700">
                                        Plano
                                    </Label>
                                    <Input id="plano" name="plano" placeholder="Nome do plano" className="mt-1" />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="numeroMatricula" className="text-sm font-medium text-gray-700">
                                        Nº de Matrícula
                                    </Label>
                                    <Input id="numeroMatricula" name="numeroMatricula" placeholder="Número da matrícula" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="validadeCarteira" className="text-sm font-medium text-gray-700">
                                        Validade da Carteira
                                    </Label>
                                    <Input id="validadeCarteira" name="validadeCarteira" type="date" className="mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="validadeIndeterminada" name="validadeIndeterminada" />
                                <Label htmlFor="validadeIndeterminada" className="text-sm text-gray-700">
                                    Validade Indeterminada
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/manager/pacientes">
                            <Button variant="outline" type="button">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Paciente"}
                        </Button>
                    </div>
                </form>
            </div>
        </SecretaryLayout>
    );
}
