"use client";

import { AccessibilityProvider } from "./context/AccessibilityContext";
import { AppointmentsProvider } from "./context/AppointmentsContext";
import { AccessibilityModal } from "@/components/accessibility-modal";
import { ThemeInitializer } from "@/components/theme-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeInitializer />
      <AccessibilityProvider>
        <AppointmentsProvider>{children}</AppointmentsProvider>
        <AccessibilityModal />
      </AccessibilityProvider>
    </>
  );
}
