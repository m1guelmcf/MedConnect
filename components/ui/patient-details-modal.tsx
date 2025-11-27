"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Paciente {
    id: string;
    nome: string;
    telefone: string;
    cidade: string;
    estado: string;
    email?: string;
    birth_date?: string;
    cpf?: string;
    blood_type?: string;
    weight_kg?: number;
    height_m?: number;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    cep?: string;
    [key: string]: any; // Para permitir outras propriedades se necessário
}

interface PatientDetailsModalProps {
  patient: Paciente | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDetailsModal({
  patient,
  isOpen,
  onClose,
}: PatientDetailsModalProps) {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Detalhes do Paciente</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre o paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Grid Principal */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Nome Completo</p>
              <p className="text-gray-700">{patient.nome}</p>
            </div>
            
            {/* CORREÇÃO AQUI: Adicionado 'break-all' para quebrar o email */}
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <p className="text-gray-700 break-all">{patient.email || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Telefone</p>
              <p className="text-gray-700">{patient.telefone}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Data de Nascimento</p>
              <p className="text-gray-700">{patient.birth_date || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">CPF</p>
              <p className="text-gray-700">{patient.cpf || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Tipo Sanguíneo</p>
              <p className="text-gray-700">{patient.blood_type || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Peso (kg)</p>
              <p className="text-gray-700">{patient.weight_kg || "0"}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Altura (m)</p>
              <p className="text-gray-700">{patient.height_m || "0"}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Seção de Endereço */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-900">Endereço</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-900">Rua</p>
                <p className="text-gray-700">
                  {patient.street && patient.street !== "N/A" 
                    ? `${patient.street}, ${patient.number || ""}` 
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Complemento</p>
                <p className="text-gray-700">{patient.complement || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Bairro</p>
                <p className="text-gray-700">{patient.neighborhood || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cidade</p>
                <p className="text-gray-700">{patient.cidade || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Estado</p>
                <p className="text-gray-700">{patient.estado || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">CEP</p>
                <p className="text-gray-700">{patient.cep || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}