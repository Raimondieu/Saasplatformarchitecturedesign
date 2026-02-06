import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Upload, CheckCircle2, Shield, ExternalLink, XCircle, BarChart3, Save, FileText, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

// LISTA COMPLETA STANDARD ESRS
const ESRS_STANDARDS = [
  { code: 'ESRS 2', name: 'General Disclosures' },
  { code: 'ESRS E1', name: 'Climate Change' },
  { code: 'ESRS E2', name: 'Pollution' },
  { code: 'ESRS E3', name: 'Water and marine resources' },
  { code: 'ESRS E4', name: 'Biodiversity and ecosystems' },
  { code: 'ESRS E5', name: 'Resource use and circular economy' },
  { code: 'ESRS S1', name: 'Own workforce' },
  { code: 'ESRS S2', name: 'Workers in the value chain' },
  { code: 'ESRS S3', name: 'Affected communities' },
  { code: 'ESRS S4', name: 'Consumers and end-users' },
  { code: 'ESRS G1', name: 'Business conduct' }
];

// Funzione helper per normalizzare i codici standard per il database
// Converte "ESRS E1" -> "E1", "ESRS-E1" -> "E1", "ESRS S1" -> "S1", ma lascia "ESRS 2" -> "ESRS 2"
const normalizeStandardCode = (code: string): string => {
  if (!code) {
    return code || '';
  }
  
  const trimmed = code.trim();
  
  // "ESRS 2" rimane "ESRS 2" (gestisce anche "ESRS-2", "ESRS2", "2")
  if (trimmed === 'ESRS 2' || trimmed === 'ESRS-2' || trimmed === 'ESRS2' || trimmed === '2') {
    return 'ESRS 2';
  }
  
  // Rimuovi "ESRS " o "ESRS-" dall'inizio e restituisci il resto
  // Gestisce: "ESRS E1", "ESRS-E1", "ESRS E1", ecc.
  const normalized = trimmed.replace(/^ESRS[\s-]+/i, '').trim();
  
  return normalized || trimmed; // Fallback al codice originale se la normalizzazione fallisce
};

