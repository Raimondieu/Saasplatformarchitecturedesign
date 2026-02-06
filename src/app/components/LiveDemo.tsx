import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useProject } from '../lib/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, Upload, CheckCircle2, Shield, ExternalLink, XCircle, BarChart3, Save, FileText, ChevronDown, ArrowLeft, FolderOpen, Lock, Circle, Clock, Filter, FileDown, ClipboardList } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { generateESRSReport } from '../lib/reportGenerator';
import { saveAs } from 'file-saver';

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
  
  // --- AUTH & RUOLO ---
  const { profile, user, globalRole } = useAuth();
  const { currentProject, projectRole } = useProject();
  const role = projectRole || globalRole || 'DataCollector';
  const canApproveReject = role === 'Admin' || role === 'Reviewer';
  const canCollectData = role === 'Admin' || role === 'DataCollector';
  const projectId = currentProject?.id || null;
  
  // --- STATI DEL SISTEMA ---
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. Stati per Materialità
  const [selectedStandard, setSelectedStandard] = useState('ESRS E1');
  const [impactScore, setImpactScore] = useState('');
  const [financialScore, setFinancialScore] = useState('');
  
  // 2. Stati per Data Collection (Catalogo)
  const [evaluatedStandardCodes, setEvaluatedStandardCodes] = useState<Set<string>>(new Set()); // standard già valutati
  const [allAssessedStandards, setAllAssessedStandards] = useState<any[]>([]); // tutti gli standard valutati con punteggi
  const [materialStandards, setMaterialStandards] = useState<any[]>([]);
  const [activeDatapoints, setActiveDatapoints] = useState<any[]>([]);
  const [selectedStandardForCollection, setSelectedStandardForCollection] = useState<any>(null); // standard di cui vedere i datapoint
  const [selectedDP, setSelectedDP] = useState<any>(null);
  const [currentValue, setCurrentValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [datapointFilter, setDatapointFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed'>('all');
  
  // 4. Stati per Audit raggruppato
  const [selectedStandardForAudit, setSelectedStandardForAudit] = useState<string | null>(null);
  const [auditStatusFilter, setAuditStatusFilter] = useState<'all' | 'In Progress' | 'Approved' | 'Rejected'>('all');
  
  // 3. Stati per Audit & Upload
  const [dbDataPoints, setDbDataPoints] = useState<any[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- CARICAMENTO DATI INIZIALE ---
  const loadAllData = async () => {
    console.log("🚀 loadAllData chiamata");
    setIsLoading(true);
    try {
      console.log("📡 Recupero standard materiali dal database...");
      // A0. Recupera TUTTI gli standard già valutati (materiali e non) per bloccare duplicati e matrice
      let matQuery = supabase.from('materiality_assessment').select('*').order('last_updated', { ascending: false });
      if (projectId) matQuery = matQuery.eq('project_id', projectId);
      const { data: allAssessed, error: allAssessedError } = await matQuery;

      if (!allAssessedError && allAssessed) {
        const codes = new Set(allAssessed.map((item: any) => normalizeStandardCode(item.standard_code)));
        setEvaluatedStandardCodes(codes);
        // Deduplicazione per standard_code (prendi il più recente)
        const unique = Array.from(new Map(allAssessed.map((item: any) => [normalizeStandardCode(item.standard_code), item])).values());
        setAllAssessedStandards(unique);
        console.log("📋 Standard già valutati:", Array.from(codes));
      }

      // A. Recupera standard materiali
      let matDataQuery = supabase.from('materiality_assessment').select('*').eq('is_material', true).order('last_updated', { ascending: false });
      if (projectId) matDataQuery = matDataQuery.eq('project_id', projectId);
      const { data: matData, error: matError } = await matDataQuery;
        
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
        
        // B. Recupera catalogo: prima con codici normalizzati, se vuoto carica tutto e filtra lato client
        let catData: any[] | null = null;
        let catError: any = null;
        
        const { data: queryData, error: queryErr } = await supabase
          .from('esrs_catalog')
          .select('*')
          .in('standard_code', codes)
          .order('datapoint_code', { ascending: true });
        
        catData = queryData;
        catError = queryErr;
          
        if (catError) {
          console.error("❌ Errore recupero catalogo:", catError);
          alert(`Errore nel recupero del catalogo: ${catError.message}`);
        } else if (!catData || catData.length === 0) {
          // Fallback: carica tutto il catalogo e filtra per codice normalizzato lato client
          console.log("⚠️ Query per codici vuota, carico tutto il catalogo e filtro lato client...");
          const { data: allCatalog, error: allErr } = await supabase
            .from('esrs_catalog')
            .select('*')
            .order('datapoint_code', { ascending: true })
            .limit(2000);
          if (!allErr && allCatalog && allCatalog.length > 0) {
            const codesSet = new Set(codes);
            catData = allCatalog.filter((dp: any) => 
              dp.standard_code && codesSet.has(normalizeStandardCode(dp.standard_code))
            );
            console.log(`✅ Filtro client-side: ${catData.length} datapoint per gli standard materiali`);
          }
        }
        
        setActiveDatapoints(catData || []);
      } else {
        console.log("ℹ️ Nessuno standard materiale trovato nel database");
        setActiveDatapoints([]);
      }

      // C. Recupera storico Audit
      let auditQuery = supabase.from('esrs_data_points').select('*').order('updated_at', { ascending: false });
      if (projectId) auditQuery = auditQuery.eq('project_id', projectId);
      const { data: auditData, error: auditError } = await auditQuery;
        
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
    console.log("useEffect eseguito, chiamo loadAllData, projectId:", projectId);
    loadAllData(); 
  }, [projectId]);

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

      // Nota: is_material potrebbe essere una colonna generata nel DB,
      // quindi inseriamo senza specificarla e lasciamo che il DB la calcoli.
      // Se il DB non la genera, la aggiungiamo come fallback.
      let insertError: any = null;

      // Primo tentativo: senza is_material (per colonne generate)
      const { error: err1 } = await supabase.from('materiality_assessment').insert([{ 
        standard_code: normalizedCode,
        topic_name: topicName,
        impact_score: imp, 
        financial_score: fin,
        last_updated: new Date().toISOString(),
        ...(projectId ? { project_id: projectId } : {}),
      }]);

      if (err1) {
        // Fallback: con is_material esplicito (per colonne normali)
        const { error: err2 } = await supabase.from('materiality_assessment').insert([{ 
          standard_code: normalizedCode,
          topic_name: topicName,
          impact_score: imp, 
          financial_score: fin,
          is_material: isMaterial,
          last_updated: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {}),
        }]);
        insertError = err2;
      }

      if (insertError) throw insertError;
      
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

  // --- VALIDAZIONE PER TIPO DI DATO ---

  // Parole chiave che indicano un tipo numerico nel campo data_type
  const NUMERIC_KEYWORDS = ['monetar', 'monetary', 'integer', 'intero', 'mass', 'massa', 'peso', 'weight', 'percent', 'table', 'numerical', 'numeric', 'numerico', 'decimal', 'float', 'number', 'cifr'];
  // Parole chiave che indicano un tipo testuale
  const TEXT_KEYWORDS = ['narrativ', 'semi-narrativ', 'testo', 'text', 'qualitativ', 'description', 'mdr'];

  // Determina se un data_type richiede un valore numerico
  const isNumericType = (dataType: string | null | undefined): boolean => {
    if (!dataType) return false;
    const dt = dataType.toLowerCase().trim();
    return NUMERIC_KEYWORDS.some(kw => dt.includes(kw));
  };

  // Determina se un data_type è testuale
  const isTextType = (dataType: string | null | undefined): boolean => {
    if (!dataType) return true; // default: testo
    const dt = dataType.toLowerCase().trim();
    return TEXT_KEYWORDS.some(kw => dt.includes(kw));
  };

  // Determina se è un intero
  const isIntegerType = (dataType: string | null | undefined): boolean => {
    if (!dataType) return false;
    const dt = dataType.toLowerCase().trim();
    return dt.includes('integer') || dt.includes('intero');
  };

  // Validazione: restituisce null se valido, messaggio di errore se non valido
  const validateValueForType = (value: string, dataType: string | null | undefined): string | null => {
    if (!value.trim()) return 'Il valore non può essere vuoto.';
    if (!dataType) return null; // Nessun tipo specificato, accetta tutto

    const dt = dataType.toLowerCase().trim();

    // Se è un tipo numerico, il valore DEVE essere un numero
    if (isNumericType(dataType)) {
      // Pulisci il valore: permetti virgola come separatore decimale
      const cleaned = value.replace(/\s/g, '').replace(',', '.');

      // Intero: solo numeri interi
      if (isIntegerType(dataType)) {
        if (!/^-?\d+$/.test(cleaned)) {
          return `Tipo "${dataType}": è richiesto un numero intero (es. 42). Non sono ammessi decimali, lettere o simboli.`;
        }
        return null;
      }

      // Percentuale: numero tra 0 e 100
      if (dt.includes('percent')) {
        const num = Number(cleaned.replace('%', ''));
        if (isNaN(num)) {
          return `Tipo "${dataType}": è richiesta una percentuale numerica (es. 75.5).`;
        }
        if (num < 0 || num > 100) {
          return `Tipo "${dataType}": la percentuale deve essere compresa tra 0 e 100.`;
        }
        return null;
      }

      // Tutti gli altri tipi numerici (Monetario, Mass, Table/numerical, ecc.)
      const num = Number(cleaned);
      if (isNaN(num)) {
        return `Tipo "${dataType}": è richiesto un valore numerico (es. 1234.56). Non sono ammesse lettere o simboli.`;
      }
      return null;
    }

    // Tipi testuali: nessuna restrizione
    return null;
  };

  // Configurazione input in base al tipo
  const getInputConfigForType = (dataType: string | null | undefined): { isTextarea: boolean; placeholder: string; inputMode: string } => {
    if (!dataType) return { isTextarea: false, placeholder: 'Inserisci il dato richiesto...', inputMode: 'text' };

    if (isNumericType(dataType)) {
      const dt = dataType.toLowerCase().trim();
      if (dt.includes('monetar') || dt.includes('monetary')) {
        return { isTextarea: false, placeholder: 'Es. 1234.56 (valore monetario, solo cifre)', inputMode: 'decimal' };
      }
      if (isIntegerType(dataType)) {
        return { isTextarea: false, placeholder: 'Es. 42 (numero intero, solo cifre)', inputMode: 'numeric' };
      }
      if (dt.includes('mass') || dt.includes('peso') || dt.includes('weight')) {
        return { isTextarea: false, placeholder: 'Es. 1500.5 (massa, solo cifre)', inputMode: 'decimal' };
      }
      if (dt.includes('percent')) {
        return { isTextarea: false, placeholder: 'Es. 75.5 (percentuale 0-100, solo cifre)', inputMode: 'decimal' };
      }
      return { isTextarea: false, placeholder: 'Es. 123.45 (valore numerico, solo cifre)', inputMode: 'decimal' };
    }

    if (isTextType(dataType)) {
      return { isTextarea: true, placeholder: 'Inserisci una descrizione testuale...', inputMode: 'text' };
    }

    return { isTextarea: false, placeholder: 'Inserisci il dato richiesto...', inputMode: 'text' };
  };

  // Gestione onChange con validazione in tempo reale
  const handleValueChange = (value: string) => {
    setCurrentValue(value);
    if (value.trim()) {
      const error = validateValueForType(value, selectedDP?.data_type);
      setValidationError(error);
    } else {
      setValidationError(null);
    }
  };

  // --- STATO COMPLETAMENTO DATAPOINT ---
  // Determina lo stato di un datapoint del catalogo confrontandolo con i dati salvati
  const getDatapointStatus = (dp: any): 'not_started' | 'in_progress' | 'completed' => {
    // Cerca se esiste un record salvato per questo datapoint
    const saved = dbDataPoints.find(
      (entry) => entry.catalog_id === dp.id || entry.code === dp.datapoint_code
    );
    if (!saved) return 'not_started'; // Nessun dato inserito
    if (saved.value && saved.evidence_url) return 'completed'; // Valore + evidenza
    return 'in_progress'; // Solo valore, manca evidenza
  };

  // Filtra i datapoint in base al filtro selezionato
  const filterDatapoints = (datapoints: any[]): any[] => {
    if (datapointFilter === 'all') return datapoints;
    return datapoints.filter((dp) => getDatapointStatus(dp) === datapointFilter);
  };

  // --- RAGGRUPPAMENTO AUDIT PER STANDARD ---
  // Estrae il codice standard da un codice datapoint (es. "E1-1" -> "E1", "S1.SBM-3" -> "S1", "ESRS 2.BP-1" -> "ESRS 2")
  const extractStandardFromCode = (code: string): string => {
    if (!code) return 'Altro';
    const c = code.trim();
    // Pattern: "ESRS 2..." o "ESRS2..."
    if (/^ESRS[\s-]?2/i.test(c)) return 'ESRS 2';
    // Pattern: "E1...", "E2...", "S1...", "G1...", ecc. (lettera + cifra all'inizio)
    const match = c.match(/^([A-Z]\d)/i);
    if (match) return match[1].toUpperCase();
    return 'Altro';
  };

  // Raggruppa i dati audit per standard
  const auditByStandard = (() => {
    const groups: Record<string, any[]> = {};
    for (const row of dbDataPoints) {
      const stdCode = extractStandardFromCode(row.code);
      if (!groups[stdCode]) groups[stdCode] = [];
      groups[stdCode].push(row);
    }
    // Ordina per codice standard
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  })();

  // 3. Salva Dato nel Registro
  const saveDatapointEntry = async () => {
    if (!selectedDP || !currentValue) return;
    
    // Validazione prima del salvataggio
    const error = validateValueForType(currentValue, selectedDP.data_type);
    if (error) {
      setValidationError(error);
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.from('esrs_data_points').insert([{ 
        code: selectedDP.datapoint_code, 
        label: selectedDP.label,
        value: currentValue, 
        status: 'In Progress',
        evidence_url: uploadedFileUrl,
        catalog_id: selectedDP.id,
        ...(projectId ? { project_id: projectId } : {}),
      }]);
      if (error) throw error;
      
      alert("Dato salvato!");
      setCurrentValue('');
      setUploadedFileUrl(null);
      setValidationError(null);
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
          <TabsTrigger value="report">4. Report</TabsTrigger>
        </TabsList>

        {/* TAB 1: ANALISI MATERIALITÀ */}
        <TabsContent value="materiality">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonna sinistra: Form valutazione */}
            <Card>
              <CardHeader>
                <CardTitle>Valutazione Doppia Materialità</CardTitle>
                <CardDescription>Definisci la soglia per attivare gli standard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const isSelectedAlreadyEvaluated = evaluatedStandardCodes.has(normalizeStandardCode(selectedStandard));
                  const availableStandards = ESRS_STANDARDS.filter(
                    std => !evaluatedStandardCodes.has(normalizeStandardCode(std.code))
                  );
                  const allEvaluated = availableStandards.length === 0;

                  return (
                    <>
                      {allEvaluated ? (
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>Tutti gli standard ESRS sono stati valutati.</span>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <Label>Seleziona Standard ESRS</Label>
                            <Select onValueChange={setSelectedStandard} defaultValue={availableStandards[0]?.code || selectedStandard}>
                              <SelectTrigger className="bg-white"><SelectValue placeholder="Scegli standard" /></SelectTrigger>
                              <SelectContent className="bg-white border shadow-lg max-h-60 overflow-y-auto z-50">
                                {ESRS_STANDARDS.map(std => {
                                  const alreadyDone = evaluatedStandardCodes.has(normalizeStandardCode(std.code));
                                  return (
                                    <SelectItem
                                      key={std.code}
                                      value={std.code}
                                      disabled={alreadyDone}
                                      className={alreadyDone ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}
                                    >
                                      <span className="flex items-center gap-2">
                                        {alreadyDone && <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />}
                                        <span className="font-bold mr-2">{std.code}</span> - {std.name}
                                        {alreadyDone && <span className="text-xs text-slate-400 ml-1">(già valutato)</span>}
                                      </span>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {isSelectedAlreadyEvaluated && (
                            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm">
                              <Lock className="h-4 w-4 shrink-0" />
                              <span>Questo standard è già stato valutato. Seleziona uno standard diverso.</span>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Impatto (0-5)</Label>
                              <Input type="number" value={impactScore} onChange={e => setImpactScore(e.target.value)} placeholder="Es. 4.5" disabled={isSelectedAlreadyEvaluated} />
                            </div>
                            <div className="space-y-2">
                              <Label>Finanziario (0-5)</Label>
                              <Input type="number" value={financialScore} onChange={e => setFinancialScore(e.target.value)} placeholder="Es. 3.0" disabled={isSelectedAlreadyEvaluated} />
                            </div>
                          </div>
                          <Button onClick={saveMateriality} disabled={isSaving || isSelectedAlreadyEvaluated} className="w-full">
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salva Valutazione
                          </Button>
                          <p className="text-xs text-slate-400 mt-2">Nota: Se uno dei due punteggi è ≥ 3.0, lo standard diventa "Materiale".</p>
                        </>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Colonna destra: Matrice di Materialità */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Matrice di Materialità</CardTitle>
                <CardDescription>Posizione degli standard valutati. Soglia materialità: 3.0</CardDescription>
              </CardHeader>
              <CardContent>
                {allAssessedStandards.length === 0 ? (
                  <div className="flex items-center justify-center h-[340px] text-slate-400 text-sm">
                    Nessuno standard valutato. Inserisci la prima valutazione.
                  </div>
                ) : (
                  <div className="relative">
                    {/* Matrice SVG */}
                    <svg viewBox="0 0 360 360" className="w-full max-w-[400px] mx-auto" style={{ overflow: 'visible' }}>
                      {/* Sfondo quadranti */}
                      {/* Basso-sinistra: non materiale */}
                      <rect x="60" y="180" width="180" height="180" rx="4" fill="#f8fafc" />
                      {/* Basso-destra: finanziariamente rilevante */}
                      <rect x="240" y="180" width="120" height="180" rx="4" fill="#fef3c7" fillOpacity="0.5" />
                      {/* Alto-sinistra: impatto rilevante */}
                      <rect x="60" y="0" width="180" height="180" rx="4" fill="#dbeafe" fillOpacity="0.5" />
                      {/* Alto-destra: doppia materialità */}
                      <rect x="240" y="0" width="120" height="180" rx="4" fill="#dcfce7" fillOpacity="0.6" />

                      {/* Etichette quadranti */}
                      <text x="145" y="280" textAnchor="middle" className="fill-slate-300" fontSize="10" fontWeight="500">Non materiale</text>
                      <text x="300" y="280" textAnchor="middle" className="fill-amber-400" fontSize="10" fontWeight="500">Finanziario</text>
                      <text x="145" y="95" textAnchor="middle" className="fill-blue-400" fontSize="10" fontWeight="500">Impatto</text>
                      <text x="300" y="95" textAnchor="middle" className="fill-green-500" fontSize="10" fontWeight="600">Materiale</text>

                      {/* Griglia */}
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <React.Fragment key={`grid-${i}`}>
                          {/* Linee orizzontali */}
                          <line x1="60" y1={360 - i * 60} x2="360" y2={360 - i * 60} stroke="#e2e8f0" strokeWidth="0.5" />
                          {/* Linee verticali */}
                          <line x1={60 + i * 60} y1="0" x2={60 + i * 60} y2="360" stroke="#e2e8f0" strokeWidth="0.5" />
                          {/* Label asse Y (Impatto) */}
                          <text x="50" y={363 - i * 60} textAnchor="end" className="fill-slate-400" fontSize="10">{i}</text>
                          {/* Label asse X (Finanziario) */}
                          <text x={60 + i * 60} y="375" textAnchor="middle" className="fill-slate-400" fontSize="10">{i}</text>
                        </React.Fragment>
                      ))}

                      {/* Linea soglia orizzontale (impatto = 3) */}
                      <line x1="60" y1="180" x2="360" y2="180" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 3" />
                      {/* Linea soglia verticale (finanziario = 3) */}
                      <line x1="240" y1="0" x2="240" y2="360" stroke="#94a3b8" strokeWidth="1" strokeDasharray="6 3" />

                      {/* Label assi */}
                      <text x="210" y="395" textAnchor="middle" className="fill-slate-500" fontSize="11" fontWeight="600">Materialità Finanziaria →</text>
                      <text x="-180" y="15" textAnchor="middle" className="fill-slate-500" fontSize="11" fontWeight="600" transform="rotate(-90)">Materialità d'Impatto →</text>

                      {/* Punti standard valutati */}
                      {allAssessedStandards.map((std, idx) => {
                        const impactVal = parseFloat(std.impact_score) || 0;
                        const financialVal = parseFloat(std.financial_score) || 0;
                        const cx = 60 + (financialVal / 5) * 300;
                        const cy = 360 - (impactVal / 5) * 360;
                        const isMat = std.is_material;
                        const normalizedCode = normalizeStandardCode(std.standard_code);
                        const displayCode = ESRS_STANDARDS.find(s =>
                          normalizeStandardCode(s.code) === normalizedCode
                        )?.code || std.standard_code;
                        // Colori in base a materialità
                        const dotColor = isMat ? '#16a34a' : '#94a3b8';
                        const dotBg = isMat ? '#dcfce7' : '#f1f5f9';
                        return (
                          <g key={`dot-${idx}`}>
                            {/* Cerchio esterno */}
                            <circle cx={cx} cy={cy} r="16" fill={dotBg} stroke={dotColor} strokeWidth="1.5" opacity="0.9" />
                            {/* Testo codice */}
                            <text
                              x={cx}
                              y={cy + 1}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill={dotColor}
                              fontSize="8"
                              fontWeight="700"
                              fontFamily="ui-monospace, monospace"
                            >
                              {displayCode.replace('ESRS ', '')}
                            </text>
                            {/* Tooltip al passaggio */}
                            <title>{`${displayCode}\nImpatto: ${impactVal} | Finanziario: ${financialVal}\n${isMat ? 'Materiale' : 'Non materiale'}`}</title>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Legenda */}
                    <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
                        Materiale
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-slate-400 inline-block"></span>
                        Non materiale
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-px w-4 border-t border-dashed border-slate-400 inline-block"></span>
                        Soglia (3.0)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scheda dedicata: Datapoint per standard materiale */}
          {materialStandards.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Datapoint per standard materiale
                </CardTitle>
                <CardDescription>
                  Espandi uno standard per vedere tutti i requisiti di disclosure (datapoint) associati dal catalogo ESRS.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {materialStandards.map((std) => {
                    const normalizedStdCode = normalizeStandardCode(std.standard_code);
                    const standardDatapoints = activeDatapoints.filter(dp => {
                      if (!dp.standard_code) return false;
                      return normalizeStandardCode(dp.standard_code) === normalizedStdCode;
                    });
                    const displayCode = ESRS_STANDARDS.find(s =>
                      normalizeStandardCode(s.code) === normalizedStdCode
                    )?.code || std.standard_code;
                    return (
                      <AccordionItem key={std.id || std.standard_code} value={std.standard_code} className="border rounded-lg mb-3 last:mb-0">
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4 text-left">
                            <div className="flex items-center gap-3">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <span className="font-semibold">{displayCode}</span>
                              <span className="text-slate-500 text-sm font-normal">— {std.topic_name || 'Standard ESRS'}</span>
                            </div>
                            <Badge variant="outline" className="bg-slate-50 text-slate-600">
                              {standardDatapoints.length} datapoint
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          {standardDatapoints.length === 0 ? (
                            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                              Nessun datapoint nel catalogo per questo standard. Verifica che i codici in esrs_catalog corrispondano.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                              {standardDatapoints.map((dp) => (
                                <div
                                  key={dp.id}
                                  className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 text-sm"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs text-blue-700 bg-blue-50 border-blue-200">
                                      {dp.datapoint_code}
                                    </Badge>
                                    {dp.disclosure_requirement && (
                                      <Badge variant="outline" className="text-xs text-slate-600">
                                        {dp.disclosure_requirement}
                                      </Badge>
                                    )}
                                    {dp.data_type && (
                                      <Badge variant="outline" className="text-xs text-slate-500">
                                        {dp.data_type}
                                      </Badge>
                                    )}
                                    {dp.is_voluntary && (
                                      <Badge className="bg-amber-100 text-amber-700 border-none text-xs">Volontario</Badge>
                                    )}
                                  </div>
                                  {dp.label && (
                                    <p className="text-slate-700 leading-snug">{dp.label}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: DATA COLLECTION */}
        <TabsContent value="collection">
          {!canCollectData && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm mb-4">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Hai accesso in sola lettura. L'inserimento dati è riservato ai ruoli <strong>Data Collector</strong> e <strong>Admin</strong>.</span>
            </div>
          )}
          {/* Schermata 1: Form inserimento singolo datapoint (valore + upload evidenza) */}
          {selectedDP ? (
            <Card className="border-blue-500 shadow-md">
              <CardHeader className="bg-blue-50 py-3">
                <CardTitle className="text-sm flex justify-between items-center">
                  <span>Inserimento: <span className="font-mono">{selectedDP.datapoint_code}</span></span>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedDP(null); setCurrentValue(''); setUploadedFileUrl(null); setValidationError(null); }}>
                    Annulla
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="bg-slate-50 p-3 rounded text-xs text-slate-700 border mb-2">
                  {selectedDP.label}
                </div>

                {/* Tipo di dato richiesto */}
                {selectedDP.data_type && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Tipo di dato richiesto:</span>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {selectedDP.data_type}
                    </Badge>
                  </div>
                )}

                {/* Campo input adattivo per tipo di dato */}
                <div className="space-y-2">
                  <Label>Valore ({selectedDP.data_type || 'testo'})</Label>
                  {(() => {
                    const config = getInputConfigForType(selectedDP.data_type);
                    const numeric = isNumericType(selectedDP.data_type);
                    
                    if (config.isTextarea) {
                      return (
                        <textarea
                          value={currentValue}
                          onChange={(e) => handleValueChange(e.target.value)}
                          placeholder={config.placeholder}
                          rows={4}
                          className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 resize-y"
                        />
                      );
                    }
                    
                    return (
                      <Input
                        type="text"
                        value={currentValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Per i tipi numerici: blocca subito l'inserimento di caratteri non validi
                          if (numeric) {
                            // Permetti solo cifre, punto, virgola, segno meno, spazi
                            if (val !== '' && !/^[\d\s.,%\-]+$/.test(val)) {
                              return; // Non aggiornare il valore
                            }
                          }
                          handleValueChange(val);
                        }}
                        placeholder={config.placeholder}
                        inputMode={config.inputMode as any}
                        className={`font-medium ${validationError ? 'border-red-400 focus-visible:ring-red-500' : ''} ${numeric ? 'font-mono' : ''}`}
                      />
                    );
                  })()}
                  {validationError && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 border border-red-200 p-2 rounded text-xs">
                      <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{validationError}</span>
                    </div>
                  )}
                  {!validationError && currentValue.trim() && isNumericType(selectedDP.data_type) && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Formato corretto</span>
                    </div>
                  )}
                </div>

                {/* Upload evidenze */}
                <div className="border-2 border-dashed border-slate-200 p-6 rounded text-center">
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById('file-upload')?.click()}>
                    {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />} 
                    Allega Evidenza PDF
                  </Button>
                  {uploadedFileUrl && <p className="text-xs text-green-600 mt-2 font-bold">File caricato!</p>}
                </div>

                {/* Pulsante salva — disabilitato se errore di validazione */}
                <Button 
                  className="w-full bg-blue-700" 
                  onClick={saveDatapointEntry} 
                  disabled={isSaving || !currentValue.trim() || !!validationError}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Salva e Invia all'Auditor
                </Button>
              </CardContent>
            </Card>
          ) : selectedStandardForCollection ? (
            /* Schermata 2: Lista datapoint dello standard selezionato con filtri */
            (() => {
              const std = selectedStandardForCollection;
              const normalizedStdCode = normalizeStandardCode(std.standard_code);
              const standardDatapoints = activeDatapoints.filter(dp => 
                dp.standard_code && normalizeStandardCode(dp.standard_code) === normalizedStdCode
              );
              const displayCode = ESRS_STANDARDS.find(s => normalizeStandardCode(s.code) === normalizedStdCode)?.code || std.standard_code;

              // Conteggi per i filtri
              const countAll = standardDatapoints.length;
              const countNotStarted = standardDatapoints.filter(dp => getDatapointStatus(dp) === 'not_started').length;
              const countInProgress = standardDatapoints.filter(dp => getDatapointStatus(dp) === 'in_progress').length;
              const countCompleted = standardDatapoints.filter(dp => getDatapointStatus(dp) === 'completed').length;

              // Datapoint filtrati
              const filteredDatapoints = filterDatapoints(standardDatapoints);

              return (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900"
                    onClick={() => { setSelectedStandardForCollection(null); setDatapointFilter('all'); }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Torna agli standard
                  </Button>
                  <Card>
                    <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        {displayCode} — {std.topic_name || 'Standard ESRS'}
                      </CardTitle>
                      <CardDescription>
                        Inserisci i dati e carica le evidenze per ogni requisito. Usa i filtri per visualizzare i datapoint per stato.
                      </CardDescription>
                    </CardHeader>

                    {/* Barra filtri */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-white flex-wrap">
                      <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                      <button
                        onClick={() => setDatapointFilter('all')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          datapointFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tutti
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${datapointFilter === 'all' ? 'bg-slate-600' : 'bg-slate-200'}`}>{countAll}</span>
                      </button>
                      <button
                        onClick={() => setDatapointFilter('not_started')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          datapointFilter === 'not_started'
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Circle className="h-3 w-3" />
                        Non completati
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${datapointFilter === 'not_started' ? 'bg-slate-500' : 'bg-slate-200'}`}>{countNotStarted}</span>
                      </button>
                      <button
                        onClick={() => setDatapointFilter('in_progress')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          datapointFilter === 'in_progress'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        Da completare
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${datapointFilter === 'in_progress' ? 'bg-amber-500' : 'bg-amber-100'}`}>{countInProgress}</span>
                      </button>
                      <button
                        onClick={() => setDatapointFilter('completed')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          datapointFilter === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Completati
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${datapointFilter === 'completed' ? 'bg-green-500' : 'bg-green-100'}`}>{countCompleted}</span>
                      </button>
                    </div>

                    <CardContent className="p-0">
                      {standardDatapoints.length === 0 ? (
                        <div className="p-6 text-center text-amber-600 bg-amber-50 rounded border border-amber-200 mx-4 mb-4">
                          <p className="font-medium">Nessun datapoint nel catalogo per questo standard.</p>
                          <p className="text-sm mt-1">Verifica che in Supabase la tabella <code className="bg-amber-100 px-1 rounded">esrs_catalog</code> abbia righe con <code className="bg-amber-100 px-1 rounded">standard_code</code> = &quot;{normalizedStdCode}&quot;</p>
                        </div>
                      ) : filteredDatapoints.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Nessun datapoint corrisponde al filtro selezionato.</p>
                          <button onClick={() => setDatapointFilter('all')} className="text-blue-600 text-sm mt-1 hover:underline">
                            Mostra tutti
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y max-h-[60vh] overflow-y-auto">
                          {filteredDatapoints.map((dp) => {
                            const status = getDatapointStatus(dp);
                            return (
                              <div
                                key={dp.id}
                                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                              >
                                {/* Indicatore stato */}
                                <div className="shrink-0 mr-3">
                                  {status === 'completed' && (
                                    <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center" title="Completato">
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    </div>
                                  )}
                                  {status === 'in_progress' && (
                                    <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center" title="Da completare (manca evidenza)">
                                      <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                  )}
                                  {status === 'not_started' && (
                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center" title="Non completato">
                                      <Circle className="h-4 w-4 text-slate-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-1 flex-1 min-w-0 pr-4">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="font-mono text-xs text-blue-700 bg-blue-50 border-blue-200">
                                      {dp.datapoint_code}
                                    </Badge>
                                    {dp.disclosure_requirement && (
                                      <Badge variant="outline" className="text-xs text-slate-600">{dp.disclosure_requirement}</Badge>
                                    )}
                                    {dp.data_type && (
                                      <Badge variant="outline" className="text-xs text-slate-500">{dp.data_type}</Badge>
                                    )}
                                    {dp.is_voluntary && (
                                      <Badge className="bg-amber-100 text-amber-700 border-none text-xs">Volontario</Badge>
                                    )}
                                  </div>
                                  {dp.label && (
                                    <p className="text-sm text-slate-700 leading-snug line-clamp-2">{dp.label}</p>
                                  )}
                                </div>
                                {canCollectData ? (
                                  <Button
                                    size="sm"
                                    variant={status === 'completed' ? 'outline' : 'default'}
                                    onClick={() => setSelectedDP(dp)}
                                    className="shrink-0"
                                  >
                                    {status === 'completed' ? 'Modifica' : status === 'in_progress' ? 'Completa' : 'Inserisci'}
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-slate-400">
                                    Solo lettura
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          ) : (
            /* Schermata 0: Lista standard materiali (card cliccabili) */
            <div className="space-y-4">
              {materialStandards.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <p className="text-slate-500 mb-2">Nessuno standard materiale trovato.</p>
                    <p className="text-sm text-slate-400">Vai al tab &quot;Analisi Materialità&quot; e salva almeno uno standard con punteggio ≥ 3.0.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <p className="text-slate-600 text-sm">Clicca su uno standard per aprire l’elenco dei datapoint e inserire i dati con le evidenze.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materialStandards.map((std) => {
                      const normalizedStdCode = normalizeStandardCode(std.standard_code);
                      const count = activeDatapoints.filter(dp => 
                        dp.standard_code && normalizeStandardCode(dp.standard_code) === normalizedStdCode
                      ).length;
                      const displayCode = ESRS_STANDARDS.find(s => normalizeStandardCode(s.code) === normalizedStdCode)?.code || std.standard_code;
                      return (
                        <Card
                          key={std.id || std.standard_code}
                          className="cursor-pointer transition-all hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30"
                          onClick={() => setSelectedStandardForCollection(std)}
                        >
                          <CardContent className="pt-6 pb-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="rounded-lg bg-blue-100 p-2 shrink-0">
                                  <BarChart3 className="h-6 w-6 text-blue-700" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-lg text-slate-900">{displayCode}</div>
                                  <div className="text-sm text-slate-500 truncate">{std.topic_name || 'Standard ESRS'}</div>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white shrink-0">
                                {count} datapoint
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mt-3">Clicca per aprire e inserire dati</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: AUDIT & APPROVAZIONE */}
        <TabsContent value="audit">
          {!canApproveReject && (
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm mb-4">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Non hai i permessi per approvare o rifiutare i dati. Questa azione è riservata ai ruoli <strong>Reviewer</strong> e <strong>Admin</strong>.</span>
            </div>
          )}

          {selectedStandardForAudit ? (
            /* Schermata dettaglio: tabella dati per lo standard selezionato */
            (() => {
              const rows = dbDataPoints.filter(
                (row) => extractStandardFromCode(row.code) === selectedStandardForAudit
              );
              const displayCode = ESRS_STANDARDS.find(s =>
                normalizeStandardCode(s.code) === selectedStandardForAudit ||
                s.code === selectedStandardForAudit
              )?.code || selectedStandardForAudit;
              const displayName = ESRS_STANDARDS.find(s =>
                normalizeStandardCode(s.code) === selectedStandardForAudit ||
                s.code === selectedStandardForAudit
              )?.name || '';

              // Conteggi per filtri
              const countAll = rows.length;
              const countInProgress = rows.filter(r => r.status === 'In Progress').length;
              const countApproved = rows.filter(r => r.status === 'Approved').length;
              const countRejected = rows.filter(r => r.status === 'Rejected').length;

              // Filtra
              const filteredRows = auditStatusFilter === 'all'
                ? rows
                : rows.filter(r => r.status === auditStatusFilter);

              return (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900"
                    onClick={() => { setSelectedStandardForAudit(null); setAuditStatusFilter('all'); }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Torna agli standard
                  </Button>

                  <Card>
                    <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-600" />
                        {displayCode}{displayName ? ` — ${displayName}` : ''}
                      </CardTitle>
                      <CardDescription>
                        Revisiona i dati inseriti per questo standard. Approva o rifiuta ogni inserimento.
                      </CardDescription>
                    </CardHeader>

                    {/* Barra filtri stato audit */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b bg-white flex-wrap">
                      <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                      <button
                        onClick={() => setAuditStatusFilter('all')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          auditStatusFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tutti
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${auditStatusFilter === 'all' ? 'bg-slate-600' : 'bg-slate-200'}`}>{countAll}</span>
                      </button>
                      <button
                        onClick={() => setAuditStatusFilter('In Progress')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          auditStatusFilter === 'In Progress'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        In revisione
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${auditStatusFilter === 'In Progress' ? 'bg-amber-500' : 'bg-amber-100'}`}>{countInProgress}</span>
                      </button>
                      <button
                        onClick={() => setAuditStatusFilter('Approved')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          auditStatusFilter === 'Approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Approvati
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${auditStatusFilter === 'Approved' ? 'bg-green-500' : 'bg-green-100'}`}>{countApproved}</span>
                      </button>
                      <button
                        onClick={() => setAuditStatusFilter('Rejected')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          auditStatusFilter === 'Rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <XCircle className="h-3 w-3" />
                        Rifiutati
                        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] ${auditStatusFilter === 'Rejected' ? 'bg-red-500' : 'bg-red-100'}`}>{countRejected}</span>
                      </button>
                    </div>

                    <CardContent className="p-0 overflow-x-auto">
                      {filteredRows.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="font-medium">Nessun inserimento corrisponde al filtro selezionato.</p>
                          <button onClick={() => setAuditStatusFilter('all')} className="text-blue-600 text-sm mt-1 hover:underline">
                            Mostra tutti
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-50 border-b text-slate-500">
                            <tr>
                              <th className="p-3">Data</th>
                              <th className="p-3">Codice</th>
                              <th className="p-3">Valore Inserito</th>
                              <th className="p-3">Evidenza</th>
                              <th className="p-3">Stato</th>
                              {canApproveReject && <th className="p-3 text-right">Azioni</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRows.map(row => (
                              <tr key={row.id} className="border-b hover:bg-slate-50">
                                <td className="p-3 text-slate-400">{new Date(row.updated_at).toLocaleDateString()}</td>
                                <td className="p-3 font-bold font-mono text-blue-700">{row.code}</td>
                                <td className="p-3 font-medium max-w-[200px] truncate">{row.value}</td>
                                <td className="p-3">
                                  {row.evidence_url ? (
                                    <Button variant="ghost" size="sm" className="h-6 text-blue-600" onClick={() => window.open(row.evidence_url, '_blank')}>
                                      <ExternalLink className="h-3 w-3 mr-1"/> PDF
                                    </Button>
                                  ) : <span className="text-slate-300">—</span>}
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
                                {canApproveReject && (
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
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()
          ) : (
            /* Schermata 0: Card per ogni standard con dati in audit */
            <div className="space-y-4">
              {dbDataPoints.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <p className="text-slate-500 mb-2">Nessun dato in revisione.</p>
                    <p className="text-sm text-slate-400">I dati inseriti nella sezione &quot;Data Collection&quot; appariranno qui per la revisione.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <p className="text-slate-600 text-sm">Clicca su uno standard per visualizzare e revisionare i dati inseriti.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {auditByStandard.map(([stdCode, rows]) => {
                      const displayCode = ESRS_STANDARDS.find(s =>
                        normalizeStandardCode(s.code) === stdCode || s.code === stdCode
                      )?.code || `ESRS ${stdCode}`;
                      const displayName = ESRS_STANDARDS.find(s =>
                        normalizeStandardCode(s.code) === stdCode || s.code === stdCode
                      )?.name || '';
                      const approved = rows.filter((r: any) => r.status === 'Approved').length;
                      const rejected = rows.filter((r: any) => r.status === 'Rejected').length;
                      const pending = rows.filter((r: any) => r.status === 'In Progress').length;
                      return (
                        <Card
                          key={stdCode}
                          className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/30"
                          onClick={() => setSelectedStandardForAudit(stdCode)}
                        >
                          <CardContent className="pt-6 pb-6">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="rounded-lg bg-indigo-100 p-2 shrink-0">
                                  <Shield className="h-6 w-6 text-indigo-700" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-lg text-slate-900">{displayCode}</div>
                                  <div className="text-sm text-slate-500 truncate">{displayName || 'Standard ESRS'}</div>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-white shrink-0">
                                {rows.length} dati
                              </Badge>
                            </div>
                            {/* Mini riepilogo stati */}
                            <div className="flex items-center gap-3 mt-3 text-xs">
                              {pending > 0 && (
                                <span className="flex items-center gap-1 text-amber-600">
                                  <Clock className="h-3 w-3" /> {pending}
                                </span>
                              )}
                              {approved > 0 && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" /> {approved}
                                </span>
                              )}
                              {rejected > 0 && (
                                <span className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-3 w-3" /> {rejected}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">Clicca per revisionare</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: REPORT */}
        <TabsContent value="report">
          {(() => {
            const approvedCount = dbDataPoints.filter(d => d.status === 'Approved').length;
            const rejectedCount = dbDataPoints.filter(d => d.status === 'Rejected').length;
            const pendingCount = dbDataPoints.filter(d => d.status === 'In Progress').length;
            const evidenceCount = dbDataPoints.filter(d => d.evidence_url).length;

            const handleGenerateReport = async () => {
              setIsGenerating(true);
              try {
                const blob = await generateESRSReport({
                  allAssessedStandards,
                  materialStandards,
                  activeDatapoints,
                  dbDataPoints,
                  userName: profile?.full_name || profile?.email || user?.email || 'Utente',
                  userRole: role || 'DataCollector',
                });
                const dateStr = new Date().toISOString().split('T')[0];
                saveAs(blob, `Report_ESRS_Bozza_${dateStr}.docx`);
              } catch (err: any) {
                console.error('Errore generazione report:', err);
                alert(`Errore nella generazione del report: ${err.message}`);
              } finally {
                setIsGenerating(false);
              }
            };

            return (
              <div className="space-y-6">
                {/* Intestazione */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                      Genera Report ESRS
                    </CardTitle>
                    <CardDescription>
                      Genera una bozza di report di compliance ESRS in formato Word (.docx) con tutti i dati della piattaforma.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
                      onClick={handleGenerateReport}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <FileDown className="mr-2 h-5 w-5" />
                      )}
                      {isGenerating ? 'Generazione in corso...' : 'Genera e Scarica Report (.docx)'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Anteprima contenuti */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sezione 1: KPI */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-600">1. Riepilogo KPI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Standard valutati</span><span className="font-bold">{allAssessedStandards.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Standard materiali</span><span className="font-bold">{materialStandards.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Requisiti attivi</span><span className="font-bold">{activeDatapoints.length}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Dati inseriti</span><span className="font-bold">{dbDataPoints.length}</span></div>
                    </CardContent>
                  </Card>

                  {/* Sezione 2: Materialità */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-600">2. Analisi di Materialità</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      {allAssessedStandards.length === 0 ? (
                        <p className="text-slate-400 italic">Nessuno standard valutato</p>
                      ) : (
                        <div className="space-y-1.5">
                          {allAssessedStandards.map(std => {
                            const nc = normalizeStandardCode(std.standard_code);
                            const dc = ESRS_STANDARDS.find(s => normalizeStandardCode(s.code) === nc)?.code || std.standard_code;
                            return (
                              <div key={std.id || nc} className="flex items-center justify-between">
                                <span className="font-mono text-xs text-blue-700">{dc}</span>
                                <Badge variant="outline" className={`text-[10px] ${std.is_material ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500'}`}>
                                  {std.is_material ? 'Materiale' : 'Non materiale'}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sezione 3: Dati Raccolti */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-600">3. Dati Raccolti</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      {materialStandards.length === 0 ? (
                        <p className="text-slate-400 italic">Nessuno standard materiale</p>
                      ) : (
                        <div className="space-y-1.5">
                          {materialStandards.map(std => {
                            const nc = normalizeStandardCode(std.standard_code);
                            const dc = ESRS_STANDARDS.find(s => normalizeStandardCode(s.code) === nc)?.code || std.standard_code;
                            const filledCount = dbDataPoints.filter(d => {
                              const dpStd = activeDatapoints.find(adp => adp.id === d.catalog_id || adp.datapoint_code === d.code);
                              return dpStd && normalizeStandardCode(dpStd.standard_code) === nc;
                            }).length;
                            return (
                              <div key={std.id || nc} className="flex items-center justify-between">
                                <span className="font-mono text-xs text-blue-700">{dc}</span>
                                <span className="text-xs text-slate-500">{filledCount} dati inseriti</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sezione 4: Audit */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-600">4. Stato Audit</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5 text-amber-600"><Clock className="h-3 w-3" /> In revisione</span>
                        <span className="font-bold">{pendingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="h-3 w-3" /> Approvati</span>
                        <span className="font-bold">{approvedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5 text-red-600"><XCircle className="h-3 w-3" /> Rifiutati</span>
                        <span className="font-bold">{rejectedCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sezione 5: Evidenze */}
                  <Card className="md:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold text-slate-600">5. Registro Evidenze</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Documenti di evidenza allegati</span>
                        <span className="font-bold">{evidenceCount} file</span>
                      </div>
                      {evidenceCount === 0 && (
                        <p className="text-slate-400 italic text-xs mt-1">Nessuna evidenza caricata</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}