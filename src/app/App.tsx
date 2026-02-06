import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { DatabaseSchema } from './components/DatabaseSchema';
import { UserJourney } from './components/UserJourney';
import { APIStrategy } from './components/APIStrategy';
import { LiveDemo } from './components/LiveDemo';
import { LoginPage } from './components/LoginPage';
import { ProjectPicker } from './components/ProjectPicker';
import { AdminPanel } from './components/AdminPanel';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ProjectProvider, useProject } from './lib/ProjectContext';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { FileText, Database, GitBranch, Workflow, Code, LogOut, Loader2, User, Building2, Calendar, ArrowLeft, Settings } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  Admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  DataCollector: { label: 'Data Collector', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  Reviewer: { label: 'Reviewer', color: 'bg-green-100 text-green-700 border-green-200' },
};

function AppContent() {
  const { user, profile, globalRole, isGlobalAdmin, loading, signOut } = useAuth();
  const { currentProject, projectRole, clearProject } = useProject();
  const [activeTab, setActiveTab] = useState('demo');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto" />
          <p className="text-slate-500 text-sm">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Pannello Admin (schermata separata)
  if (showAdminPanel && isGlobalAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setShowAdminPanel(false)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Torna ai Progetti
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">{profile?.full_name || user.email}</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600" onClick={signOut} title="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AdminPanel />
        </div>
      </div>
    );
  }

  // Selezione progetto se nessun progetto corrente
  if (!currentProject) {
    return <ProjectPicker onAdminPanel={isGlobalAdmin ? () => setShowAdminPanel(true) : undefined} />;
  }

  // Ruolo nel progetto corrente
  const displayRole = projectRole || globalRole || 'DataCollector';
  const roleInfo = ROLE_LABELS[displayRole] || ROLE_LABELS.DataCollector;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: project info */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearProject}
                className="gap-1.5 text-slate-500 hover:text-slate-900"
                title="Cambia progetto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <h1 className="text-lg font-semibold text-slate-900">{currentProject.organization_name}</h1>
                  <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 gap-1">
                    <Calendar className="h-3 w-3" />
                    {currentProject.reporting_year}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">ESRS Compliance Platform</p>
              </div>
            </div>

            {/* Right: user info */}
            <div className="flex items-center gap-3">
              {isGlobalAdmin && (
                <Button variant="outline" size="sm" onClick={() => { clearProject(); setShowAdminPanel(true); }} className="gap-1.5 text-xs hidden sm:flex">
                  <Settings className="h-3 w-3" /> Admin
                </Button>
              )}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700 truncate max-w-[140px]">
                    {profile?.full_name || user.email}
                  </p>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleInfo.color}`}>
                    {roleInfo.label}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={signOut} title="Esci">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Architecture</span>
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Database Schema</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">API Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="journey" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">User Journey</span>
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">Live Demo</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6"><ArchitectureOverview /></TabsContent>
          <TabsContent value="database" className="mt-6"><DatabaseSchema /></TabsContent>
          <TabsContent value="api" className="mt-6"><APIStrategy /></TabsContent>
          <TabsContent value="journey" className="mt-6"><UserJourney /></TabsContent>
          <TabsContent value="demo" className="mt-6"><LiveDemo /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <AppContent />
      </ProjectProvider>
    </AuthProvider>
  );
}
