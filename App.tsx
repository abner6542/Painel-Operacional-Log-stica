import React, { useState, useEffect, useRef } from 'react';
import { Trash, Plus, Clock, Package, Truck, FileText, CheckCircle2, Box, Settings, Cloud, CloudOff, RefreshCw, Save, Linkedin } from 'lucide-react';
import { DEFAULT_DATA } from './constants';
import { AppData, OutboundItem, InboundItem, ProgressBarData } from './types';
import { StatusCheckbox } from './components/StatusCheckbox';
import { ProgressBar } from './components/ProgressBar';
import { EditableText } from './components/EditableText';

const App: React.FC = () => {
  // Data State
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Sync State
  // Configurado com a URL do usuário por padrão
  const [apiUrl, setApiUrl] = useState<string>('https://script.google.com/macros/s/AKfycbyR8h7jUeu-TC4i9Dg0-gQjUE2Gqbey6J4FdCVPc9SXctR1-9gmelu8SCNQ8gOOg7OiDw/exec');
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved' | 'error'>('idle');
  const [lastCloudUpdate, setLastCloudUpdate] = useState<number>(0);
  
  // Refs for debouncing
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstLoad = useRef(true);

  // --- Initialization ---

  useEffect(() => {
    // 1. Load Local Data & Settings
    const storedData = localStorage.getItem('painel_logistica_data');
    const storedUrl = localStorage.getItem('painel_logistica_api_url');

    // Se o usuário já salvou uma URL diferente localmente, usamos ela. 
    // Caso contrário, mantém a URL padrão definida no useState acima.
    if (storedUrl) setApiUrl(storedUrl);

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const mergedData = mergeData(parsed);
        setData(mergedData);
      } catch (e) {
        console.error("Failed to parse stored data", e);
        setData(DEFAULT_DATA);
      }
    }
    setIsLoaded(true);
  }, []);

  // --- Sync Logic ---

  // Helper to ensure data structure integrity
  const mergeData = (parsed: any): AppData => {
    return {
        ...DEFAULT_DATA,
        ...parsed,
        outbound: Array.isArray(parsed.outbound) ? parsed.outbound : DEFAULT_DATA.outbound,
        inbound: Array.isArray(parsed.inbound) ? parsed.inbound : DEFAULT_DATA.inbound,
        weekly: Array.isArray(parsed.weekly) ? parsed.weekly : DEFAULT_DATA.weekly,
        imports: Array.isArray(parsed.imports) ? parsed.imports : DEFAULT_DATA.imports,
        progressBars: Array.isArray(parsed.progressBars) ? parsed.progressBars : DEFAULT_DATA.progressBars,
        info: { ...DEFAULT_DATA.info, ...(parsed.info || {}) }
    };
  };

  // Polling Effect (Fetch from Cloud every 5s)
  useEffect(() => {
    if (!apiUrl || !isLoaded) return;

    const fetchData = async () => {
        // Don't fetch if we are currently typing/saving to avoid race conditions
        if (syncStatus === 'syncing') return;

        try {
            // CRITICAL FIX: Add timestamp to avoid browser caching redirects which causes CORS errors
            const separator = apiUrl.includes('?') ? '&' : '?';
            const urlWithCacheBuster = `${apiUrl}${separator}t=${Date.now()}`;

            const response = await fetch(urlWithCacheBuster);
            if (response.ok) {
                const json = await response.json();
                // Only update if cloud data is newer or different enough (simple check)
                if (json && json.lastUpdated) {
                     const cloudData = mergeData(json);
                     
                     if (JSON.stringify(cloudData) !== JSON.stringify(data)) {
                         // Only update if we haven't just saved recently (buffer)
                         if (Date.now() - lastCloudUpdate > 2000) {
                            setData(cloudData);
                            localStorage.setItem('painel_logistica_data', JSON.stringify(cloudData));
                         }
                     }
                     if (syncStatus === 'error') setSyncStatus('idle');
                }
            }
        } catch (e) {
            // Silent fail for polling to avoid spamming console, unless it was previously fine
            if (syncStatus !== 'error') {
                console.warn("Background sync transient error (likely network or CORS cache):", e);
            }
            // Only set error visual state if it persists (logic could be improved, but keeping simple)
            // setSyncStatus('error'); 
        }
    };

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, isLoaded, data, syncStatus, lastCloudUpdate]);


  // Save Trigger
  const save = (newData: AppData) => {
    // 1. Update Local State immediately for UI responsiveness
    const stampedData = {
        ...newData,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setData(stampedData);
    localStorage.setItem('painel_logistica_data', JSON.stringify(stampedData));

    // 2. Trigger Cloud Save (Debounced)
    if (apiUrl) {
        setSyncStatus('syncing');
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                // CRITICAL FIX: Use 'text/plain' to avoid CORS Preflight (OPTIONS request) which GAS doesn't support
                await fetch(apiUrl, {
                    method: 'POST',
                    mode: 'no-cors', 
                    headers: { 'Content-Type': 'text/plain' }, 
                    body: JSON.stringify(stampedData)
                });
                
                setSyncStatus('saved');
                setLastCloudUpdate(Date.now());
                
                // Reset status after a moment
                setTimeout(() => setSyncStatus('idle'), 2000);
            } catch (e) {
                console.error("Cloud save error", e);
                setSyncStatus('error');
            }
        }, 1000); // Wait 1 second after last keystroke to send
    }
  };

  const handleUrlSave = (url: string) => {
      setApiUrl(url);
      localStorage.setItem('painel_logistica_api_url', url);
      setShowSettings(false);
      // Try to fetch immediately
      setSyncStatus('syncing');
      setTimeout(() => setSyncStatus('idle'), 1000);
  };

  // --- Updaters (Same as before, just calling new save) ---

  const updateOutbound = (id: string, field: keyof OutboundItem, value: any) => {
    save({ ...data, outbound: data.outbound.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const updateOutboundStatus = (id: string, key: keyof OutboundItem['status'], value: boolean) => {
    save({ ...data, outbound: data.outbound.map(item => item.id === id ? { ...item, status: { ...item.status, [key]: value } } : item) });
  };

  const addOutbound = () => {
    const newItem: OutboundItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'}),
      praca: 'Nova Praça',
      qtd: 0,
      horario: '00:00',
      status: { separando: false, separado: false, romaneio: false, carregado: false }
    };
    save({ ...data, outbound: [...data.outbound, newItem] });
  };

  const deleteOutbound = (id: string) => {
    if(confirm('Remover item?')) save({ ...data, outbound: data.outbound.filter(i => i.id !== id) });
  };

  const updateInbound = (id: string, field: keyof InboundItem, value: any) => {
    save({ ...data, inbound: data.inbound.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const updateInboundStatus = (id: string, key: keyof InboundItem['status'], value: boolean) => {
    save({ ...data, inbound: data.inbound.map(item => item.id === id ? { ...item, status: { ...item.status, [key]: value } } : item) });
  };

  const addInbound = () => {
    save({ ...data, inbound: [...data.inbound, { id: Date.now().toString(), date: '19/11', transp: 'Nova Transp', qtd: 0, placa: '---', status: { desc: false, rec: false } }] });
  };

   const deleteInbound = (id: string) => {
    if(confirm('Remover item?')) save({ ...data, inbound: data.inbound.filter(i => i.id !== id) });
  };

  const addProgressBar = () => {
    const newBar: ProgressBarData = { id: Date.now().toString(), label: 'NOVO SHIPMENT', current: 0, total: 100, color: 'blue' };
    save({ ...data, progressBars: [...data.progressBars, newBar] });
  };

  const deleteProgressBar = (id: string) => {
    if(confirm('Remover este shipment?')) save({ ...data, progressBars: data.progressBars.filter(b => b.id !== id) });
  };

  const totalOutbound = data.outbound.reduce((acc, curr) => acc + curr.qtd, 0);
  const totalInbound = data.inbound.reduce((acc, curr) => acc + curr.qtd, 0);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-kn-neutral1 p-4 md:p-6 font-sans text-kn-black flex flex-col gap-6">
      
      {/* SETTINGS MODAL */}
      {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
                  <h2 className="text-xl font-bold text-kn-darkBlue mb-4 flex items-center gap-2">
                      <Settings /> Configurar Planilha Google
                  </h2>
                  <p className="text-sm text-kn-neutral4 mb-4">
                      Para sincronizar os dados, cole a URL do seu Google Web App (Script) abaixo.
                  </p>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-lg bg-gray-50 text-sm font-mono mb-4 focus:ring-2 ring-kn-lightBlue outline-none"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    defaultValue={apiUrl}
                    id="urlInput"
                  />
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setShowSettings(false)} className="px-4 py-2 text-kn-neutral3 hover:bg-gray-100 rounded-lg">Cancelar</button>
                      <button 
                        onClick={() => {
                            const val = (document.getElementById('urlInput') as HTMLInputElement).value;
                            handleUrlSave(val);
                        }}
                        className="px-4 py-2 bg-kn-darkBlue text-white rounded-lg font-bold hover:bg-blue-900"
                      >
                          Salvar Conexão
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* HEADER */}
      <header className="relative flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 md:p-5 rounded-xl shadow-sm border-t-4 border-kn-darkBlue">
         <div className="flex justify-between w-full md:w-auto items-center z-10">
            <img src="https://imgur.com/A8c9VFH.png" alt="Logo Left" className="h-6 md:h-5 w-auto object-contain" />
            <div className="md:hidden text-base font-bold text-kn-lightBlue">{data.lastUpdated}h</div>
         </div>

         <div className="w-full md:w-auto md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 text-center z-0">
            <h1 className="text-2xl md:text-3xl font-bold text-kn-darkBlue tracking-tight leading-none uppercase">Painel Operacional</h1>
         </div>

         <div className="flex items-center gap-4 z-10 self-end md:self-auto">
             {/* SYNC INDICATOR */}
             <div className="flex items-center gap-2 mr-2" title={apiUrl ? "Sincronizado" : "Offline (Local)"}>
                {syncStatus === 'syncing' && <RefreshCw className="animate-spin text-kn-lightBlue" size={20} />}
                {syncStatus === 'saved' && <CheckCircle2 className="text-kn-green" size={20} />}
                {syncStatus === 'error' && <CloudOff className="text-kn-red" size={20} />}
                {syncStatus === 'idle' && apiUrl && <Cloud className="text-kn-neutral3" size={20} />}
                {syncStatus === 'idle' && !apiUrl && <CloudOff className="text-kn-neutral2" size={20} />}
             </div>

             <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-kn-neutral3 hover:text-kn-darkBlue hover:bg-gray-100 rounded-full transition-colors"
                title="Configurações"
             >
                 <Settings size={24} />
             </button>

             <div className="text-right hidden md:block border-l pl-4 border-gray-200">
                 <p className="text-[11px] font-bold text-kn-neutral3 uppercase tracking-wider">Última Atualização</p>
                 <div className="flex items-center gap-2 justify-end text-2xl font-bold text-kn-lightBlue">
                    <Clock size={24} />
                    {data.lastUpdated}h
                 </div>
             </div>
             
             <img src="https://imgur.com/r0Kg9ov.png" alt="Logo Right" className="h-12 md:h-14 w-auto object-contain" />
         </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        
        {/* LEFT COL (Outbound) */}
        <div className="md:col-span-2 xl:col-span-6 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm p-5 md:p-6 flex-1 border border-kn-neutral2/20 flex flex-col">
                <div className="flex justify-between items-center mb-5 border-b pb-3 border-kn-neutral1">
                    <h2 className="text-xl font-bold text-kn-red flex items-center gap-3">
                        <Truck size={24}/> Outbound
                    </h2>
                    <button onClick={addOutbound} className="p-2 hover:bg-kn-neutral1 rounded-lg text-kn-green transition-colors"><Plus size={24}/></button>
                </div>

                <div className="overflow-x-auto flex-1">
                    <div className="min-w-[800px] md:min-w-0"> 
                        <div className="grid grid-cols-[3fr_1fr_1.5fr_5fr_auto] gap-4 mb-3 text-sm font-bold text-kn-neutral3 uppercase tracking-wider px-2">
                            <div>Praça</div>
                            <div className="text-center">Qtd</div>
                            <div className="text-center">Horário</div>
                            <div className="text-center pl-2">Status Processo</div>
                            <div className="w-8"></div>
                        </div>

                        <div className="space-y-3 overflow-y-auto max-h-[550px] pr-2">
                            {data.outbound.map((item) => (
                                <div key={item.id} className="group grid grid-cols-[3fr_1fr_1.5fr_5fr_auto] gap-4 items-center bg-kn-neutral1/30 p-3 md:p-4 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-kn-lightBlue/20">
                                    <div className="font-bold text-kn-darkBlue truncate text-base md:text-lg">
                                        <EditableText value={item.praca} onSave={(v) => updateOutbound(item.id, 'praca', v)} />
                                    </div>
                                    <div className="text-center font-mono font-bold text-xl md:text-2xl">
                                        <EditableText type="number" value={item.qtd} onSave={(v) => updateOutbound(item.id, 'qtd', Number(v))} />
                                    </div>
                                    <div className="text-center text-base md:text-lg">
                                        <EditableText value={item.horario} onSave={(v) => updateOutbound(item.id, 'horario', v)} className={`font-bold ${item.id === '2' ? 'text-kn-red' : 'text-kn-neutral4'}`}/>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 bg-kn-neutral1 rounded-lg p-1.5">
                                        <button onClick={() => updateOutboundStatus(item.id, 'separando', !item.status.separando)} className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-md transition-all ${item.status.separando ? 'bg-orange-400 text-white shadow-sm' : 'text-kn-neutral2 hover:bg-white'}`} title="Separando"><Box size={20} strokeWidth={3} /></button>
                                        <button onClick={() => updateOutboundStatus(item.id, 'separado', !item.status.separado)} className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-md transition-all ${item.status.separado ? 'bg-kn-lightBlue text-white shadow-sm' : 'text-kn-neutral2 hover:bg-white'}`} title="Separado"><CheckCircle2 size={20} strokeWidth={3} /></button>
                                        <button onClick={() => updateOutboundStatus(item.id, 'romaneio', !item.status.romaneio)} className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-md transition-all ${item.status.romaneio ? 'bg-kn-darkBlue text-white shadow-sm' : 'text-kn-neutral2 hover:bg-white'}`} title="Romaneio"><FileText size={20} strokeWidth={3} /></button>
                                        <button onClick={() => updateOutboundStatus(item.id, 'carregado', !item.status.carregado)} className={`flex-1 flex items-center justify-center p-2 md:p-2.5 rounded-md transition-all ${item.status.carregado ? 'bg-kn-green text-white shadow-sm' : 'text-kn-neutral2 hover:bg-white'}`} title="Carregado"><Truck size={20} strokeWidth={3} /></button>
                                    </div>
                                    <button onClick={() => deleteOutbound(item.id)} className="text-kn-neutral3 hover:text-kn-red opacity-0 group-hover:opacity-100 transition-opacity p-1"><Trash size={18}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-5 border-t flex justify-between items-center text-kn-darkBlue">
                    <span className="font-bold text-base uppercase text-kn-neutral3">Total Saída</span>
                    <span className="text-3xl font-black">{totalOutbound}</span>
                </div>
            </div>
        </div>

        {/* MIDDLE COL */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-8 border-kn-green">
                <h2 className="text-base font-bold text-kn-neutral3 uppercase mb-4">Expedição da Semana</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                    {data.weekly.map(w => (
                        <div key={w.id} className="text-center p-3 bg-kn-neutral1 rounded-lg">
                            <div className="text-xs font-bold text-kn-neutral4 mb-1 uppercase">
                                <EditableText value={w.label} onSave={(v) => {
                                    const newWeekly = data.weekly.map(item => item.id === w.id ? { ...item, label: v } : item);
                                    save({...data, weekly: newWeekly});
                                }} />
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-kn-darkBlue">
                                <EditableText value={w.value} onSave={(v) => {
                                    const newWeekly = data.weekly.map(item => item.id === w.id ? { ...item, value: v } : item);
                                    save({...data, weekly: newWeekly});
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-center text-kn-darkBlue font-medium text-base italic bg-blue-50 p-3 rounded-lg">
                    <EditableText value={data.info.expedicaoNote} onSave={(v) => save({...data, info: {...data.info, expedicaoNote: v}})} />
                </div>
            </div>

             <div className="bg-white rounded-xl shadow-sm p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-5">
                     <h2 className="text-xl font-bold text-kn-lightBlue flex items-center gap-3"><Package size={24}/> Inbound</h2>
                    <button onClick={addInbound} className="p-2 hover:bg-kn-neutral1 rounded-lg text-kn-green transition-colors"><Plus size={24}/></button>
                </div>
                 <div className="overflow-x-auto flex-1">
                    <div className="min-w-[450px] md:min-w-0">
                        <div className="grid grid-cols-[3fr_1fr_2fr_1fr_1fr_auto] gap-2 mb-3 text-sm font-bold text-kn-neutral3 uppercase">
                            <div>Transp</div>
                            <div className="text-center">Qtd</div>
                            <div>Placa</div>
                            <div className="text-center cursor-help" title="Descarga">D</div>
                            <div className="text-center cursor-help" title="Recebimento">R</div>
                            <div className="w-6"></div>
                        </div>
                        <div className="space-y-2 overflow-y-auto max-h-[350px]">
                            {data.inbound.map((item) => (
                                <div key={item.id} className="group grid grid-cols-[3fr_1fr_2fr_1fr_1fr_auto] gap-2 items-center bg-kn-neutral1/30 p-3 rounded-lg hover:bg-kn-neutral1 border border-transparent hover:border-kn-lightBlue/20 text-base">
                                    <div className="font-bold text-kn-darkBlue truncate"><EditableText value={item.transp} onSave={(v) => updateInbound(item.id, 'transp', v)} /></div>
                                    <div className="text-center font-mono font-bold"><EditableText type="number" value={item.qtd} onSave={(v) => updateInbound(item.id, 'qtd', Number(v))} /></div>
                                    <div className="text-kn-neutral4 text-sm font-medium"><EditableText value={item.placa} onSave={(v) => updateInbound(item.id, 'placa', v)} /></div>
                                    <div className="flex justify-center"><StatusCheckbox checked={item.status.desc} onChange={(c) => updateInboundStatus(item.id, 'desc', c)} /></div>
                                    <div className="flex justify-center"><StatusCheckbox checked={item.status.rec} onChange={(c) => updateInboundStatus(item.id, 'rec', c)} /></div>
                                    <button onClick={() => deleteInbound(item.id)} className="text-kn-neutral3 hover:text-kn-red opacity-0 group-hover:opacity-100 p-1"><Trash size={16}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-auto pt-5 flex justify-between items-center text-kn-lightBlue border-t">
                    <span className="font-bold text-base uppercase text-kn-neutral3">Total Entrada</span>
                    <span className="text-3xl font-black">{totalInbound}</span>
                </div>
             </div>
        </div>

        {/* RIGHT COL */}
        <div className="md:col-span-1 xl:col-span-3 flex flex-col gap-6">
            <div className="bg-kn-darkBlue text-white rounded-xl shadow-lg p-8 text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                <h2 className="text-kn-neutral2 text-sm font-bold uppercase tracking-widest mb-3">TOTAL DE BIKES</h2>
                <div className="text-6xl font-black tracking-tighter">
                     <EditableText type="number" value={data.info.totalStock} onSave={(v) => save({...data, info: {...data.info, totalStock: Number(v)}})} />
                </div>
                <div className="mt-5 pt-5 border-t border-white/10 text-sm font-medium text-kn-lightBlue">
                     <EditableText value={data.info.recebimentoNote} onSave={(v) => save({...data, info: {...data.info, recebimentoNote: v}})} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 flex-1">
                <h2 className="text-base font-bold text-kn-red uppercase mb-5 border-b pb-3">Alertas & Importação</h2>
                <ul className="space-y-4">
                    {data.imports.map((imp, idx) => (
                        <li key={imp.id} className="text-base font-medium text-kn-darkBlue bg-blue-50/50 p-4 rounded-lg border-l-4 border-kn-lightBlue">
                            <EditableText type="textarea" value={imp.text} onSave={(v) => {
                                    const newImports = [...data.imports];
                                    newImports[idx] = { ...newImports[idx], text: v };
                                    save({ ...data, imports: newImports });
                                }} 
                            />
                        </li>
                    ))}
                </ul>
                <button onClick={() => save({...data, imports: [...data.imports, {id: Date.now().toString(), text: 'Novo alerta'}]})} className="w-full mt-6 py-3 border-2 border-dashed border-kn-neutral2 text-kn-neutral3 rounded-lg hover:bg-kn-neutral1 text-sm font-bold uppercase">
                    + Adicionar Alerta
                </button>
            </div>
        </div>
      </div>

      {/* BOTTOM ROW: Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {data.progressBars.map((bar, idx) => (
              <ProgressBar key={bar.id} data={bar} 
                onUpdate={(field, val) => {
                    const newBars = [...data.progressBars];
                    newBars[idx] = { ...newBars[idx], [field]: val };
                    save({ ...data, progressBars: newBars });
                }}
                onDelete={() => deleteProgressBar(bar.id)}
              />
          ))}
          <button onClick={addProgressBar} className="bg-kn-neutral1 border-2 border-dashed border-kn-neutral2 rounded-xl flex flex-col items-center justify-center p-4 text-kn-neutral3 hover:text-kn-lightBlue hover:border-kn-lightBlue hover:bg-white transition-all gap-2 group min-h-[120px]">
            <Plus size={40} className="group-hover:scale-110 transition-transform"/><span className="font-bold text-sm uppercase">Novo Shipment</span>
          </button>
      </div>

      {/* FOOTER */}
      <footer className="mt-6 border-t border-kn-neutral2/30 pt-6 pb-2 text-center">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-kn-neutral3">
          <span>&copy; {new Date().getFullYear()} Painel Operacional Logístico.</span>
          <span className="hidden md:inline mx-1">|</span>
          <div className="flex items-center gap-1">
             <span>Desenvolvido por</span>
             <a 
               href="https://www.linkedin.com/in/abner-soares/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="flex items-center gap-1 font-bold text-kn-lightBlue hover:text-kn-darkBlue transition-colors"
             >
                Abner Soares <Linkedin size={14} />
             </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;