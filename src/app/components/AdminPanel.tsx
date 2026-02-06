import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth, type UserRole } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Loader2, Building2, FolderPlus, Users, UserPlus, Trash2, Calendar, Save,
  AlertCircle, CheckCircle2, Plus, ChevronRight, X
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  sector: string | null;
  created_at: string;
}

interface Project {
  id: string;
  organization_id: string;
  reporting_year: number;
  status: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  global_role: string;
  created_at: string;
}

interface MemberRow {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  profiles?: ProfileRow;
  projects?: Project & { organizations?: Organization };
}

export function AdminPanel() {
  const { isGlobalAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<'orgs' | 'projects' | 'users'>('orgs');

  // -- ORG STATE --
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgName, setOrgName] = useState('');
  const [orgSector, setOrgSector] = useState('');
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgMsg, setOrgMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // -- PROJECT STATE --
  const [projects, setProjects] = useState<(Project & { org_name?: string })[]>([]);
  const [projOrgId, setProjOrgId] = useState('');
  const [projYear, setProjYear] = useState(new Date().getFullYear().toString());
  const [projLoading, setProjLoading] = useState(true);
  const [projMsg, setProjMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // -- USER STATE --
  const [allUsers, setAllUsers] = useState<ProfileRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersMsg, setUsersMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignProjectId, setAssignProjectId] = useState('');
  const [assignRole, setAssignRole] = useState<string>('DataCollector');

  // -- selected user for edit --
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editGlobalRole, setEditGlobalRole] = useState<string>('DataCollector');

  // ================================================================
  // LOAD FUNCTIONS
  // ================================================================
  const loadOrgs = async () => {
    setOrgLoading(true);
    const { data, error } = await supabase.from('organizations').select('*').order('name');
    if (!error && data) setOrganizations(data);
    setOrgLoading(false);
  };

  const loadProjects = async () => {
    setProjLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*, organizations(name)')
      .order('reporting_year', { ascending: false });
    if (!error && data) {
      setProjects(data.map((p: any) => ({ ...p, org_name: p.organizations?.name })));
    }
    setProjLoading(false);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    // Load profiles via RPC (bypassa RLS)
    const { data: rpcProfiles, error: rpcErr } = await supabase.rpc('get_all_profiles');
    let profiles: any[] = [];
    if (!rpcErr && rpcProfiles) {
      profiles = (rpcProfiles as any[]).map((p: any) => ({
        ...p,
        global_role: p.global_role || p.role || 'DataCollector',
      }));
    } else {
      // Fallback: query diretta
      const { data: directProfiles } = await supabase.from('profiles').select('*').order('email');
      if (directProfiles) {
        profiles = directProfiles.map((p: any) => ({
          ...p,
          global_role: p.global_role || p.role || 'DataCollector',
        }));
      }
    }
    setAllUsers(profiles);
    // Load members
    const { data: mems } = await supabase
      .from('project_members')
      .select('*, profiles(email, full_name), projects(reporting_year, organization_id, organizations(name))')
      .order('project_id');
    if (mems) setMembers(mems);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (isGlobalAdmin) {
      loadOrgs();
      loadProjects();
      loadUsers();
    }
  }, [isGlobalAdmin]);

  // ================================================================
  // ORG ACTIONS
  // ================================================================
  const createOrg = async () => {
    if (!orgName.trim()) { setOrgMsg({ type: 'err', text: 'Nome obbligatorio.' }); return; }
    const { error } = await supabase.from('organizations').insert([{ name: orgName.trim(), sector: orgSector.trim() || null }]);
    if (error) { setOrgMsg({ type: 'err', text: error.message }); }
    else { setOrgMsg({ type: 'ok', text: 'Organizzazione creata.' }); setOrgName(''); setOrgSector(''); loadOrgs(); }
  };

  const deleteOrg = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa organizzazione?')) return;
    const { error } = await supabase.from('organizations').delete().eq('id', id);
    if (error) setOrgMsg({ type: 'err', text: error.message });
    else { setOrgMsg({ type: 'ok', text: 'Eliminata.' }); loadOrgs(); loadProjects(); }
  };

  // ================================================================
  // PROJECT ACTIONS
  // ================================================================
  const createProject = async () => {
    if (!projOrgId) { setProjMsg({ type: 'err', text: 'Seleziona un organizzazione.' }); return; }
    const year = parseInt(projYear);
    if (!year || year < 2020 || year > 2099) { setProjMsg({ type: 'err', text: 'Anno non valido.' }); return; }
    const { error } = await supabase.from('projects').insert([{ organization_id: projOrgId, reporting_year: year, status: 'active' }]);
    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        setProjMsg({ type: 'err', text: 'Esiste gia un progetto per quell organizzazione e anno.' });
      } else setProjMsg({ type: 'err', text: error.message });
    } else { setProjMsg({ type: 'ok', text: 'Progetto creato.' }); setProjYear(new Date().getFullYear().toString()); loadProjects(); }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo progetto?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) setProjMsg({ type: 'err', text: error.message });
    else { setProjMsg({ type: 'ok', text: 'Eliminato.' }); loadProjects(); }
  };

  // ================================================================
  // USER ACTIONS
  // ================================================================
  const updateGlobalRole = async () => {
    if (!editUserId) return;
    // Usa RPC admin_update_profile_role (bypassa RLS)
    const { error: rpcErr } = await supabase.rpc('admin_update_profile_role', {
      target_user_id: editUserId,
      new_global_role: editGlobalRole,
    });
    if (rpcErr) {
      // Fallback: query diretta
      const { error } = await supabase.from('profiles').update({ global_role: editGlobalRole }).eq('id', editUserId);
      if (error) { setUsersMsg({ type: 'err', text: error.message }); return; }
    }
    setUsersMsg({ type: 'ok', text: 'Ruolo globale aggiornato.' }); setEditUserId(null); loadUsers();
  };

  const assignUserToProject = async () => {
    if (!assignUserId || !assignProjectId || !assignRole) {
      setUsersMsg({ type: 'err', text: 'Compila tutti i campi.' }); return;
    }
    const { error } = await supabase.from('project_members').insert([{
      project_id: assignProjectId,
      user_id: assignUserId,
      role: assignRole,
    }]);
    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        setUsersMsg({ type: 'err', text: 'Utente gia assegnato a questo progetto.' });
      } else setUsersMsg({ type: 'err', text: error.message });
    } else { setUsersMsg({ type: 'ok', text: 'Utente assegnato.' }); setAssignUserId(''); setAssignProjectId(''); loadUsers(); }
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId);
    if (error) setUsersMsg({ type: 'err', text: error.message });
    else { setUsersMsg({ type: 'ok', text: 'Rimosso.' }); loadUsers(); }
  };

  if (!isGlobalAdmin) {
    return (
      <Card><CardContent className="py-12 text-center text-slate-500">Accesso riservato agli amministratori.</CardContent></Card>
    );
  }

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pannello Amministrazione</h2>
        <p className="text-sm text-slate-500 mt-1">Gestisci organizzazioni, progetti e utenti.</p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2">
        {([
          { key: 'orgs' as const, label: 'Organizzazioni', icon: Building2 },
          { key: 'projects' as const, label: 'Progetti', icon: FolderPlus },
          { key: 'users' as const, label: 'Utenti', icon: Users },
        ]).map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={activeSection === key ? 'default' : 'outline'}
            onClick={() => setActiveSection(key)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" /> {label}
          </Button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* ORGANIZZAZIONI */}
      {/* ============================================================ */}
      {activeSection === 'orgs' && (
        <div className="space-y-4">
          {/* Create */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Nuova Organizzazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1">Nome *</Label>
                  <Input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Es. Acme S.p.A." />
                </div>
                <div>
                  <Label className="text-xs mb-1">Settore</Label>
                  <Input value={orgSector} onChange={e => setOrgSector(e.target.value)} placeholder="Es. Manifattura" />
                </div>
              </div>
              <Button onClick={createOrg} className="gap-2"><Save className="h-4 w-4" /> Crea Organizzazione</Button>
              {orgMsg && (
                <p className={`text-sm flex items-center gap-1 ${orgMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {orgMsg.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {orgMsg.text}
                </p>
              )}
            </CardContent>
          </Card>

          {/* List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Organizzazioni esistenti ({organizations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {orgLoading ? <Loader2 className="animate-spin h-5 w-5 text-slate-400 mx-auto" /> : organizations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nessuna organizzazione creata.</p>
              ) : (
                <div className="space-y-2">
                  {organizations.map(org => (
                    <div key={org.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{org.name}</p>
                        {org.sector && <p className="text-xs text-slate-500">{org.sector}</p>}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0" onClick={() => deleteOrg(org.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* PROGETTI */}
      {/* ============================================================ */}
      {activeSection === 'projects' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Nuovo Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1">Organizzazione *</Label>
                  <Select value={projOrgId} onValueChange={setProjOrgId}>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {organizations.map(o => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1">Anno *</Label>
                  <Input type="number" value={projYear} onChange={e => setProjYear(e.target.value)} min={2020} max={2099} />
                </div>
              </div>
              <Button onClick={createProject} className="gap-2"><Save className="h-4 w-4" /> Crea Progetto</Button>
              {projMsg && (
                <p className={`text-sm flex items-center gap-1 ${projMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {projMsg.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {projMsg.text}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Progetti esistenti ({projects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {projLoading ? <Loader2 className="animate-spin h-5 w-5 text-slate-400 mx-auto" /> : projects.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nessun progetto creato.</p>
              ) : (
                <div className="space-y-2">
                  {projects.map(proj => (
                    <div key={proj.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-medium text-sm text-slate-900">{proj.org_name} — {proj.reporting_year}</p>
                          <Badge variant="outline" className={`text-[10px] ${proj.status === 'active' ? 'text-green-700 bg-green-50 border-green-200' : 'text-slate-500'}`}>
                            {proj.status === 'active' ? 'Attivo' : 'Archiviato'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0" onClick={() => deleteProject(proj.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================ */}
      {/* UTENTI */}
      {/* ============================================================ */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          {/* Utenti registrati */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Utenti registrati ({allUsers.length})</CardTitle>
              <CardDescription>Clicca su un utente per modificare il ruolo globale.</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? <Loader2 className="animate-spin h-5 w-5 text-slate-400 mx-auto" /> : (
                <div className="space-y-2">
                  {allUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{u.full_name || u.email}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          u.global_role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          u.global_role === 'Reviewer' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>{u.global_role}</Badge>
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => { setEditUserId(editUserId === u.id ? null : u.id); setEditGlobalRole(u.global_role); }}>
                          {editUserId === u.id ? 'Annulla' : 'Modifica'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editUserId && (
                    <div className="bg-white rounded-lg border-2 border-indigo-200 p-4 space-y-3">
                      <p className="text-sm font-medium text-slate-900">Modifica ruolo globale di: <strong>{allUsers.find(u => u.id === editUserId)?.email}</strong></p>
                      <div className="flex gap-3 items-end">
                        <div>
                          <Label className="text-xs">Ruolo globale</Label>
                          <Select value={editGlobalRole} onValueChange={setEditGlobalRole}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="DataCollector">Data Collector</SelectItem>
                              <SelectItem value="Reviewer">Reviewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button size="sm" onClick={updateGlobalRole} className="gap-1"><Save className="h-3 w-3" /> Salva</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assegnazione a progetto */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4" /> Assegna Utente a Progetto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1">Utente</Label>
                  <Select value={assignUserId} onValueChange={setAssignUserId}>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {allUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1">Progetto</Label>
                  <Select value={assignProjectId} onValueChange={setAssignProjectId}>
                    <SelectTrigger><SelectValue placeholder="Seleziona..." /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.org_name} — {p.reporting_year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1">Ruolo nel progetto</Label>
                  <Select value={assignRole} onValueChange={setAssignRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="DataCollector">Data Collector</SelectItem>
                      <SelectItem value="Reviewer">Reviewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={assignUserToProject} className="gap-2"><UserPlus className="h-4 w-4" /> Assegna</Button>
              {usersMsg && (
                <p className={`text-sm flex items-center gap-1 ${usersMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>
                  {usersMsg.type === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />} {usersMsg.text}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Membri attuali */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assegnazioni attuali ({members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Nessuna assegnazione.</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => {
                    const u = m.profiles as any;
                    const p = m.projects as any;
                    const orgName = p?.organizations?.name || '?';
                    return (
                      <div key={m.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{u?.full_name || u?.email || m.user_id}</p>
                            <p className="text-xs text-slate-500 truncate">{orgName} — {p?.reporting_year}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-7 w-7 p-0" onClick={() => removeMember(m.id)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
