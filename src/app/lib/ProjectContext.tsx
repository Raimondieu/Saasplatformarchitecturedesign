import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getSupabaseConfig } from './supabase';
import { useAuth, type UserRole } from './AuthContext';

export interface Organization { id: string; name: string; sector: string | null; created_at: string; }
export interface Project { id: string; organization_id: string; reporting_year: number; status: string; created_at: string; organization_name?: string; organization_sector?: string | null; }
export interface ProjectWithOrg extends Project { organization_name: string; organization_sector: string | null; }

interface ProjectContextType {
  currentProject: ProjectWithOrg | null;
  projectRole: UserRole | null;
  availableProjects: ProjectWithOrg[];
  loadingProjects: boolean;
  selectProject: (projectId: string) => Promise<void>;
  clearProject: () => void;
  reloadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user, session, isGlobalAdmin, globalRole } = useAuth();
  const [currentProject, setCurrentProject] = useState<ProjectWithOrg | null>(null);
  const [projectRole, setProjectRole] = useState<UserRole | null>(null);
  const [availableProjects, setAvailableProjects] = useState<ProjectWithOrg[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!user || !session) {
      setAvailableProjects([]);
      setLoadingProjects(false);
      return;
    }
    setLoadingProjects(true);

    try {
      let projects: ProjectWithOrg[] = [];
      const { url, anonKey } = getSupabaseConfig();
      const headers = {
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
        Accept: 'application/json',
      };

      if (isGlobalAdmin) {
        // REST diretto: tutti i progetti con org
        try {
          const r = await fetch(`${url}/rest/v1/projects?select=*,organizations(name,sector)&order=reporting_year.desc`, { headers });
          if (r.ok) {
            const data = await r.json();
            projects = (data || []).map((p: any) => ({
              ...p,
              organization_name: p.organizations?.name || 'Organizzazione',
              organization_sector: p.organizations?.sector || null,
            }));
          }
        } catch (_) {}

        // Fallback client
        if (projects.length === 0) {
          const { data } = await supabase.from('projects').select('*, organizations(name, sector)').order('reporting_year', { ascending: false });
          if (data) {
            projects = data.map((p: any) => ({
              ...p,
              organization_name: p.organizations?.name || 'Organizzazione',
              organization_sector: p.organizations?.sector || null,
            }));
          }
        }
      } else {
        // REST diretto: miei progetti
        try {
          const r = await fetch(`${url}/rest/v1/project_members?user_id=eq.${user.id}&select=role,project_id,projects(*,organizations(name,sector))`, { headers });
          if (r.ok) {
            const data = await r.json();
            projects = (data || []).filter((pm: any) => pm.projects).map((pm: any) => ({
              ...pm.projects,
              organization_name: pm.projects.organizations?.name || 'Organizzazione',
              organization_sector: pm.projects.organizations?.sector || null,
            }));
          }
        } catch (_) {}

        // Fallback client
        if (projects.length === 0) {
          const { data } = await supabase.from('project_members').select('role, project_id, projects(*, organizations(name, sector))').eq('user_id', user.id);
          if (data) {
            projects = data.filter((pm: any) => pm.projects).map((pm: any) => ({
              ...pm.projects,
              organization_name: pm.projects.organizations?.name || 'Organizzazione',
              organization_sector: pm.projects.organizations?.sector || null,
            }));
          }
        }
      }

      projects.sort((a, b) => {
        const c = (a.organization_name || '').localeCompare(b.organization_name || '');
        return c !== 0 ? c : b.reporting_year - a.reporting_year;
      });

      setAvailableProjects(projects);

      if (currentProject && !projects.find(p => p.id === currentProject.id)) {
        setCurrentProject(null);
        setProjectRole(null);
      }
    } catch (_) {}
    finally { setLoadingProjects(false); }
  }, [user?.id, session?.access_token, isGlobalAdmin]);

  const selectProject = async (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    if (!project) return;
    setCurrentProject(project);
    if (isGlobalAdmin) {
      setProjectRole('Admin');
    } else if (user) {
      const { data } = await supabase.from('project_members').select('role').eq('project_id', projectId).eq('user_id', user.id).single();
      setProjectRole((data?.role as UserRole) || globalRole || 'DataCollector');
    }
  };

  const clearProject = () => { setCurrentProject(null); setProjectRole(null); };

  useEffect(() => {
    if (user && session) {
      loadProjects();
    } else {
      setAvailableProjects([]);
      setCurrentProject(null);
      setProjectRole(null);
      setLoadingProjects(false);
    }
  }, [user?.id, session?.access_token, isGlobalAdmin, loadProjects]);

  return (
    <ProjectContext.Provider value={{
      currentProject, projectRole, availableProjects, loadingProjects,
      selectProject, clearProject, reloadProjects: loadProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject fuori da ProjectProvider');
  return ctx;
}
