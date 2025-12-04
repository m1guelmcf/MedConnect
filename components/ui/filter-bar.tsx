"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;        // O nome do estado que vai guardar esse valor (ex: 'specialty')
  label: string;      // O placeholder do select (ex: 'Especialidade')
  options: FilterOption[] | string[]; // Opções do dropdown
}

interface FilterBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  className?: string;
  children?: React.ReactNode; // Para botões extras (ex: "Novo Médico", paginação)
}

export function FilterBar({
  onSearch,
  searchTerm,
  searchPlaceholder = "Pesquisar...",
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  children,
  className,
}: FilterBarProps) {
  
  // Verifica se tem algum filtro ativo para mostrar o botão de limpar
  const hasActiveFilters = 
    searchTerm !== "" || 
    Object.values(activeFilters).some(val => val !== "all" && val !== "");

  return (
    <div className={`flex flex-col md:flex-row items-start md:items-center gap-3 bg-card p-4 rounded-lg border ${className}`}>
      
      {/* Barra de Pesquisa */}
      <div className="relative w-full md:flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-10 w-full bg-muted border-border focus:bg-card transition-colors"
        />
      </div>

      {/* Filtros Dinâmicos (Selects) */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {filters.map((filter) => (
          <div key={filter.key} className="w-full sm:w-auto">
            <Select
              value={activeFilters[filter.key] || "all"}
              onValueChange={(value) => onFilterChange(filter.key, value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos: {filter.label}</SelectItem>
                {filter.options.map((opt) => {
                  // Suporta tanto array de strings quanto array de objetos {label, value}
                  const value = typeof opt === 'string' ? opt : opt.value;
                  const label = typeof opt === 'string' ? opt : opt.label;
                  return (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        ))}

        {/* Botão de Limpar Filtros */}
        {hasActiveFilters && onClearFilters && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-destructive"
            title="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Botões Extras (ex: Novo Médico, Paginação) passados como children */}
        {children}
      </div>
    </div>
  );
}