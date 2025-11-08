"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  estado: string;
  ultimoAtendimento?: string;
  proximoAtendimento?: string;
}

export default function PacientesPage() {

  return (
    <Sidebar>
      <div></div>
    </Sidebar>
  );
}
