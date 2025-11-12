"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function InicialPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Barra superior de informações */}
      <div className="bg-primary text-primary-foreground text-sm py-2 px-4 md:px-6 flex justify-between items-center">
        <span className="hidden sm:inline">Horário: 08h00 - 21h00</span>
        <span>Email: contato@mediconnect.com</span>
      </div>

      {/* Header principal */}
      <header className="bg-card shadow-md py-4 px-4 md:px-6 flex justify-between items-center relative">
        <h1 className="text-2xl font-bold text-primary">MediConnect</h1>

        {/* Botão do menu hambúrguer para telas menores */}
        <div className="md:hidden flex items-center space-x-4">
          {/* O botão de login agora estará sempre aqui, fora do menu */}
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-full px-4 py-2 text-sm border-2 transition cursor-pointer"
            >
              Login
            </Button>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-primary-foreground focus:outline-none"
          >
            <svg
              className="w-6 h-6 text-primary"
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

        {/* Navegação principal */}
        <nav
          className={`${isMenuOpen ? "block" : "hidden"
            } absolute top-[76px] left-0 w-full bg-card shadow-md py-4 md:relative md:top-auto md:left-auto md:w-auto md:block md:bg-transparent md:shadow-none z-10`}
        >
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 text-muted-foreground font-medium items-center">
            <Link href="#home" className="hover:text-primary">
              Home
            </Link>
            <a href="#about" className="hover:text-primary">
              Sobre
            </a>
            <a href="#departments" className="hover:text-primary">
              Departamentos
            </a>
            <a href="#doctors" className="hover:text-primary">
              Médicos
            </a>
            <a href="#contact" className="hover:text-primary">
              Contato
            </a>
          </div>
        </nav>

        {/* Botão de Login para telas maiores (md e acima) */}
        <div className="hidden md:flex space-x-4">
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 border-2 transition cursor-pointer"
            >
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Seção principal de destaque */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 lg:px-20 py-16 bg-background text-center md:text-left">
        <div className="max-w-lg mx-auto md:mx-0">
          <h2 className="text-muted-foreground uppercase text-sm">
            Bem-vindo à Saúde Digital
          </h2>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mt-2">
            Soluções Médicas <br /> & Cuidados com a Saúde
          </h1>
          <p className="text-muted-foreground mt-4 text-sm sm:text-base">
            Excelência em saúde há mais de 25 anos. Atendimento médico com
            qualidade, segurança e carinho.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <Button>Nossos Serviços</Button>
            <Button variant="secondary">Saiba Mais</Button>
          </div>
        </div>
        <div className="mt-10 md:mt-0 flex justify-center">
          <img
            src="https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2XDTvvKfz2oRuRpKOPE5z0ni.jpg"
            alt="Médico"
            className="w-60 sm:w-80 lg:w-96 h-auto object-cover rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Seção de serviços */}
      <section className="py-16 px-6 md:px-10 lg:px-20 bg-card">
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-foreground">
          Cuidados completos para a sua saúde
        </h2>
        <p className="text-center text-muted-foreground mt-2 text-sm sm:text-base">
          Serviços médicos que oferecemos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10 max-w-5xl mx-auto">
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Clínica Geral</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Seu primeiro passo para o cuidado. Atendimento focado na prevenção e
              no diagnóstico inicial.
            </p>
            <Button className="mt-4 w-full">Agendar</Button>
          </div>
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Pediatria</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Cuidado gentil e especializado para garantir a saúde e o
              desenvolvimento de crianças e adolescentes.
            </p>
            <Button className="mt-4 w-full">Agendar</Button>
          </div>
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Exames</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Resultados rápidos e precisos em exames laboratoriais e de imagem
              essenciais para seu diagnóstico.
            </p>
            <Button className="mt-4 w-full">Agendar</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-6 text-center text-sm">
        <p>© 2025 MediConnect</p>
      </footer>
    </div>
  );
}