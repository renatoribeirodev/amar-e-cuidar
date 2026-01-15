import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Gauge, ClipboardList, Menu, X } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 overflow-x-hidden">
      
      {/* --- NAVBAR (MENU SUPERIOR) --- */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 h-24 flex items-center justify-between"> 
          
          <div className="cursor-pointer py-2" onClick={() => window.scrollTo(0,0)}>
            <img 
              src="/img/logo-azul.png" 
              alt="Logo Amar é Cuidar" 
              className="h-16 md:h-20 w-auto object-contain hover:opacity-90 transition" 
            />
          </div>

          {/* Links do Menu (Desktop) - AUMENTEI A FONTE AQUI (text-base) */}
          <div className="hidden md:flex gap-8 text-base font-medium text-gray-600">
            <button onClick={() => scrollToSection('projeto')} className="hover:text-blue-600 transition">O Projeto</button>
            <button onClick={() => scrollToSection('funcionalidades')} className="hover:text-blue-600 transition">Funcionalidades</button>
            <button onClick={() => scrollToSection('contato')} className="hover:text-blue-600 transition">Contato</button>
          </div>

          {/* Botão CTA - COR PADRONIZADA (bg-blue-600) */}
          <div className="hidden md:block">
            <button 
              onClick={() => navigate('/app')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition shadow-lg shadow-blue-200"
            >
              Acessar Sistema
            </button>
          </div>

          {/* Botão Menu Hambúrguer */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* MENU MOBILE */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl py-4 px-4 flex flex-col gap-4 animate-fade-in-down">
            <button onClick={() => scrollToSection('projeto')} className="text-left py-2 font-medium text-gray-700 border-b border-gray-50">O Projeto</button>
            <button onClick={() => scrollToSection('funcionalidades')} className="text-left py-2 font-medium text-gray-700 border-b border-gray-50">Funcionalidades</button>
            <button onClick={() => scrollToSection('contato')} className="text-left py-2 font-medium text-gray-700 border-b border-gray-50">Contato</button>
            <button 
              onClick={() => navigate('/app')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold mt-2 transition"
            >
              Acessar Sistema
            </button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-32 px-4 bg-white"> 
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center md:text-left">
            {/* REMOVIDO AQUI: A div da "Versão 1.0 (MVP)" foi deletada */}
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Segurança e Cuidado na <span className="text-blue-600">palma da mão.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mx-auto md:mx-0">
              O sistema que simplifica a rotina dos cuidadores e garante o histórico de saúde das crianças. Simples, rápido e acessível.
            </p>
            <div className="pt-4 flex justify-center md:justify-start gap-4">
              {/* Botão CTA - COR PADRONIZADA (bg-blue-600 igual ao menu) */}
              <button 
                onClick={() => navigate('/app')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold shadow-xl shadow-blue-200 transition w-full md:w-auto transform hover:-translate-y-1"
              >
                Acessar Sistema
              </button>
            </div>
          </div>

          <div className="relative flex justify-center md:-mt-10 mt-8">
            <div className="absolute top-10 bg-blue-100 rounded-full w-72 h-72 md:w-96 md:h-96 blur-3xl opacity-50 -z-10"></div>
            <img 
              src="/img/mockup-app.png" 
              alt="App Mobile Amar é Cuidar" 
              className="relative w-64 md:w-80 h-auto max-h-[500px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* --- O PROJETO --- */}
      <section id="projeto" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-blue-200 rounded-2xl -z-10 hidden md:block"></div>
            <img 
              src="/img/foto-hero.png" 
              alt="Cuidadores e crianças" 
              className="rounded-2xl shadow-lg w-full h-64 md:h-96 object-cover"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Por que criamos o Amar é Cuidar?</h2>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Imagine uma casa de acolhimento com 20 crianças. São dezenas de horários de remédios, alergias diferentes e ocorrências comportamentais acontecendo 24 horas por dia.
            </p>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed">
              Hoje, a tecnologia é um caderno de papel. O resultado? Na troca de turno, <strong className="text-blue-600">informações vitais se perdem</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* --- FUNCIONALIDADES --- */}
      <section id="funcionalidades" className="py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Principais Funcionalidades</h2>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Tudo o que o cuidador precisa em 3 cliques.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Segurança Total</h3>
              <p className="text-sm md:text-base text-gray-600">Confirmação dupla de medicação para evitar erros de dosagem ou esquecimentos.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Gauge className="w-6 h-6 md:w-7 md:h-7 text-green-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Gestão Visual</h3>
              <p className="text-sm md:text-base text-gray-600">Painel de controle intuitivo com indicadores de status (Semáforo) em tempo real.</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <ClipboardList className="w-6 h-6 md:w-7 md:h-7 text-purple-600" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Diário Digital</h3>
              <p className="text-sm md:text-base text-gray-600">Histórico completo da criança acessível na palma da mão, substituindo o papel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RODAPÉ (FOOTER) --- */}
      <footer id="contato" className="bg-blue-900 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left">
          
          {/* LOGO RODAPÉ */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-6 inline-block">
              <img 
                src="/img/logo-branca.png" 
                alt="Logo Amar é Cuidar" 
                className="h-16 w-auto object-contain" 
              />
            </div>
            <p className="text-blue-200 text-sm max-w-xs">
              Tecnologia social para fortalecer casas de acolhimento e proteger o futuro das nossas crianças.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Fale Conosco</h4>
            <ul className="space-y-3 text-blue-200 text-sm md:text-base">
              <li>contato@amarecuidar.org</li>
              <li>(11) 99999-0000</li>
              <li>São Paulo, SP</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Acesso Rápido</h4>
            <ul className="space-y-3 text-blue-200 cursor-pointer text-sm md:text-base">
              {/* REMOVIDO: Login do Cuidador */}
              <li className="hover:text-white">Portal da Transparência</li>
              <li className="hover:text-white">Política de Privacidade</li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT - COR AJUSTADA PARA BRANCO (text-white) */}
        <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 pt-8 border-t border-blue-800 text-center text-white text-xs md:text-sm opacity-90">
          © 2026 Amar é Cuidar. Todos os direitos reservados. Projeto Open Source.
        </div>
      </footer>

    </div>
  );
}