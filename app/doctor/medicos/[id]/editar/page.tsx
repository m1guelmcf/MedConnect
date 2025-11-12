"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

// Mock data - in a real app, this would come from an API
const mockDoctors = [
    {
        id: 1,
        nome: "Dr. Carlos Silva",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        sexo: "masculino",
        dataNascimento: "1980-05-15",
        etnia: "branca",
        raca: "caucasiana",
        naturalidade: "Aracaju",
        nacionalidade: "brasileira",
        profissao: "Médico",
        estadoCivil: "casado",
        nomeMae: "Ana Silva",
        nomePai: "José Silva",
        nomeEsposo: "Maria Silva",
        crm: "CRM/SE 12345",
        especialidade: "Cardiologia",
        email: "carlos@email.com",
        celular: "(79) 99999-1234",
        telefone1: "(79) 3214-5678",
        telefone2: "",
        cep: "49000-000",
        endereco: "Rua dos Médicos, 123",
        numero: "123",
        complemento: "Sala 101",
        bairro: "Centro",
        cidade: "Aracaju",
        estado: "SE",
        tipoSanguineo: "A+",
        peso: "80",
        altura: "1.80",
        alergias: "Nenhuma alergia conhecida",
        convenio: "Particular",
        plano: "Premium",
        numeroMatricula: "123456789",
        validadeCarteira: "2025-12-31",
        observacoes: "Médico experiente",
    },
];

