import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Clock, Pill, FileText, Check, AlertTriangle, Droplet, CreditCard, Calendar, Utensils, StickyNote, PlusCircle, X, MapPin, CalendarDays } from 'lucide-react';

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medication'); 

  // Modais
  const [selectedMed, setSelectedMed] = useState(null);
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [newOccurrenceText, setNewOccurrenceText] = useState('');
  const [newOccurrenceType, setNewOccurrenceType] = useState('Geral');

  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedStart, setNewMedStart] = useState('');
  const [newMedEnd, setNewMedEnd] = useState('');
  const [savingMed, setSavingMed] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: p } = await supabase.from('patients').select('*').eq('id', id).single();
      setPatient(p);

      const { data: m } = await supabase.from('medicines').select('*').eq('patient_id', id).order('time', { ascending: true });
      setMedicines(m);

      const { data: d } = await supabase.from('diary_entries').select('*').eq('patient_id', id).order('created_at', { ascending: false });
      setDiaryEntries(d || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleSaveMedicine = async (e) => {
    e.preventDefault();
    if (!newMedName || !newMedTime || !newMedDosage || !newMedStart || !newMedEnd) {
        alert("Preencha todos os campos da prescrição!");
        return;
    }
    setSavingMed(true);
    try {
        const { error } = await supabase.from('medicines').insert([{
            patient_id: id,
            name: newMedName,
            time: newMedTime,
            dosage: newMedDosage,
            start_date: newMedStart,
            end_date: newMedEnd,
            status: 'pending'
        }]);

        if (error) throw error;
        setNewMedName(''); setNewMedTime(''); setNewMedDosage(''); setNewMedStart(''); setNewMedEnd('');
        setIsMedModalOpen(false);
        fetchData();
        alert('Prescrição adicionada!');
    } catch (error) { alert('Erro: ' + error.message); } finally { setSavingMed(false); }
  };

  const handleSaveOccurrence = async (e) => {
      e.preventDefault();
      try {
          const { error } = await supabase.from('diary_entries').insert([{
              patient_id: id, category: newOccurrenceType, description: newOccurrenceText
          }]);
          if (error) throw error;
          setNewOccurrenceText(''); setIsOccurrenceModalOpen(false); fetchData();
          alert('Salvo no diário!');
      } catch (error) { alert('Erro: ' + error.message); }
  };

  const confirmAdministration = async () => {
    if (!selectedMed) return;
    try {
      const now = new Date().toISOString();
      await supabase.from('medicines').update({ status: 'done', administered_at: now }).eq('id', selectedMed.id);
      await supabase.from('patients').update({ status: 'green' }).eq('id', id);
      setMedicines(medicines.map(m => m.id === selectedMed.id ? { ...m, status: 'done', administered_at: now } : m));
      setSelectedMed(null);
      fetchData(); 
    } catch (error) { alert('Erro: ' + error.message); }
  };

  const formatTime = (dateString) => {
      if (!dateString) return '--:--';
      return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatFullDateTime = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const diaMesAno = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return `${diaMesAno} às ${hora}`;
  };

  const getDiaryFeed = () => {
      const medEvents = medicines.filter(m => m.status === 'done' && m.administered_at).map(m => ({
            id: `med-${m.id}`, title: `Medicamento`, description: `${m.name} (${m.dosage})`, time: m.administered_at,
            icon: <Pill className="w-4 h-4 text-white" />, color: 'bg-green-500'
        }));
      const diaryEvents = diaryEntries.map(d => ({
          id: `diary-${d.id}`, title: d.category, description: d.description, time: d.created_at,
          icon: d.category === 'Alimentação' ? <Utensils className="w-4 h-4 text-white" /> : <StickyNote className="w-4 h-4 text-white" />,
          color: d.category === 'Alimentação' ? 'bg-orange-500' : 'bg-blue-500'
      }));
      return [...medEvents, ...diaryEvents].sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  if (loading || !patient) return <div className="min-h-screen flex items-center justify-center font-bold text-blue-600">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER */}
      <div className="bg-white p-6 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-6 h-6 text-gray-600" /></button>
          <h1 className="text-xl font-bold text-gray-800">Prontuário Digital</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 mt-6 space-y-6">
        
        {/* CARD DO PACIENTE */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-3 bg-gray-100">
                    {patient.photo_url ? <img src={patient.photo_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-500">{patient.name.substring(0,2)}</div>}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-gray-500 font-medium">{patient.age} anos • {patient.location}</p>
                {patient.allergies && (
                    <div 
                        onClick={() => setActiveTab('data')} 
                        className="mt-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition"
                    >
                        <AlertTriangle className="w-3 h-3" /> Ver Observações
                    </div>
                )}
            </div>
        </div>

        <div className="flex border-b border-gray-200">
            {['medication', 'diary', 'data'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 pb-3 text-sm font-bold capitalize transition ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}>
                    {tab === 'medication' ? 'Medicação' : tab === 'diary' ? 'Diário' : 'Dados'}
                </button>
            ))}
        </div>

        {activeTab === 'medication' && (
            <div className="animate-fade-in">
                 <button onClick={() => setIsMedModalOpen(true)} className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-bold border border-blue-200 mb-6 flex justify-center items-center gap-2 active:scale-95 transition hover:bg-blue-100">
                    <PlusCircle className="w-5 h-5" /> Adicionar Prescrição
                 </button>

                 <div className="space-y-3">
                    {medicines.length === 0 && <p className="text-center text-gray-400 text-sm">Nenhuma prescrição ativa.</p>}
                    {medicines.map((med) => (
                    <div key={med.id} onClick={() => med.status !== 'done' && setSelectedMed(med)} className={`bg-white p-4 rounded-2xl border flex items-center justify-between transition-all ${med.status === 'done' ? 'border-green-100 bg-green-50/30' : 'border-gray-100 shadow-sm cursor-pointer hover:border-blue-200'}`}>
                        <div className="flex gap-4 items-center">
                            <div className={`p-3 rounded-xl ${med.status === 'done' ? 'bg-green-100' : 'bg-gray-50'}`}>{med.status === 'done' ? <Check className="w-5 h-5 text-green-600" /> : <Clock className="w-5 h-5 text-gray-400" />}</div>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs text-gray-400 font-bold">{med.time.substring(0,5)}</span>
                                    {med.start_date && (
                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 rounded border border-blue-100 flex items-center gap-1">
                                            <CalendarDays className="w-3 h-3"/> {formatDate(med.start_date).substring(0,5)} até {formatDate(med.end_date).substring(0,5)}
                                        </span>
                                    )}
                                </div>
                                <h4 className={`font-bold ${med.status === 'done' ? 'text-green-800 line-through' : 'text-gray-800'}`}>{med.name}</h4>
                                <p className="text-sm text-gray-500">{med.dosage}</p>
                            </div>
                        </div>
                        {med.status === 'done' ? (
                            <div className="text-right">
                                <span className="text-xs font-bold text-green-600 block">Administrado</span>
                                {/* MUDANÇA AQUI: Agora usa Data e Hora completa */}
                                <span className="text-[10px] text-gray-400 font-medium">{formatFullDateTime(med.administered_at)}</span>
                            </div>
                        ) : (
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${med.status === 'late' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>{med.status === 'late' ? 'Atrasado' : 'Pendente'}</div>
                        )}
                    </div>
                    ))}
                 </div>
            </div>
        )}

        {activeTab === 'diary' && (
            <div className="animate-fade-in">
                <button onClick={() => setIsOccurrenceModalOpen(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 mb-6 flex justify-center items-center gap-2 active:scale-95 transition"><StickyNote className="w-5 h-5" /> Registrar Ocorrência</button>
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                    {getDiaryFeed().length === 0 && <p className="text-gray-400 text-sm ml-6">Nenhum registro encontrado.</p>}
                    {getDiaryFeed().map((item) => (
                        <div key={item.id} className="ml-6 relative">
                            <div className={`absolute -left-[31px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${item.color}`}>{item.icon}</div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                                    <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{formatFullDateTime(item.time)}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'data' && (
            <div className="space-y-4 animate-fade-in">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nome Completo</label><p className="text-gray-800 font-medium text-lg">{patient.name}</p></div>
                <div className="flex gap-4">
                     <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1"><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Idade</label><p className="text-gray-800 font-medium">{patient.age} anos</p></div>
                     <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1"><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Nascimento</label><p className="text-gray-800 font-medium">{formatDate(patient.birth_date)}</p></div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Alojamento / Local</label><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500"/><p className="text-gray-800 font-medium">{patient.location}</p></div></div>
                <div className="flex gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1"><label className="text-xs font-bold text-gray-400 uppercase">Sangue</label><p className="text-gray-800 font-medium">{patient.blood_type || '-'}</p></div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex-1"><label className="text-xs font-bold text-gray-400 uppercase">SUS</label><p className="text-gray-800 font-medium">{patient.sus_card || '-'}</p></div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 shadow-sm"><label className="text-xs font-bold text-yellow-600 uppercase flex items-center gap-1 mb-2"><AlertTriangle className="w-3 h-3" /> Observações Gerais</label><p className="text-yellow-900 font-medium leading-relaxed">{patient.allergies || 'Nenhuma observação registrada.'}</p></div>
            </div>
        )}

      </div>

      {/* --- MODAIS CENTRALIZADOS --- */}

      {selectedMed && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Administrar Medicamento?</h3>
            <p className="text-center text-gray-500 mb-6">Confirma que tomou <strong>{selectedMed.name}</strong> agora?</p>
            <div className="flex gap-3"><button onClick={() => setSelectedMed(null)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100">Cancelar</button><button onClick={confirmAdministration} className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600">Confirmar</button></div>
          </div>
        </div>
      )}

      {isOccurrenceModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-900">Nova Ocorrência</h3><button onClick={() => setIsOccurrenceModalOpen(false)}><X className="text-gray-400" /></button></div>
                <form onSubmit={handleSaveOccurrence}>
                    <div className="mb-4"><label className="block text-xs font-bold text-gray-500 mb-2">Tipo</label><div className="flex gap-2">{['Geral', 'Alimentação', 'Higiene'].map(type => (<button type="button" key={type} onClick={() => setNewOccurrenceType(type)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${newOccurrenceType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>{type}</button>))}</div></div>
                    <div className="mb-4"><label className="block text-xs font-bold text-gray-500 mb-2">Descrição</label><textarea required value={newOccurrenceText} onChange={(e) => setNewOccurrenceText(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-500" rows="4" placeholder="Descreva o que aconteceu..."></textarea></div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Salvar no Diário</button>
                </form>
            </div>
        </div>
      )}

      {isMedModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-gray-900">Nova Prescrição</h3><button onClick={() => setIsMedModalOpen(false)}><X className="text-gray-400" /></button></div>
                <form onSubmit={handleSaveMedicine}>
                    <div className="mb-3"><label className="block text-xs font-bold text-gray-500 mb-1">Medicamento</label><input required value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Ex: Dipirona" /></div>
                    <div className="flex gap-3 mb-3">
                        <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Horário</label><input required type="time" value={newMedTime} onChange={(e) => setNewMedTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3" /></div>
                        <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Dosagem</label><input required value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3" placeholder="Ex: 20 gotas" /></div>
                    </div>
                    <div className="flex gap-3 mb-4">
                        <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Início</label><input required type="date" value={newMedStart} onChange={(e) => setNewMedStart(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3" /></div>
                        <div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Fim</label><input required type="date" value={newMedEnd} onChange={(e) => setNewMedEnd(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3" /></div>
                    </div>
                    <button disabled={savingMed} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center">{savingMed ? 'Salvando...' : 'Adicionar'}</button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}