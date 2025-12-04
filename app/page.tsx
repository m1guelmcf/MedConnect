"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Stethoscope, Baby, Microscope } from "lucide-react";
import { useAccessibility } from "./context/AccessibilityContext";

export default function InicialPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { contrast } = useAccessibility();

  const heroClass = contrast === "high"
    ? "px-6 md:px-10 lg:px-20 py-20 bg-background text-foreground border-y-2 border-primary"
    : "px-6 md:px-10 lg:px-20 py-20 bg-gradient-to-r from-[#1E2A78] via-[#007BFF] to-[#00BFFF] text-white";

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans scroll-smooth text-foreground">
      {/* Barra superior */}
      <div className="bg-primary text-primary-foreground text-sm py-2 px-4 md:px-6 flex justify-between items-center">
        <span className="hidden sm:inline">Horário: 08h00 - 21h00</span>
        <span className="hover:underline cursor-pointer transition">
          Email: contato@mediconnect.com
        </span>
      </div>
      {/* Header */}
      <header className="bg-muted text-foreground shadow-md py-4 px-4 md:px-6 flex justify-between items-center relative sticky top-0 z-50 backdrop-blur-md">
        <a href="#home" className="flex items-center space-x-2 cursor-pointer">
          <img
            src="/android-chrome-512x512.png"
            alt="Logo MediConnect"
            className="w-20 h-20 object-contain transition-transform hover:scale-105"
          />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            MedConnect
          </h1>
        </a>

        {/* Menu Mobile */}
        <div className="md:hidden flex items-center space-x-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-full px-4 py-2 text-sm border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              Login
            </Button>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#1E2A78] focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>

        {/* Navegação */}
        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } absolute top-[76px] left-0 w-full bg-white shadow-md py-4 md:relative md:top-auto md:left-auto md:w-auto md:block md:bg-transparent md:shadow-none transition-all duration-300 z-10`}
        >
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 text-foreground font-medium items-center">
            <Link href="#home" className="hover:text-primary transition">
              Home
            </Link>
            <a href="#about" className="hover:text-primary transition">
              Sobre
            </a>
            <a href="#departments" className="hover:text-primary transition">
              Departamentos
            </a>
            <a href="#doctors" className="hover:text-primary transition">
              Médicos
            </a>
            <a href="#contact" className="hover:text-primary transition">
              Contato
            </a>
          </div>
        </nav>

        {/* Login Desktop */}
        <div className="hidden md:flex space-x-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
            >
              Login
            </Button>
          </Link>
        </div>
      </header>
      {/* Hero Section */}
      <section className={`flex flex-col md:flex-row items-center justify-between ${heroClass}`}>
        <div className="max-w-lg mx-auto md:mx-0">
          <h2 className="uppercase text-sm tracking-widest opacity-80">
            Bem-vindo à Saúde Digital
          </h2>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mt-2 drop-shadow-lg">
            Soluções Médicas <br /> & Cuidados com a Saúde
          </h1>
          <p className="mt-4 text-base leading-relaxed opacity-90 text-foreground">
            Excelência em saúde há mais de 25 anos. Atendimento médico com
            qualidade, segurança e carinho.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <Button className="px-8 py-3 text-base font-semibold bg-card text-card-foreground hover:bg-muted transition-all shadow-md">
              Nossos Serviços
            </Button>
            <Button className="px-8 py-3 text-base font-semibold bg-card text-card-foreground hover:bg-muted transition-all shadow-md">
              Saiba Mais
            </Button>
          </div>
        </div>
        <div className="mt-10 md:mt-0 flex justify-center">
          <img
            src="https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2XDTvvKfz2oRuRpKOPE5z0ni.jpg"
            alt="Médico"
            className="w-72 sm:w-96 lg:w-[28rem] h-auto object-cover rounded-2xl shadow-xl "
          />
        </div>
      </section>
      {/* Serviços */}
      <section
        id="departments"
        className="py-20 px-6 md:px-10 lg:px-20 bg-secondary"
      >
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-foreground">
          Cuidados completos para a sua saúde
        </h2>
        <p className="text-center text-muted-foreground mt-3 text-base">
          Serviços médicos que oferecemos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-12 max-w-6xl mx-auto">
          {/* Card */}
          {[
            {
              title: "Clínica Geral",
              desc: "Seu primeiro passo para o cuidado. Atendimento focado na prevenção e no diagnóstico inicial.",
              Icon: Stethoscope,
            },
            {
              title: "Pediatria",
              desc: "Cuidado gentil e especializado para garantir a saúde e o desenvolvimento de crianças e adolescentes.",
              Icon: Baby,
            },
            {
              title: "Exames",
              desc: "Resultados rápidos e precisos em exames laboratoriais e de imagem essenciais para seu diagnóstico.",
              Icon: Microscope,
            },
          ].map(({ title, desc, Icon }, index) => (
            <div
              key={index}
              className="p-8 bg-card rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-border group"
            >
              <div className="flex items-center space-x-3">
                <Icon className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {desc}
              </p>
              <Button className="mt-6 w-full bg-primary hover:opacity-90 text-primary-foreground transition">
                Agendar
              </Button>
            </div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 text-center text-sm border-t-2 border-primary-foreground/20">
        <div className="space-y-2">
          <p>© 2025 MediConnect — Todos os direitos reservados</p>
          <div className="flex justify-center space-x-6 opacity-90">
            <a href="#about" className="hover:opacity-70 transition">
              Sobre
            </a>
            <a href="#departments" className="hover:opacity-70 transition">
              Serviços
            </a>
            <a href="#contact" className="hover:opacity-70 transition">
              Contato
            </a>
          </div>
        </div>
      </footer>
         
    </div>
  );
}