export function LiveDemo() {
  console.log("🎬 LiveDemo componente renderizzato!");
  
  // --- STATI DEL SISTEMA ---
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Stati per Materialità
  const [selectedStandard, setSelectedStandard] = useState('ESRS E1');
  const [impactScore, setImpactScore] = useState('');
  const [financialScore, setFinancialScore] = useState('');
  
  // 2. Stati per Data Collection (Catalogo)
  const [materialStandards, setMaterialStandards] = useState<any[]>([]);
  const [activeDatapoints, setActiveDatapoints] = useState<any[]>([]);
  const [selectedDP, setSelectedDP] = useState<any>(null);
  const [currentValue, setCurrentValue] = useState('');
  
  // 3. Stati per Audit & Upload
  const [dbDataPoints, setDbDataPoints] = useState<any[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // --- CARICAMENTO DATI INIZIALE ---
  const loadAllData = async () => {
    console.log("🚀 loadAllData chiamata");
    setIsLoading(true);
    try {
      console.log("📡 Recupero standard materiali dal database...");
      // A. Recupera standard materiali
      const { data: matData, error: matError } = await supabase
        .from('materiality_assessment')
        .select('*')
        .eq('is_material', true)
        .order('last_updated', { ascending: false });
        
      if (matError) {
        console.error("❌ Errore recupero materialità:", matError);
        alert(`Errore nel recupero dei dati: ${matError.message}`);
        throw matError;
      }
      
      console.log("✅ Dati materialità ricevuti:", matData);
      console.log("Numero di record:", matData?.length || 0);
        
      // Filtro unicità lato client
      const uniqueStandards = matData ? Array.from(new Map(matData.map(item => [item.standard_code, item])).values()) : [];
      console.log("Standard unici dopo filtro:", uniqueStandards);
      setMaterialStandards(uniqueStandards);

      if (uniqueStandards.length > 0) {
        console.log("=== 🔍 DEBUG MATERIALITÀ ===");
        console.log("📋 Standard materiali trovati (originali dal DB):", uniqueStandards.map(m => m.standard_code));
        
        // Normalizza i codici standard per il matching con il catalogo
        // Il catalogo usa "E1", "S1", "ESRS 2", quindi normalizziamo i codici
        // I codici nel DB materiality_assessment sono "ESRS-E1", "ESRS-S1", ecc.
        const codes = uniqueStandards.map(m => {
          const originalCode = m.standard_code;
          const normalized = normalizeStandardCode(originalCode);
          console.log(`  🔄 Normalizzazione: "${originalCode}" -> "${normalized}"`);
          return normalized;
        });
        
        console.log("✅ Standard materiali normalizzati per catalogo:", codes);
        console.log("📝 Nota: Il catalogo usa formato 'E1', 'S1', 'ESRS 2'");
        
        // DEBUG: Verifica quali codici sono effettivamente nel catalogo
        console.log("🔎 Verifico codici disponibili nel catalogo...");
        const { data: sampleCatalog, error: sampleError } = await supabase
          .from('esrs_catalog')
          .select('standard_code')
          .limit(200);
          
        if (sampleError) {
          console.error("❌ Errore nel recupero campione catalogo:", sampleError);
        } else if (sampleCatalog) {
          const uniqueCatalogCodes = Array.from(new Set(sampleCatalog.map((item: any) => item.standard_code).filter(Boolean)));
          console.log("📊 Codici standard UNICI presenti nel catalogo:", uniqueCatalogCodes);
          console.log("📊 Numero di codici unici:", uniqueCatalogCodes.length);
          
          // Verifica se i codici normalizzati corrispondono
          const matchingCodes = codes.filter(c => uniqueCatalogCodes.includes(c));
          const missingCodes = codes.filter(c => !uniqueCatalogCodes.includes(c));
          console.log("✅ Codici che corrispondono:", matchingCodes);
          if (missingCodes.length > 0) {
            console.warn("⚠️ Codici che NON corrispondono:", missingCodes);
          }
        }
        
        // B. Recupera catalogo con codici normalizzati
        console.log("🔍 Cercando nel catalogo con codici:", codes);
        const { data: catData, error: catError } = await supabase
          .from('esrs_catalog')
          .select('*')
          .in('standard_code', codes)
          .order('datapoint_code', { ascending: true });
          
        if (catError) {
          console.error("❌ Errore recupero catalogo:", catError);
          console.error("Dettagli errore:", JSON.stringify(catError, null, 2));
          alert(`Errore nel recupero del catalogo: ${catError.message}`);
        } else {
          console.log(`✅ Trovati ${catData?.length || 0} datapoint nel catalogo`);
          if (catData && catData.length > 0) {
            // Raggruppa per standard_code per vedere la distribuzione
            const byStandard = catData.reduce((acc: any, dp: any) => {
              acc[dp.standard_code] = (acc[dp.standard_code] || 0) + 1;
              return acc;
            }, {});
            console.log("📊 Distribuzione datapoint per standard:", byStandard);
            console.log("📄 Esempio di datapoint trovato:", catData[0]);
          } else {
            console.warn("⚠️⚠️⚠️ NESSUN DATAPOINT TROVATO! ⚠️⚠️⚠️");
            console.warn("Codici cercati:", codes);
            console.warn("Verifica che i codici nel catalogo corrispondano esattamente");
          }
        }
        
        setActiveDatapoints(catData || []);
      } else {
        console.log("ℹ️ Nessuno standard materiale trovato nel database");
        setActiveDatapoints([]);
      }

      // C. Recupera storico Audit
      const { data: auditData, error: auditError } = await supabase
        .from('esrs_data_points')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (auditError) {
        console.error("Errore recupero audit:", auditError);
      }
      
      setDbDataPoints(auditData || []);

    } catch (err: any) {
      console.error("Errore caricamento:", err.message);
      alert(`Errore nel caricamento dei dati: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    console.log("⚡ useEffect eseguito, chiamo loadAllData");
    loadAllData(); 
  }, []);

  // --- FUNZIONI OPERATIVE ---

  // 1. Salva Analisi Materialità
  const saveMateriality = async () => {
    setIsSaving(true);
    try {
      const imp = parseFloat(impactScore);
      const fin = parseFloat(financialScore);
      
      // Valida i punteggi
      if (isNaN(imp) || isNaN(fin) || imp < 0 || imp > 5 || fin < 0 || fin > 5) {
        alert('I punteggi devono essere numeri tra 0 e 5');
        setIsSaving(false);
        return;
      }
      
      // Trova il nome corretto del topic
      const stdObj = ESRS_STANDARDS.find(s => s.code === selectedStandard);
      const topicName = stdObj ? stdObj.name : 'General';

      // Determina se lo standard è materiale (se uno dei due punteggi è >= 3.0)
      const isMaterial = imp >= 3.0 || fin >= 3.0;

      // Normalizza il codice standard per il database (E1, S1, ecc. invece di ESRS E1, ESRS S1)
      const normalizedCode = normalizeStandardCode(selectedStandard);

      const { error } = await supabase.from('materiality_assessment').insert([{ 
        standard_code: normalizedCode, // Usa il codice normalizzato
        topic_name: topicName,
        impact_score: imp, 
        financial_score: fin,
        is_material: isMaterial,
        last_updated: new Date().toISOString()
      }]);

      if (error) throw error;
      
      // Reset form
      setImpactScore('');
      setFinancialScore('');
      
      alert(`Analisi salvata per ${selectedStandard}! ${isMaterial ? 'Lo standard è stato marcato come materiale.' : 'Lo standard non è materiale (nessun punteggio ≥ 3.0).'}`);
      loadAllData(); 
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Upload File
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('evidenze-esrs').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('evidenze-esrs').getPublicUrl(fileName);
      setUploadedFileUrl(publicUrl);
    } catch (err: any) {
      alert(`Errore upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. Salva Dato nel Registro
  const saveDatapointEntry = async () => {
    if (!selectedDP || !currentValue) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('esrs_data_points').insert([{ 
        code: selectedDP.datapoint_code, 
        label: selectedDP.label,
        value: currentValue, 
        status: 'In Progress',
        evidence_url: uploadedFileUrl,
        catalog_id: selectedDP.id 
      }]);
      if (error) throw error;
      
      alert("Dato salvato!");
      setCurrentValue('');
      setUploadedFileUrl(null);
      setSelectedDP(null); 
      loadAllData();
    } catch (err: any) {
      alert(`Errore: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Aggiorna Stato (Audit)
  const updateAuditStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('esrs_data_points').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setDbDataPoints(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ESRS Compliance Platform</h2>
          <p className="text-slate-500">Gestione integrata Materialità, Raccolta Dati e Audit.</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{materialStandards.length}</div>
            <p className="text-xs text-slate-500 uppercase font-bold">Standard Materiali</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700">{activeDatapoints.length}</div>
            <p className="text-xs text-blue-600 uppercase font-bold">Requisiti Attivi</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700">
              {dbDataPoints.filter(d => d.status === 'Approved').length}
            </div>
            <p className="text-xs text-green-600 uppercase font-bold">Dati Approvati</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materiality" className="space-y-4">
        <TabsList>
          <TabsTrigger value="materiality">1. Analisi Materialità</TabsTrigger>
          <TabsTrigger value="collection">2. Data Collection</TabsTrigger>
          <TabsTrigger value="audit">3. Review & Audit</TabsTrigger>
        </TabsList>

        {/* TAB 1: ANALISI MATERIALITÀ */}
        <TabsContent value="materiality">
          <Card>
            <CardHeader>
              <CardTitle>Valutazione Doppia Materialità</CardTitle>
              <CardDescription>Definisci la soglia per attivare gli standard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label>Seleziona Standard ESRS</Label>
                {/* FIX: Aggiunto bg-white e z-50 per evitare trasparenze e sovrapposizioni.
                  Il SelectContent ora ha uno sfondo solido.
                */}
                <Select onValueChange={setSelectedStandard} defaultValue={selectedStandard}>
                  <SelectTrigger className="bg-white"><SelectValue placeholder="Scegli standard" /></SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                    {ESRS_STANDARDS.map(std => (
                      <SelectItem key={std.code} value={std.code} className="hover:bg-slate-50 cursor-pointer">
                        <span className="font-bold mr-2">{std.code}</span> - {std.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Impatto (0-5)</Label>
                  <Input type="number" value={impactScore} onChange={e => setImpactScore(e.target.value)} placeholder="Es. 4.5" />
                </div>
                <div className="space-y-2">
                  <Label>Finanziario (0-5)</Label>
                  <Input type="number" value={financialScore} onChange={e => setFinancialScore(e.target.value)} placeholder="Es. 3.0" />
                </div>
              </div>
              <Button onClick={saveMateriality} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salva Valutazione
              </Button>
              <p className="text-xs text-slate-400 mt-2">Nota: Se uno dei due punteggi è ≥ 3.0, lo standard diventa "Materiale".</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: DATA COLLECTION */}
        <TabsContent value="collection">
          {selectedDP ? (
            <Card className="border-blue-500 shadow-md">
              <CardHeader className="bg-blue-50 py-3">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span>Inserimento: <span className="font-mono">{selectedDP.datapoint_code}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedDP(null)}>Annulla</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="bg-slate-50 p-3 rounded text-xs text-slate-700 border mb-2">
                  {selectedDP.label}
                </div>
                <div className="space-y-2">
                  <Label>Valore ({selectedDP.data_type})</Label>
                  <Input 
                    value={currentValue} 
                    onChange={(e) => setCurrentValue(e.target.value)} 
                    placeholder="Inserisci il dato richiesto..." 
                    className="font-medium"
                  />
                </div>
                <div className="border-2 border-dashed border-slate-200 p-6 rounded text-center">
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />} 
                    Allega Evidenza PDF
                  </Button>
                  {uploadedFileUrl && <p className="text-xs text-green-600 mt-2 font-bold">File caricato con successo!</p>}
                </div>
                <Button className="w-full bg-blue-700" onClick={saveDatapointEntry} disabled={isSaving || !currentValue}>
                   Salva e Invia all'Auditor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {materialStandards.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <p className="text-slate-500 mb-2">Nessuno standard materiale trovato.</p>
                    <p className="text-sm text-slate-400">Vai al Tab "Analisi Materialità" e completa l'analisi per almeno uno standard.</p>
                    <p className="text-xs text-slate-400 mt-2">Uno standard diventa materiale quando il punteggio di Impatto o Finanziario è ≥ 3.0</p>
                  </CardContent>
                </Card>
              ) : (
                <Accordion type="multiple" className="w-full space-y-4">
                  {materialStandards.map((std) => {
                    // Normalizza il codice standard per il matching
                    // Nel DB materiality_assessment: "ESRS-E1"
                    // Nel catalogo esrs_catalog: "E1"
                    const normalizedStdCode = normalizeStandardCode(std.standard_code);
                    
                    // Filtra i datapoint che corrispondono al codice normalizzato
                    // I datapoint nel catalogo hanno già il codice nel formato "E1", "S1", ecc.
                    const standardDatapoints = activeDatapoints.filter(dp => {
                      if (!dp.standard_code) return false;
                      // Normalizza anche il codice del datapoint (per sicurezza, anche se dovrebbe già essere "E1")
                      const normalizedDpCode = normalizeStandardCode(dp.standard_code);
                      return normalizedStdCode === normalizedDpCode;
                    });
                    
                    // Trova il nome completo dello standard per la visualizzazione
                    // Cerca nello standard che corrisponde al codice normalizzato
                    const displayCode = ESRS_STANDARDS.find(s => 
                      normalizeStandardCode(s.code) === normalizedStdCode
                    )?.code || std.standard_code;
                    
                    return (
                      <AccordionItem key={std.id || std.standard_code} value={std.standard_code} className="border rounded-lg">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <BarChart3 className="h-5 w-5 text-blue-600" />
                              <div className="text-left">
                                <div className="font-bold text-lg">{displayCode}</div>
                                <div className="text-sm text-slate-500 font-normal">{std.topic_name || 'Standard ESRS'}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {standardDatapoints.length} datapoint{standardDatapoints.length !== 1 ? 's' : ''}
                              </Badge>
                              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                          {standardDatapoints.length === 0 ? (
                            <div className="p-4 text-center text-amber-600 bg-amber-50 rounded border border-amber-200">
                              <p className="text-sm font-medium mb-2">Nessun datapoint trovato per "{displayCode}"</p>
                              <div className="text-xs text-amber-600 space-y-1 text-left bg-white p-3 rounded border border-amber-200 mt-2">
                                <p className="font-semibold">Possibili cause:</p>
                                <ul className="list-disc list-inside space-y-1 text-amber-500">
                                  <li>Il catalogo <code className="bg-amber-100 px-1 rounded">esrs_catalog</code> non contiene dati per questo standard</li>
                                  <li>Il codice nel database è "{normalizedStdCode}" - verifica che corrisponda ai codici nel catalogo</li>
                                </ul>
                                <p className="mt-2 text-amber-600">
                                  <strong>Suggerimento:</strong> Apri la console del browser (F12) per vedere i log di debug.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2 mt-2">
                              {standardDatapoints.map(dp => (
                                <div 
                                  key={dp.id} 
                                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors bg-white"
                                >
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="font-mono text-xs text-blue-700 bg-blue-50 border-blue-200">
                                        {dp.datapoint_code}
                                      </Badge>
                                      {dp.is_voluntary && (
                                        <Badge className="bg-amber-100 text-amber-700 border-none text-xs">
                                          VOLONTARIO
                                        </Badge>
                                      )}
                                      {dp.data_type && (
                                        <Badge variant="outline" className="text-xs text-slate-600">
                                          {dp.data_type}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                                      {dp.label}
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setSelectedDP(dp)}
                                    className="ml-4 shrink-0"
                                  >
                                    Inserisci
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: AUDIT & APPROVAZIONE */}
        <TabsContent value="audit">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b text-slate-500">
                  <tr>
                    <th className="p-3">Data</th>
                    <th className="p-3">Codice</th>
                    <th className="p-3">Valore Inserito</th>
                    <th className="p-3">Evidenza</th>
                    <th className="p-3">Stato</th>
                    <th className="p-3 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {dbDataPoints.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-slate-400">Nessun dato in revisione.</td></tr>}
                  {dbDataPoints.map(row => (
                    <tr key={row.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 text-slate-400">{new Date(row.updated_at).toLocaleDateString()}</td>
                      <td className="p-3 font-bold font-mono text-blue-700">{row.code}</td>
                      <td className="p-3 font-medium">{row.value}</td>
                      <td className="p-3">
                        {row.evidence_url ? (
                          <Button variant="ghost" size="sm" className="h-6 text-blue-600" onClick={() => window.open(row.evidence_url, '_blank')}>
                            <ExternalLink className="h-3 w-3 mr-1"/> PDF
                          </Button>
                        ) : <span className="text-slate-300">-</span>}
                      </td>
                      <td className="p-3">
                        <Badge className={
                          row.status === 'Approved' ? 'bg-green-100 text-green-700 border-none' : 
                          row.status === 'Rejected' ? 'bg-red-100 text-red-700 border-none' : 
                          'bg-orange-100 text-orange-700 border-none'
                        }>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-green-200 text-green-600 hover:bg-green-50" onClick={() => updateAuditStatus(row.id, 'Approved')}>
                            <CheckCircle2 className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 w-7 p-0 border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateAuditStatus(row.id, 'Rejected')}>
                            <XCircle className="h-4 w-4"/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}