export default function EditarMedicoPage() {
    const router = useRouter();
    const params = useParams();
    const doctorId = Number.parseInt(params.id as string);

    const [formData, setFormData] = useState({
        nome: "",
        cpf: "",
        rg: "",
        sexo: "",
        dataNascimento: "",
        etnia: "",
        raca: "",
        naturalidade: "",
        nacionalidade: "",
        profissao: "",
        estadoCivil: "",
        nomeMae: "",
        nomePai: "",
        nomeEsposo: "",
        crm: "",
        especialidade: "",
        email: "",
        celular: "",
        telefone1: "",
        telefone2: "",
        cep: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        tipoSanguineo: "",
        peso: "",
        altura: "",
        alergias: "",
        convenio: "",
        plano: "",
        numeroMatricula: "",
        validadeCarteira: "",
        observacoes: "",
    });

    const [isGuiaConvenio, setIsGuiaConvenio] = useState(false);
    const [validadeIndeterminada, setValidadeIndeterminada] = useState(false);

    useEffect(() => {
        // Load doctor data
        const doctor = mockDoctors.find((d) => d.id === doctorId);
        if (doctor) {
            setFormData(doctor);
        }
    }, [doctorId]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("[v0] Updating doctor:", formData);
        // Here you would typically send the data to your API
        router.push("/medicos");
    };

    return (
        <Sidebar>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href="/medicos">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Editar Médico</h1>
                        <p className="text-gray-600">Atualize as informações do médico</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados Pessoais</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <input type="radio" id="masculino" name="sexo" value="masculino" checked={formData.sexo === "masculino"} onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-blue-600" />
                                        <Label htmlFor="masculino">Masculino</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="radio" id="feminino" name="sexo" value="feminino" checked={formData.sexo === "feminino"} onChange={(e) => handleInputChange("sexo", e.target.value)} className="w-4 h-4 text-blue-600" />
                                        <Label htmlFor="feminino">Feminino</Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                                <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={(e) => handleInputChange("dataNascimento", e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="etnia">Etnia</Label>
                                <Select value={formData.etnia} onValueChange={(value) => handleInputChange("etnia", value)}>
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
                                <Select value={formData.raca} onValueChange={(value) => handleInputChange("raca", value)}>
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
                                <Input id="naturalidade" value={formData.naturalidade} onChange={(e) => handleInputChange("naturalidade", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                                <Select value={formData.nacionalidade} onValueChange={(value) => handleInputChange("nacionalidade", value)}>
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
                                <Input id="profissao" value={formData.profissao} onChange={(e) => handleInputChange("profissao", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estadoCivil">Estado civil</Label>
                                <Select value={formData.estadoCivil} onValueChange={(value) => handleInputChange("estadoCivil", value)}>
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
                                <Input id="nomeMae" value={formData.nomeMae} onChange={(e) => handleInputChange("nomeMae", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomePai">Nome do pai</Label>
                                <Input id="nomePai" value={formData.nomePai} onChange={(e) => handleInputChange("nomePai", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeEsposo">Nome do esposo(a)</Label>
                                <Input id="nomeEsposo" value={formData.nomeEsposo} onChange={(e) => handleInputChange("nomeEsposo", e.target.value)} />
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
                            <Textarea id="observacoes" value={formData.observacoes} onChange={(e) => handleInputChange("observacoes", e.target.value)} placeholder="Digite observações sobre o médico..." className="mt-2" />
                        </div>
                    </div>

                    {/* Professional Information Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Profissionais</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="crm">CRM *</Label>
                                <Input id="crm" value={formData.crm} onChange={(e) => handleInputChange("crm", e.target.value)} placeholder="CRM/UF 12345" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="especialidade">Especialidade *</Label>
                                <Select value={formData.especialidade} onValueChange={(value) => handleInputChange("especialidade", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione a especialidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                                        <SelectItem value="Pediatria">Pediatria</SelectItem>
                                        <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                                        <SelectItem value="Neurologia">Neurologia</SelectItem>
                                        <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                                        <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                                        <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                                        <SelectItem value="Oftalmologia">Oftalmologia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Contato</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="celular">Celular</Label>
                                <Input id="celular" value={formData.celular} onChange={(e) => handleInputChange("celular", e.target.value)} placeholder="(00) 00000-0000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone1">Telefone 1</Label>
                                <Input id="telefone1" value={formData.telefone1} onChange={(e) => handleInputChange("telefone1", e.target.value)} placeholder="(00) 0000-0000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone2">Telefone 2</Label>
                                <Input id="telefone2" value={formData.telefone2} onChange={(e) => handleInputChange("telefone2", e.target.value)} placeholder="(00) 0000-0000" />
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Endereço</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input id="cep" value={formData.cep} onChange={(e) => handleInputChange("cep", e.target.value)} placeholder="00000-000" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endereco">Endereço</Label>
                                <Input id="endereco" value={formData.endereco} onChange={(e) => handleInputChange("endereco", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="numero">Número</Label>
                                <Input id="numero" value={formData.numero} onChange={(e) => handleInputChange("numero", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="complemento">Complemento</Label>
                                <Input id="complemento" value={formData.complemento} onChange={(e) => handleInputChange("complemento", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bairro">Bairro</Label>
                                <Input id="bairro" value={formData.bairro} onChange={(e) => handleInputChange("bairro", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <Input id="cidade" value={formData.cidade} onChange={(e) => handleInputChange("cidade", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado">Estado</Label>
                                <Select value={formData.estado} onValueChange={(value) => handleInputChange("estado", value)}>
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
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Médicas</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="tipoSanguineo">Tipo Sanguíneo</Label>
                                <Select value={formData.tipoSanguineo} onValueChange={(value) => handleInputChange("tipoSanguineo", value)}>
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
                                <Input id="peso" type="number" value={formData.peso} onChange={(e) => handleInputChange("peso", e.target.value)} placeholder="0.0" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="altura">Altura (m)</Label>
                                <Input id="altura" type="number" step="0.01" value={formData.altura} onChange={(e) => handleInputChange("altura", e.target.value)} placeholder="0.00" />
                            </div>

                            <div className="space-y-2">
                                <Label>IMC</Label>
                                <Input value={formData.peso && formData.altura ? (Number.parseFloat(formData.peso) / Number.parseFloat(formData.altura) ** 2).toFixed(2) : ""} disabled placeholder="Calculado automaticamente" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <Label htmlFor="alergias">Alergias</Label>
                            <Textarea id="alergias" value={formData.alergias} onChange={(e) => handleInputChange("alergias", e.target.value)} placeholder="Ex: AAS, Dipirona, etc." className="mt-2" />
                        </div>
                    </div>

                    {/* Insurance Information Section */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações de convênio</h2>

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

                    <div className="flex justify-end gap-4">
                        <Link href="/medicos">
                            <Button type="button" variant="outline">
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
}
