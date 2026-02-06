import React from 'react';
import { useProject, type ProjectWithOrg } from '../lib/ProjectContext';
import { useAuth } from '../lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Loader2, Building2, Calendar, FolderOpen, Settings, LogOut } from 'lucide-react';

interface ProjectPickerProps {
  onAdminPanel?: () => void;
}

export function ProjectPicker({ onAdminPanel }: ProjectPickerProps) {
  const { isGlobalAdmin, profile, user, signOut } = useAuth();
  const { availableProjects, loadingProjects, selectProject } = useProject();

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto" />
          <p className="text-slate-500 text-sm">Caricamento progetti...</p>
        </div>
      </div>
    );
  }

  // Raggruppa per organizzazione
  const groupedByOrg: Record<string, { orgName: string; orgSector: string | null; projects: ProjectWithOrg[] }> = {};
  for (const p of availableProjects) {
    const key = p.organization_id;
    if (!groupedByOrg[key]) {
      groupedByOrg[key] = { orgName: p.organization_name, orgSector: p.organization_sector, projects: [] };
    }
    groupedByOrg[key].projects.push(p);
  }
  const orgEntries = Object.entries(groupedByOrg);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ESRS Compliance Platform</h1>
          <p className="text-slate-500 mt-2">
            Benvenuto, <strong>{profile?.full_name || profile?.email || user?.email || 'Utente'}</strong>.
            {profile?.global_role && <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded">{profile.global_role}</span>}
          </p>
          <p className="text-slate-400 text-sm mt-1">Seleziona un progetto di rendicontazione.</p>
          <Button variant="ghost" size="sm" onClick={signOut} className="mt-2 text-slate-400 hover:text-red-600 gap-1">
            <LogOut className="h-3.5 w-3.5" /> Esci
          </Button>
        </div>

        {/* Admin actions */}
        {isGlobalAdmin && onAdminPanel && (
          <div className="flex justify-center mb-8">
            <Button variant="outline" onClick={onAdminPanel} className="gap-2">
              <Settings className="h-4 w-4" />
              Pannello Amministrazione
            </Button>
          </div>
        )}

        {/* Nessun progetto */}
        {orgEntries.length === 0 && (
          <Card className="text-center">
            <CardContent className="py-12">
              <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-2">Nessun progetto disponibile.</p>
              {isGlobalAdmin ? (
                <p className="text-sm text-slate-400">Vai al Pannello Amministrazione per creare organizzazioni e progetti.</p>
              ) : (
                <p className="text-sm text-slate-400">Contatta un amministratore per essere assegnato a un progetto.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Lista progetti raggruppati per organizzazione */}
        <div className="space-y-8">
          {orgEntries.map(([orgId, { orgName, orgSector, projects }]) => (
            <div key={orgId}>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-indigo-100 p-2">
                  <Building2 className="h-5 w-5 text-indigo-700" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{orgName}</h2>
                  {orgSector && <p className="text-xs text-slate-500">{orgSector}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/30"
                    onClick={() => selectProject(project.id)}
                  >
                    <CardContent className="pt-6 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-indigo-600" />
                          <span className="text-2xl font-bold text-slate-900">{project.reporting_year}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={project.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-slate-50 text-slate-500'
                          }
                        >
                          {project.status === 'active' ? 'Attivo' : 'Archiviato'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{orgName}</p>
                      <p className="text-xs text-slate-400 mt-2">Clicca per aprire</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
