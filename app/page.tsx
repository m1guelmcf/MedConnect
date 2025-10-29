"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"


export default function InicialPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {}
      <div className="bg-primary text-primary-foreground text-sm py-2 px-6 flex justify-between">
        <span> Horário: 08h00 - 21h00</span>
        <span> Email: contato@mediconnect.com</span>
      </div>

      {}
      <header className="bg-card shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">MediConnect</h1>
        <nav className="flex space-x-6 text-muted-foreground font-medium">
          <Link href="/cadastro" className="hover:text-primary"> Home</Link>
          <a href="#about" className="hover:text-primary">Sobre</a>
          <a href="#departments" className="hover:text-primary">Departamentos</a>
          <a href="#doctors" className="hover:text-primary">Médicos</a>
          <a href="#contact" className="hover:text-primary">Contato</a>
        </nav>
       <div className="flex space-x-4">
  {}
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

      {}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 md:px-20 py-16 bg-background">
        <div className="max-w-lg">
          <h2 className="text-muted-foreground uppercase text-sm">Bem-vindo à Saúde Digital</h2>
          <h1 className="text-4xl font-extrabold text-foreground leading-tight mt-2">
            Soluções Médicas <br /> & Cuidados com a Saúde
          </h1>
          <p className="text-muted-foreground mt-4">
            Excelência em saúde há mais de 25 anos. Atendimento médicio com qualidade,segurança e carinho.
          </p>
          <div className="mt-6 flex space-x-4">
            <Button>
              Nossos Serviços
            </Button>
            <Button
              variant="secondary"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
        <div className="mt-10 md:mt-0">
          <img
            src="https://t4.ftcdn.net/jpg/03/20/52/31/360_F_320523164_tx7Rdd7I2XDTvvKfz2oRuRpKOPE5z0ni.jpg"
            alt="Médico"
            className="w-80"
          />
        </div>
      </section>

      {}
      <section className="py-16 px-10 md:px-20 bg-card">
        <h2 className="text-center text-3xl font-bold text-foreground">Cuidados completos para a sua saúde</h2>
        <p className="text-center text-muted-foreground mt-2">Serviços médicos que oferecemos</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Clínica Geral</h3>
            <p className="text-muted-foreground mt-2">
              Seu primeiro passo para o cuidado. Atendimento focado na prevenção e no diagnóstico inicial.
            </p>
            <Button className="mt-4">
              Agendar
            </Button>
          </div>
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Pediatria</h3>
            <p className="text-muted-foreground mt-2">
              Cuidado gentil e especializado para garantir a saúde e o desenvolvimeto de crianças e adolescentes.
            </p>
            <Button className="mt-4">
              Agendar
            </Button>
          </div>
          <div className="p-6 bg-background rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-primary">Exames</h3>
            <p className="text-muted-foreground mt-2">
              Resultados rápidos e precisos em exames laboratoriais e de imagem essenciais para seu diagnóstico.
            </p>
            <Button className="mt-4">
              Agendar
            </Button>
          </div>
        </div>
      </section>

      {}
      <footer className="bg-primary text-primary-foreground py-6 text-center">
        <p>© 2025 MediConnect</p>
      </footer>
    </div>
  );
}