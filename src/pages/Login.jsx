import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados de Recuperação de Senha
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const LANDING_PAGE_URL = "/"; 

  // --- LOGIN NORMAL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/dashboard'); 
    } catch (error) {
      alert('Erro ao entrar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RECUPERAÇÃO DE SENHA ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
        // Envia e-mail de recuperação padrão do Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: window.location.origin + '/caregiver-profile', // Ao clicar no email, vai pra tela de perfil pra mudar a senha
        });

        if (error) throw error;
        setResetSuccess(true);
    } catch (error) {
        alert('Erro ao enviar e-mail: ' + error.message);
    } finally {
        setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center px-6 relative font-sans">
      
      {/* BOTÃO VOLTAR */}
      <a 
        href={LANDING_PAGE_URL}
        className="absolute top-6 left-6 text-blue-300 hover:text-white transition p-2 rounded-full hover:bg-blue-800/50"
        title="Voltar ao início"
      >
        <ArrowLeft className="h-8 w-8" />
      </a>

      {/* CABEÇALHO */}
      <div className="w-full max-w-sm flex flex-col items-center mb-10">
        <a href={LANDING_PAGE_URL} className="mb-6 hover:opacity-80 transition cursor-pointer">
          <img src="/img/logo-branca.png" alt="Amar é Cuidar" className="h-24 w-auto object-contain"/>
        </a>
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)</h1>
        <p className="text-blue-200 text-center text-sm">Faça login para acessar o prontuário<br/> e a rotina dos acolhidos.</p>
      </div>

      {/* FORMULÁRIO DE LOGIN */}
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-blue-300" />
          </div>
          <input
            type="email"
            placeholder="Seu e-mail institucional"
            className="w-full pl-10 pr-4 py-3.5 bg-blue-800/50 border border-blue-700 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-blue-300" />
          </div>
          <input
            type="password"
            placeholder="Sua senha"
            className="w-full pl-10 pr-4 py-3.5 bg-blue-800/50 border border-blue-700 rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          {/* BOTÃO QUE ABRE O MODAL */}
          <button 
            type="button" 
            onClick={() => {
                setIsResetModalOpen(true);
                setResetSuccess(false);
                setResetEmail(email); // Já preenche se o usuário digitou algo
            }}
            className="text-xs text-blue-200 hover:text-white transition underline decoration-transparent hover:decoration-white underline-offset-4"
          >
            Esqueceu a senha?
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-white text-blue-900 font-bold py-3.5 rounded-xl hover:bg-blue-50 transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50">
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Entrar no Sistema <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-blue-400 text-xs">Problemas com acesso? <br/> Contate o administrador da unidade.</p>
      </div>

      {/* --- MODAL DE RECUPERAÇÃO DE SENHA --- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-up relative">
                <button onClick={() => setIsResetModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>

                {!resetSuccess ? (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4 text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Recuperar Senha</h3>
                            <p className="text-sm text-gray-500 mt-1">Informe seu e-mail cadastrado para receber o link de redefinição.</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">E-mail</label>
                            <input 
                                type="email" 
                                required
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800"
                                placeholder="exemplo@email.com"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={resetLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2"
                        >
                            {resetLoading ? <Loader2 className="animate-spin h-5 w-5"/> : 'Enviar Link'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">E-mail Enviado!</h3>
                        <p className="text-sm text-gray-500 mb-6">Verifique sua caixa de entrada (e spam). Clique no link enviado para criar uma nova senha.</p>
                        <button 
                            onClick={() => setIsResetModalOpen(false)}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                        >
                            Voltar para Login
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

    </div>
  );
}