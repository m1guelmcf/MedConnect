// lib/normalization.ts

/**
 * Mapa de normalização.
 * A chave é o termo "sujo" (em minúsculo) e o valor é o termo "Canônico" (Bonito).
 */
const SPECIALTY_MAPPING: Record<string, string> = {
  // --- Cardiologia ---
  "cardiologista": "Cardiologia",
  "cardio": "Cardiologia",
  "cardiologia": "Cardiologia",
  
  // --- Dermatologia ---
  "dermatologista": "Dermatologia",
  "dermato": "Dermatologia",
  "dermatologia": "Dermatologia",
  
  // --- Ortopedia ---
  "ortopedista": "Ortopedia",
  "ortopedia": "Ortopedia",
  
  // --- Ginecologia ---
  "ginecologista": "Ginecologia",
  "ginecologia": "Ginecologia",
  "ginecologistaa": "Ginecologia", // Erro de digitação comum
  "gineco": "Ginecologia",
  
  // --- Pediatria ---
  "pediatra": "Pediatria",
  "pediatria": "Pediatria",
  
  // --- Clínica Geral (Onde estava o erro) ---
  "clinico geral": "Clínica Geral",
  "clínico geral": "Clínica Geral",
  "clinica geral": "Clínica Geral",
  "clínica geral": "Clínica Geral", // <--- ADICIONADO
  "geral": "Clínica Geral",
  "medico geral": "Clínica Geral",
  "médico geral": "Clínica Geral",

  // --- Neurologia ---
  "neurologista": "Neurologia",
  "neurologia": "Neurologia",
  "neuro": "Neurologia",
  "neurocirurgiao": "Neurocirurgia",
  "neurocirurgião": "Neurocirurgia",

  // --- Limpeza de Lixo / Outros ---
  "asdw": "Outros", 
  "teste": "Outros",
  "n/a": "Não Informado", // <--- Transforma o "N/A" da imagem
  "na": "Não Informado",
};

/**
 * Recebe uma especialidade suja e retorna a versão limpa.
 */
export function normalizeSpecialty(raw: string | null | undefined): string {
  if (!raw) return "Não Informado";
  
  // Remove espaços extras e joga para minúsculo
  const lower = raw.trim().toLowerCase();
  
  // Se for uma string vazia ou traço
  if (lower === "" || lower === "-") return "Não Informado";

  // Verifica no mapa
  if (SPECIALTY_MAPPING[lower]) {
    return SPECIALTY_MAPPING[lower];
  }

  // Fallback: Capitaliza a primeira letra de cada palavra
  // Ex: "cirurgia plastica" -> "Cirurgia Plastica"
  return lower.replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Extrai uma lista única de especialidades normalizadas.
 */
export function getUniqueSpecialties(items: any[]): string[] {
  const specialties = new Set<string>();
  
  items.forEach(item => {
    // Normaliza antes de adicionar ao Set
    const normalized = normalizeSpecialty(item.specialty);
    
    // Só adiciona se não for "Não Informado" ou "Outros" (Opcional: remova o if se quiser mostrar tudo)
    if (normalized && normalized !== "Não Informado") {
      specialties.add(normalized);
    }
  });

  return Array.from(specialties).sort();
}