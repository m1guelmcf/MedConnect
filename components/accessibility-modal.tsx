"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "@/app/context/AccessibilityContext";
import { Sun, Moon, Contrast, Accessibility } from "lucide-react";

export function AccessibilityModal() {
  const {
    theme,
    setTheme,
    contrast,
    setContrast,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
  } = useAccessibility();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleContrast = () => {
    setContrast(contrast === "normal" ? "high" : "normal");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14">
          <Accessibility className="h-6 w-6" />
          <span className="sr-only">Abrir configurações de acessibilidade</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Acessibilidade</DialogTitle>
          <DialogDescription>
            Ajuste a aparência do site para a sua preferência. Suas
            configurações serão salvas para a próxima visita.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center gap-2">
              {theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>Modo Escuro</span>
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex items-center gap-2">
              <Contrast className="h-5 w-5" />
              <span>Alto Contraste</span>
            </Label>
            <Switch
              id="high-contrast"
              checked={contrast === "high"}
              onCheckedChange={toggleContrast}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
                <span className="text-base">Tamanho da Fonte</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={decreaseFontSize} aria-label="Diminuir tamanho da fonte">
                A-
              </Button>
              <Button variant="outline" size="sm" onClick={resetFontSize} aria-label="Resetar tamanho da fonte">
                A
              </Button>
              <Button variant="outline" size="sm" onClick={increaseFontSize} aria-label="Aumentar tamanho da fonte">
                A+
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
