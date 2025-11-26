"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Plus, X, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Sidebar from "@/components/Sidebar";

export default function NovoMedicoPage() {
    const [anexosOpen, setAnexosOpen] = useState(false);
    const [anexos, setAnexos] = useState<string[]>([]);

    const adicionarAnexo = () => {
        setAnexos([...anexos, `Documento ${anexos.length + 1}`]);
    };

    const removerAnexo = (index: number) => {
        setAnexos(anexos.filter((_, i) => i !== index));
    };

    return (
        <Sidebar>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Novo Médico</h1>
                        <p className="text-gray-600">Cadastre um novo médico no sistema</p>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Dados Pessoais</h2>

                        <div className="space-y-6">
                            {/* Foto */}
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
                                    <Input id="nome" placeholder="Nome completo" required className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="nomeSocial" className="text-sm font-medium text-gray-700">
                                        Nome Social
                                    </Label>
                                    <Input id="nomeSocial" placeholder="Nome social ou apelido" className="mt-1" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">
                                        CPF *
                                    </Label>
                                    <Input id="cpf" placeholder="000.000.000-00" required className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="rg" className="text-sm font-medium text-gray-700">
                                        RG
                                    </Label>
                                    <Input id="rg" placeholder="00.000.000-0" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="crm" className="text-sm font-medium text-gray-700">
                                        CRM *
                                    </Label>
                                    <Input id="crm" placeholder="CRM/UF 12345" required className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="outrosDocumentos" className="text-sm font-medium text-gray-700">
                                    Outros Documentos
                                </Label>
                                <Select>
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

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Sexo</Label>
                                    <div className="flex gap-4 mt-2">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="sexo" value="masculino" className="text-blue-600" />
                                            <span className="text-sm">Masculino</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="sexo" value="feminino" className="text-blue-600" />
                                            <span className="text-sm">Feminino</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="dataNascimento" className="text-sm font-medium text-gray-700">
                                        Data de Nascimento
                                    </Label>
                                    <Input id="dataNascimento" type="date" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="estadoCivil" className="text-sm font-medium text-gray-700">
                                        Estado Civil
                                    </Label>
                                    <Select>
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
                                    <Select>
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
                                    <Select>
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
                                    <Select>
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
                                    <Select>
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

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="profissao" className="text-sm font-medium text-gray-700">
                                        Profissão
                                    </Label>
                                    <Input id="profissao" placeholder="Médico" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="especialidade" className="text-sm font-medium text-gray-700">
                                        Especialidade *
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cardiologia">Cardiologia</SelectItem>
                                            <SelectItem value="pediatria">Pediatria</SelectItem>
                                            <SelectItem value="ortopedia">Ortopedia</SelectItem>
                                            <SelectItem value="ginecologia">Ginecologia</SelectItem>
                                            <SelectItem value="neurologia">Neurologia</SelectItem>
                                            <SelectItem value="dermatologia">Dermatologia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nomeMae" className="text-sm font-medium text-gray-700">
                                        Nome da Mãe
                                    </Label>
                                    <Input id="nomeMae" placeholder="Nome da mãe" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="nomePai" className="text-sm font-medium text-gray-700">
                                        Nome do Pai
                                    </Label>
                                    <Input id="nomePai" placeholder="Nome do pai" className="mt-1" />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="nomeEsposo" className="text-sm font-medium text-gray-700">
                                    Nome do Esposo(a)
                                </Label>
                                <Input id="nomeEsposo" placeholder="Nome do esposo(a)" className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="codigoLegado" className="text-sm font-medium text-gray-700">
                                    Código Legado
                                </Label>
                                <Input id="codigoLegado" placeholder="Código do sistema anterior" className="mt-1" />
                            </div>

                            <div>
                                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                                    Observações
                                </Label>
                                <Textarea id="observacoes" placeholder="Observações gerais sobre o médico" className="min-h-[100px] mt-1" />
                            </div>

                            <Collapsible open={anexosOpen} onOpenChange={setAnexosOpen}>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" type="button" className="w-full justify-between p-0 h-auto text-left">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                                                <span className="text-white text-xs">📎</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">Anexos do médico</span>
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
                                        E-mail
                                    </Label>
                                    <Input id="email" type="email" placeholder="email@exemplo.com" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="celular" className="text-sm font-medium text-gray-700">
                                        Celular
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
                                        <Input placeholder="(XX) XXXXX-XXXX" className="rounded-l-none" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="telefone1" className="text-sm font-medium text-gray-700">
                                        Telefone 1
                                    </Label>
                                    <Input id="telefone1" placeholder="(XX) XXXX-XXXX" className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="telefone2" className="text-sm font-medium text-gray-700">
                                    Telefone 2
                                </Label>
                                <Input id="telefone2" placeholder="(XX) XXXX-XXXX" className="mt-1" />
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
                                <Input id="cep" placeholder="00000-000" className="mt-1 max-w-xs" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <Label htmlFor="endereco" className="text-sm font-medium text-gray-700">
                                        Endereço
                                    </Label>
                                    <Input id="endereco" placeholder="Rua, Avenida..." className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="numero" className="text-sm font-medium text-gray-700">
                                        Número
                                    </Label>
                                    <Input id="numero" placeholder="123" className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="complemento" className="text-sm font-medium text-gray-700">
                                    Complemento
                                </Label>
                                <Input id="complemento" placeholder="Apto, Bloco..." className="mt-1" />
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="bairro" className="text-sm font-medium text-gray-700">
                                        Bairro
                                    </Label>
                                    <Input id="bairro" placeholder="Bairro" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="cidade" className="text-sm font-medium text-gray-700">
                                        Cidade
                                    </Label>
                                    <Input id="cidade" placeholder="Cidade" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="estado" className="text-sm font-medium text-gray-700">
                                        Estado
                                    </Label>
                                    <Select>
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
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações Profissionais</h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="numeroConselho" className="text-sm font-medium text-gray-700">
                                        Número do Conselho
                                    </Label>
                                    <Input id="numeroConselho" placeholder="Número do CRM" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="ufConselho" className="text-sm font-medium text-gray-700">
                                        UF do Conselho
                                    </Label>
                                    <Select>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SE">SE</SelectItem>
                                            <SelectItem value="BA">BA</SelectItem>
                                            <SelectItem value="AL">AL</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="dataFormatura" className="text-sm font-medium text-gray-700">
                                        Data de Formatura
                                    </Label>
                                    <Input id="dataFormatura" type="date" className="mt-1" />
                                </div>
                                <div>
                                    <Label htmlFor="instituicaoFormacao" className="text-sm font-medium text-gray-700">
                                        Instituição de Formação
                                    </Label>
                                    <Input id="instituicaoFormacao" placeholder="Nome da universidade" className="mt-1" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="especialidades" className="text-sm font-medium text-gray-700">
                                    Especialidades Adicionais
                                </Label>
                                <Textarea id="especialidades" placeholder="Liste outras especialidades ou subespecialidades..." className="min-h-[80px] mt-1" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href="/doctor/medicos">
                            <Button variant="outline">Cancelar</Button>
                        </Link>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                            Salvar Médico
                        </Button>
                    </div>
                </form>
            </div>
        </Sidebar>
    );
}
