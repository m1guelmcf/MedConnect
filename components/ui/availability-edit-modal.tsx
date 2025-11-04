'use client'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { start } from "repl";
import { appointmentsService } from "@/services/appointmentsApi.mjs";

type Availability = {
    id: string;
    doctor_id: string;
    weekday: string;
    start_time: string;
    end_time: string;
    slot_minutes: number;
    appointment_type: string;
    active: boolean;
    created_at: string;
    updated_at: string;
    created_by: string;
    updated_by: string | null;
};

interface AvailabilityEditModalProps {
  isOpen: boolean;
  availability: Availability | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export function AvailabilityEditModal({ availability, isOpen, onClose, onSubmit }: AvailabilityEditModalProps) {
  const [modalidadeConsulta, setModalidadeConsulta] = useState<string>("");
  const [form, setForm] = useState({ start_time: "", end_time: "", slot_minutes: "", appointment_type: "", id:availability?.id});
    // Mapa de tradução
  const weekdaysPT: Record<string, string> = {
    sunday: "Domingo",
    monday: "Segunda-Feira",
    tuesday: "Terça-Feira",
    wednesday: "Quarta-Feira",
    thursday: "Quinta-Feira",
    friday: "Sexta-Feira",
    saturday: "Sábado",
  };
  
  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleFormSubmit = () => {
    onSubmit(form);
  };
  
  useEffect(() => {
    if (availability) {
    setModalidadeConsulta(availability.appointment_type);
    setForm({
      start_time: availability.start_time,
      end_time: availability.end_time,
      slot_minutes: availability.slot_minutes.toString(),
      appointment_type: availability.appointment_type,
      id: availability.id
    });
  }
  }, [availability])

  if (!availability) {
  return null;
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edite a disponibilidade</DialogTitle>
          <DialogDescription>Altere a disponibilidade atual.</DialogDescription>
        </DialogHeader>
          <form  onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
            <div className="grid gap-4 py-1" >
                <h3 className="font-semibold mb-2">{weekdaysPT[availability.weekday]}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time" className="font-semibold">Horário de entrada *</Label>
                  <Input id="start_time" type="time" value={form.start_time} onChange={(e) => handleInputChange("start_time", e.target.value)}/>
                </div>
                <div>
                  <Label htmlFor="end_time" className="font-semibold">Horário de saída *</Label>
                  <Input id="end_time" type="time" value={form.end_time} onChange={(e) => handleInputChange("end_time", e.target.value)}/>
                </div>              
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duracaoConsulta" className="text-sm font-medium text-gray-700">
                    Duração Da Consulta (min)
                  </Label>
                  <Input type="number" id="duracaoConsulta" value={form.slot_minutes} onChange={(e) => handleInputChange("slot_minutes", e.target.value)} name="duracaoConsulta" required  className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="modalidadeConsulta" className="text-sm font-medium text-gray-700">
                    Modalidade De Consulta
                    </Label>
                    <Select value={form.appointment_type} onValueChange={(value) => {setModalidadeConsulta(value); handleInputChange("appointment_type", value);}}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presencial">Presencial </SelectItem>
                        <SelectItem value="telemedicina">Telemedicina</SelectItem>
                      </SelectContent>
                    </Select>
                </div>           
              </div>   
              <div className="grid grid-cols-5 gap-4">           
                <Button type="submit" className="col-start-5 bg-green-600 hover:bg-green-700">Confirmar</Button>
              </div>
            </div>  
          </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" className="px-4 py-2 bg-gray-200 rounded-md">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
