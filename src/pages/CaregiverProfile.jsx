import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Save, User, Lock, Phone, Calendar, MapPin, Clock } from 'lucide-react';

export default function CaregiverProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);

  // Estados - Dados Pessoais
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');

  // Estados - Trabalho
  const [unit, setUnit] = useState('');
  const [shift, setShift] = useState('');

  // Estados - Acesso
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
          navigate('/app');
          return;
      }

      setUserId(user.id);
      setEmail(user.email);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
          setFullName(profile.full_name || '');
          setCpf(profile.cpf || '');
          setRg(profile.rg || '');
          setBirthDate(profile.birth_date || '');
          setPhone(profile.phone || '');
          setUnit(profile.unit || '');   
          setShift(profile.shift || ''); 
      } else {
          setFullName(user.user_metadata.full_name || '');
      }

    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // --- VALIDAÇÃO RIGOROSA DE TODOS OS CAMPOS ---
    if (!fullName.trim() || !cpf.trim() || !rg.trim() || !birthDate || !phone.trim() || !unit.trim() || !shift.trim() || !email.trim()) {
        alert("Atenção: Todos os dados pessoais e de trabalho são obrigatórios.");
        return;
    }

    setSaving(true);

    try {
        // 1. Atualiza Tabela Profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                cpf,
                rg,
                birth_date: birthDate,
                phone,
                unit,
                shift,
                updated_at: new Date()
            });

        if (profileError) throw profileError;

        // 2. Atualiza Nome no Auth Metadata
        await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        // 3. Atualiza Login (Se houver mudança)
        let authUpdates = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabase.auth.updateUser(authUpdates);
            if (authError) throw authError;
        }

        alert('Perfil atualizado com sucesso!');
        if (password) setPassword(''); 
        navigate('/dashboard');

    } catch (error) {
        alert('Erro ao atualizar: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-white p-6 sticky top-0 z-10 border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Meus Dados</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 mt-6">
        <form onSubmit={handleSave} className="space-y-6">
            
            {/* BLOCO 1: DADOS PESSOAIS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-blue-600 uppercase flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" /> Informações Pessoais
                </h3>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nome Completo *</label>
                    <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">CPF *</label>
                        <input required value={cpf} onChange={e => setCpf(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" placeholder="000.000.000-00" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">RG *</label>
                        <input required value={rg} onChange={e => setRg(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Nascimento *</label>
                        <input required type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/> Celular *</label>
                        <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" placeholder="(11) 9..." />
                    </div>
                </div>
            </div>

            {/* BLOCO 2: DADOS PROFISSIONAIS */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-green-600 uppercase flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" /> Local de Trabalho
                </h3>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Unidade / Localidade *</label>
                    <input 
                        required
                        value={unit} 
                        onChange={e => setUnit(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-gray-800" 
                        placeholder="Ex: Unidade São Paulo - Zona Sul"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Plantão / Turno *</label>
                    <input 
                        required
                        value={shift} 
                        onChange={e => setShift(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500 text-gray-800" 
                        placeholder="Ex: Noturno - 12x36"
                    />
                </div>
            </div>

            {/* BLOCO 3: DADOS DE ACESSO */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-orange-600 uppercase flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" /> Dados de Login
                </h3>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">E-mail *</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Alterar Senha (Opcional)</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-gray-800" 
                        placeholder="Deixe em branco para não alterar" 
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Mínimo 6 caracteres.</p>
                </div>
            </div>

            <button 
                disabled={saving} 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
            >
                <Save className="w-5 h-5" /> 
                {saving ? 'Atualizando...' : 'Salvar Dados'}
            </button>

        </form>
      </div>
    </div>
  );
}