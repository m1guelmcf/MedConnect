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
      <DialogContent className="max-w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Detalhes do Paciente</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informações detalhadas sobre o paciente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Grid Principal */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">Nome Completo</p>
              <p className="text-muted-foreground">{patient.nome}</p>
            </div>
            
            {/* CORREÇÃO AQUI: Adicionado 'break-all' para quebrar o email */}
            <div>
              <p className="font-semibold text-foreground">Email</p>
              <p className="text-muted-foreground break-all">{patient.email || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Telefone</p>
              <p className="text-muted-foreground">{patient.telefone}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Data de Nascimento</p>
              <p className="text-muted-foreground">{patient.birth_date || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">CPF</p>
              <p className="text-muted-foreground">{patient.cpf || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Tipo Sanguíneo</p>
              <p className="text-muted-foreground">{patient.blood_type || "N/A"}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Peso (kg)</p>
              <p className="text-muted-foreground">{patient.weight_kg || "0"}</p>
            </div>

            <div>
              <p className="font-semibold text-foreground">Altura (m)</p>
              <p className="text-muted-foreground">{patient.height_m || "0"}</p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Seção de Endereço */}
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Endereço</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-foreground">Rua</p>
                <p className="text-muted-foreground">
                  {patient.street && patient.street !== "N/A" 
                    ? `${patient.street}, ${patient.number || ""}` 
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Complemento</p>
                <p className="text-muted-foreground">{patient.complement || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Bairro</p>
                <p className="text-muted-foreground">{patient.neighborhood || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Cidade</p>
                <p className="text-muted-foreground">{patient.cidade || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Estado</p>
                <p className="text-muted-foreground">{patient.estado || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">CEP</p>
                <p className="text-muted-foreground">{patient.cep || "N/A"}</p>
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