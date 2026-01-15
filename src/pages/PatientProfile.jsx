import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Save, Trash2, Camera } from 'lucide-react';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados dos Campos
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');
  const [sus, setSus] = useState('');
  const [blood, setBlood] = useState('');
  const [allergies, setAllergies] = useState(''); // Observações (Opcional)
  const [photoUrl, setPhotoUrl] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setName(data.name || '');
      setBirthDate(data.birth_date || '');
      setLocation(data.location || '');
      setSus(data.sus_card || '');
      setBlood(data.blood_type || '');
      setAllergies(data.allergies || '');
      setPhotoUrl(data.photo_url || '');

    } catch (error) {
      alert('Erro ao carregar perfil.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // --- VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS ---
    if (!name.trim() || !birthDate || !location.trim() || !sus.trim() || !blood.trim()) {
        alert("Atenção: Todos os campos (exceto Observações) são obrigatórios.");
        return;
    }

    setSaving(true);
    try {
        let finalUrl = photoUrl;

        // Se tiver foto nova, faz upload
        if (newPhoto) {
            const fileExt = newPhoto.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, newPhoto);
            
            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            
            finalUrl = data.publicUrl;
        }

        // Atualiza no Banco
        const { error } = await supabase
            .from('patients')
            .update({
                name, 
                birth_date: birthDate, 
                location, 
                sus_card: sus, 
                blood_type: blood, 
                allergies, 
                photo_url: finalUrl
            })
            .eq('id', id);

        if (error) throw error;
        
        alert('Cadastro atualizado com sucesso!');
        navigate('/dashboard'); 

    } catch (error) {
        alert('Erro ao salvar: ' + error.message);
    } finally {
        setSaving(false);
    }
  };

  const handleInactivate = async () => {
    if (window.confirm('Tem certeza? O acolhido não aparecerá mais na lista principal.')) {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
            navigate('/dashboard');
        } catch (error) {
            alert('Erro ao inativar: ' + error.message);
        }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Carregando...</div>;

  return (
    <div className="min-h-screen bg-white font-sans pb-10">
      
      {/* HEADER */}
      <div className="bg-white p-6 sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Editar Cadastro</h1>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="max-w-lg mx-auto px-6 py-8 space-y-6">
        
        {/* FOTO */}
        <div className="flex justify-center mb-6">
             <label className="relative cursor-pointer group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 group-hover:border-blue-200 transition">
                    {newPhoto ? (
                        <img src={URL.createObjectURL(newPhoto)} className="w-full h-full object-cover" />
                    ) : (
                        <img src={photoUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white shadow-md border-2 border-white">
                    <Camera className="w-5 h-5"/>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setNewPhoto(e.target.files[0])} />
             </label>
        </div>

        {/* NOME (Obrigatório) */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo <span className="text-red-500">*</span></label>
            <input 
                required
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800" 
            />
        </div>
        
        {/* DATA E LOCAL (Obrigatórios) */}
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nascimento <span className="text-red-500">*</span></label>
                <input 
                    required
                    type="date" 
                    value={birthDate} 
                    onChange={e => setBirthDate(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800" 
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Alojamento <span className="text-red-500">*</span></label>
                <input 
                    required
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800" 
                />
            </div>
        </div>

        {/* SUS E SANGUE (Obrigatórios) */}
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Cartão SUS <span className="text-red-500">*</span></label>
                <input 
                    required
                    value={sus} 
                    onChange={e => setSus(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800" 
                />
            </div>
            <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">Tipo Sanguíneo <span className="text-red-500">*</span></label>
                <select 
                    required
                    value={blood} 
                    onChange={e => setBlood(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800"
                >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                </select>
            </div>
        </div>

        {/* OBSERVAÇÕES (Opcional) */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Observações Gerais (Opcional)</label>
            <textarea 
                value={allergies} 
                onChange={e => setAllergies(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 font-medium text-gray-800" 
                placeholder="Ex: Alérgico a Dipirona; Restrição alimentar; Comportamento..."
                rows="4"
            ></textarea>
        </div>

        {/* BOTÕES */}
        <div className="pt-4 space-y-3">
            <button 
                disabled={saving} 
                type="submit" 
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
            >
                <Save className="w-5 h-5" /> 
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>

            <button 
                type="button" 
                onClick={handleInactivate}
                className="w-full bg-white text-red-500 font-bold py-4 rounded-xl hover:bg-red-50 transition flex justify-center items-center gap-2 border border-red-100"
            >
                <Trash2 className="w-5 h-5" />
                Inativar Cadastro
            </button>
        </div>

      </form>
    </div>
  );
}