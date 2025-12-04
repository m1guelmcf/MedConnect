"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// A interface Appointment permanece a mesma
export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  phone: string;
  status: 'Agendada' | 'Realizada' | 'Cancelada';
  observations?: string;
}

export interface AppointmentsContextType {
  appointments: Appointment[];
  addAppointment: (appointmentData: Omit<Appointment, 'id' | 'status'>) => void;
  updateAppointment: (appointmentId: string, updatedData: Partial<Omit<Appointment, 'id'>>) => void;
  // [NOVA FUNÇÃO] Adicionando a assinatura da função de exclusão ao nosso contrato
  deleteAppointment: (appointmentId: string) => void;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

// Os dados iniciais permanecem os mesmos
const initialAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: "Dr. João Silva",
    specialty: "Cardiologia",
    date: "2024-08-15",
    time: "14:30",
    status: "Agendada",
    location: "Consultório A - 2º andar",
    phone: "(11) 3333-4444",
    observations: "Paciente relata dor no peito.",
  },
  {
    id: '2',
    doctorName: "Dra. Maria Santos",
    specialty: "Dermatologia",
    date: "2024-09-10",
    time: "10:00",
    status: "Agendada",
    location: "Consultório B - 1º andar",
    phone: "(11) 3333-5555",
  },
  {
    id: '3',
    doctorName: "Dr. Pedro Costa",
    specialty: "Ortopedia",
    date: "2024-07-08",
    time: "16:00",
    status: "Realizada",
    location: "Consultório C - 3º andar",
    phone: "(11) 3333-6666",
  },
];

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      status: 'Agendada',
      ...appointmentData,
    };
    setAppointments((prev) => [...prev, newAppointment]);
  };

  const updateAppointment = (appointmentId: string, updatedData: Partial<Omit<Appointment, 'id'>>) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, ...updatedData } : apt
      )
    );
  };

  // [NOVA FUNÇÃO] Implementando a lógica de exclusão real
  const deleteAppointment = (appointmentId: string) => {
    setAppointments((prev) => 
      // O método 'filter' cria um novo array com todos os itens
      // EXCETO aquele cujo ID corresponde ao que queremos excluir.
      prev.filter((apt) => apt.id !== appointmentId)
    );
  };

  const value = {
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment, // Disponibilizando a nova função para os componentes
  };

  return (
    <AppointmentsContext.Provider value={value}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments deve ser usado dentro de um AppointmentsProvider');
  }
  return context;
}