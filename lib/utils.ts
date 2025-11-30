import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cpfDigits = cpf.replace(/\D/g, '');

  if (cpfDigits.length !== 11 || /^(\d)\1+$/.test(cpfDigits)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpfDigits.substring(9, 10))) {
    return false;
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }

  if (remainder !== parseInt(cpfDigits.substring(10, 11))) {
    return false;
  }

  return true;
}

/**
 * Remove tags perigosas de strings HTML para prevenir XSS básico.
 * Em produção, considere usar bibliotecas como 'dompurify'.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  return html
    // Remove tags de script
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    // Remove iframes
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "")
    // Remove eventos on* (ex: onclick, onerror)
    .replace(/ on\w+="[^"]*"/g, "")
    // Remove links javascript:
    .replace(/href="javascript:[^"]*"/g, 'href="#"');
}