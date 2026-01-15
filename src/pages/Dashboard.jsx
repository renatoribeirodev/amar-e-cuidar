import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search, LogOut, Plus, MapPin, AlertCircle, CheckCircle2, Clock, Sun, Moon, Sunrise, UserPlus, X, Upload, Eye } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados do Cuidador
  const [userName, setUserName] = useState('Cuidador'); 
  const [userUnit, setUserUnit] = useState('');
  const [userShift, setUserShift] = useState('');
  const [greeting, setGreeting] = useState('Olá');

  // Estados Modal Novo Acolhido
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Campos do Formulário Acolhido
  const [newName, setNewName] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSus, setNewSus] = useState('');
  const [newBlood, setNewBlood] = useState('');
  const [newAllergies, setNewAllergies] = useState(''); // Observações
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    fetchUserAndData();
  }, []);

  const fetchUserAndData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Tenta pegar Nome, Unidade e Plantão da tabela 'profiles'
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, unit, shift')
            .eq('id', user.id)
            .single();

        if (profile) {
            setUserName(profile.full_name ? profile.full_name.split(' ')[0] : 'Cuidador');
            setUserUnit(profile.unit || '');
            setUserShift(profile.shift || '');
        } else {
            // Fallback se não tiver perfil criado ainda
            let metaName = user.user_metadata.full_name || 'Renato';
            setUserName(metaName.split(' ')[0]);
        }
      }
      
      calculateGreeting();
      fetchPatients();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Bom dia');
    else if (hour >= 12 && hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  };

  const fetchPatients = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('is_active', true) 
      .order('name', { ascending: true });
    if (!error) setPatients(data);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    
    // VALIDAÇÃO RIGOROSA
    if (!newName.trim() || !newBirthDate || !newLocation.trim() || !newPhoto || !newSus.trim() || !newBlood.trim()) {
        alert("Atenção: Foto e todos os dados (exceto observações) são obrigatórios.");
        return;
    }

    setCreating(true);
    try {
        let photoUrl = null;

        const fileExt = newPhoto.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, newPhoto);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
        photoUrl = publicUrl;

        const { error } = await supabase
            .from('patients')
            .insert([{
                name: newName,
                birth_date: newBirthDate,
                age: calculateAge(newBirthDate),
                location: newLocation,
                sus_card: newSus,
                blood_type: newBlood,
                allergies: newAllergies,
                status: 'green',
                photo_url: photoUrl,
                is_active: true
            }]);
        
        if (error) throw error;
        
        setNewName(''); setNewBirthDate(''); setNewLocation(''); setNewSus(''); setNewBlood(''); setNewAllergies(''); setNewPhoto(null);
        setIsModalOpen(false);
        fetchPatients(); 
        alert('Acolhido cadastrado com sucesso!');

    } catch (error) {
        alert('Erro ao cadastrar: ' + error.message);
    } finally {
        setCreating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/app');
  };

  const getStatusIcon = (status) => {
    if (status === 'red') return <AlertCircle className="w-6 h-6 text-red-500" />;
    if (status === 'yellow') return <Clock className="w-6 h-6 text-yellow-500" />;
    return <CheckCircle2 className="w-6 h-6 text-green-500" />;
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sunrise className="w-5 h-5 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sun className="w-5 h-5 text-orange-500" />;
    return <Moon className="w-5 h-5 text-blue-400" />;
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden">
      
      {/* HEADER FIXO */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white shadow-sm rounded-b-3xl">
        <div className="max-w-lg mx-auto px-6 pt-8 pb-6">
          <div className="flex justify-between items-start mb-6 mt-2">
            
            {/* PERFIL CLICÁVEL */}
            <div 
                onClick={() => navigate('/caregiver-profile')} 
                className="cursor-pointer hover:opacity-80 transition group"
                title="Editar meu perfil"
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1 font-medium">
                 {getGreetingIcon()}
                 <span>{greeting},</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                  {userName} 
                  <span className="text-gray-300 text-sm group-hover:text-blue-500">✎</span>
              </h1>
              
              {/* DADOS DINÂMICOS DE UNIDADE E PLANTÃO */}
              <p className="text-xs text-blue-600 font-bold mt-1 bg-blue-50 inline-block px-2 py-1 rounded-md">
                {userUnit && userShift 
                    ? `${userUnit} • ${userShift}` 
                    : 'Clique para configurar local e plantão'}
              </p>
            </div>

            <button onClick={handleLogout} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar acolhido..." 
              className="w-full bg-gray-100 py-3 pl-12 pr-4 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-gray-400 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="pt-64 pb-24 px-6 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-10 space-y-3">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             <p className="text-gray-400 text-sm font-medium">Sincronizando dados...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center mt-10 p-6 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 font-medium">Nenhum acolhido encontrado.</p>
            {searchTerm && <p className="text-xs text-gray-400 mt-1">Busca: "{searchTerm}"</p>}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition-transform hover:shadow-md hover:border-blue-100 group relative"
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => navigate(`/patient/${patient.id}`)}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-blue-200 transition bg-gray-50">
                    {patient.photo_url ? (
                        <img src={patient.photo_url} alt={patient.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">
                            {patient.name.substring(0,2).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{patient.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{patient.age} anos</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {patient.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        navigate(`/profile/${patient.id}`);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                    title="Visualizar Cadastro"
                >
                    <Eye className="w-5 h-5" />
                </button>
                <div>{getStatusIcon(patient.status)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-30">
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-300 active:scale-90 transition-transform hover:bg-blue-700"
        >
          <Plus className="w-8 h-8 text-white" />
        </button>
      </div>

      {/* MODAL NOVO ACOLHIDO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Novo Acolhido</h3>
                    <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400" /></button>
                </div>
                
                <form onSubmit={handleCreatePatient} className="space-y-4">
                    <div className="flex justify-center mb-2">
                        <label className="w-24 h-24 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition overflow-hidden relative">
                            {newPhoto ? <img src={URL.createObjectURL(newPhoto)} className="w-full h-full object-cover" /> : <><Upload className="w-6 h-6 text-gray-400 mb-1" /><span className="text-[10px] text-gray-400">Foto</span></>}
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setNewPhoto(e.target.files[0])} />
                        </label>
                    </div>
                    <p className="text-center text-xs text-red-500 font-semibold mb-2">* Foto obrigatória</p>

                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1">Nome Completo *</label>
                        <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 ml-1">Nascimento *</label>
                            <input required value={newBirthDate} onChange={e => setNewBirthDate(e.target.value)} type="date" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 ml-1">Alojamento *</label>
                            <input required value={newLocation} onChange={e => setNewLocation(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="Ex: Ala B" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 ml-1">Tipo Sangue *</label>
                            <select required value={newBlood} onChange={e => setNewBlood(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
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
                        <div className="flex-1">
                             <label className="text-xs font-bold text-gray-500 ml-1">Cartão SUS *</label>
                             <input required value={newSus} onChange={e => setNewSus(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="000.0000..." />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 ml-1">Observações (Opcional)</label>
                        <textarea value={newAllergies} onChange={e => setNewAllergies(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" placeholder="Restrições, alergias..." rows="2"></textarea>
                    </div>

                    <button disabled={creating} type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition mt-2 flex justify-center items-center gap-2">
                        {creating ? "Salvando..." : <><UserPlus className="w-5 h-5"/> Cadastrar</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}