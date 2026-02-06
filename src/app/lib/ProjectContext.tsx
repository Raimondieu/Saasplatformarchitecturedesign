import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useAuth, type UserRole } from './AuthContext';

export interface Organization {
  id: string;
  name: string;
  sector: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  organization_id: string;
  reporting_year: number;
  status: string;
  created_at: string;
  // Joined fields
  organization_name?: string;
  organization_sector?: string | null;
}

export interface ProjectWithOrg extends Project {
  organization_name: string;
  organization_sector: string | null;
}

interface ProjectContextType {
  currentProject: ProjectWithOrg | null;
  projectRole: UserRole | null; // ruolo dell'utente nel progetto corrente
  availableProjects: ProjectWithOrg[];
  loadingProjects: boolean;
  selectProject: (projectId: string) => Promise<void>;
  clearProject: () => void;
  reloadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, isGlobalAdmin, globalRole } = useAuth();
  const [currentProject, setCurrentProject] = useState<ProjectWithOrg | null>(null);
  const [projectRole, setProjectRole] = useState<UserRole | null>(null);
  const [availableProjects, setAvailableProjects] = useState<ProjectWithOrg[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Carica i progetti disponibili per l'utente
  const loadProjects = async () => {
    if (!user) { setAvailableProjects([]); setLoadingProjects(false); return; }
    setLoadingProjects(true);

    // Safety timeout: sblocca dopo 8 secondi se la query si blocca
    const safetyTimer = setTimeout(() => {
      console.warn('Safety timeout: sblocco loadingProjects dopo 8s');
      setLoadingProjects(false);
    }, 8000);

    try {
      let projects: ProjectWithOrg[] = [];

      if (isGlobalAdmin) {
        // Admin globale: vede tutti i progetti
        const { data, error } = await supabase
          .from('projects')
          .select('*, organizations(name, sector)')
          .order('reporting_year', { ascending: false });
        console.log('Admin projects query:', { data, error });
        if (!error && data) {
          projects = data.map((p: any) => ({
            ...p,
            organization_name: p.organizations?.name || 'Organizzazione',
            organization_sector: p.organizations?.sector || null,
          }));
        }
      } else {
        // Utente normale: vede solo i progetti a cui e assegnato
        const { data, error } = await supabase
          .from('project_members')
          .select('role, project_id, projects(*, organizations(name, sector))')
          .eq('user_id', user.id);
        console.log('Member projects query:', { data, error });
        if (!error && data) {
          projects = data
            .filter((pm: any) => pm.projects)
            .map((pm: any) => ({
              ...pm.projects,
              organization_name: pm.projects.organizations?.name || 'Organizzazione',
              organization_sector: pm.projects.organizations?.sector || null,
            }));
        }
      }

      // Ordina per org name, poi per anno desc
      projects.sort((a, b) => {
        const orgCmp = (a.organization_name || '').localeCompare(b.organization_name || '');
        if (orgCmp !== 0) return orgCmp;
        return b.reporting_year - a.reporting_year;
      });

      setAvailableProjects(projects);

      // Se c'era un progetto selezionato, verifica che sia ancora disponibile
      if (currentProject) {
        const stillAvailable = projects.find(p => p.id === currentProject.id);
        if (!stillAvailable) { setCurrentProject(null); setProjectRole(null); }
      }
    } catch (err) {
      console.error('Errore caricamento progetti:', err);
    } finally {
      clearTimeout(safetyTimer);
      setLoadingProjects(false);
    }
  };

  // Seleziona un progetto
  const selectProject = async (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    if (!project) return;

    setCurrentProject(project);

    // Determina il ruolo nel progetto
    if (isGlobalAdmin) {
      setProjectRole('Admin');
    } else if (user) {
      const { data } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
      setProjectRole((data?.role as UserRole) || globalRole || 'DataCollector');
    }
  };

  const clearProject = () => {
    setCurrentProject(null);
    setProjectRole(null);
  };

  // Ricarica quando l'utente cambia
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setAvailableProjects([]);
      setCurrentProject(null);
      setProjectRole(null);
      setLoadingProjects(false);
    }
  }, [user?.id, isGlobalAdmin]);

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projectRole,
      availableProjects,
      loadingProjects,
      selectProject,
      clearProject,
      reloadProjects: loadProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject deve essere usato dentro un <ProjectProvider>');
  return context;
}
