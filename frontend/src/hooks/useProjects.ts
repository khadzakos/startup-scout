import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Project, ProjectCreateRequest, ProjectsResponse } from '../types';

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: ProjectsResponse = await apiClient.getProjects();
      setProjects(response.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData: ProjectCreateRequest): Promise<Project | null> => {
    try {
      const project = await apiClient.createProject(projectData);
      setProjects(prev => [project, ...prev]);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  };

  const updateProjectVotes = useCallback((projectId: string, upvotes: number) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, upvotes, rating: upvotes }
          : project
      )
    );
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProjectVotes,
  };
};

export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await apiClient.getProject(id);
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id, fetchProject]);

  return {
    project,
    loading,
    error,
    fetchProject,
  };
};