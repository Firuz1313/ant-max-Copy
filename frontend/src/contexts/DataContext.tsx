import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  Device,
  Problem,
  Step,
  Remote,
  StepAction,
  DiagnosticSession,
  ChangeLog,
  SiteSettings,
  APIResponse,
  PaginatedResponse,
  FilterOptions,
  SearchResults,
  ExportOptions,
  ImportResult,
} from "@/types";

// API Service
class APIService {
  private baseURL = "/api/v1";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async getAll<T>(
    entity: string,
    filters?: FilterOptions,
  ): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<T[]>(`/${entity}${query}`);
  }

  async getById<T>(entity: string, id: string): Promise<APIResponse<T>> {
    return this.request<T>(`/${entity}/${id}`);
  }

  async create<T>(entity: string, data: Partial<T>): Promise<APIResponse<T>> {
    return this.request<T>(`/${entity}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async update<T>(
    entity: string,
    id: string,
    data: Partial<T>,
  ): Promise<APIResponse<T>> {
    return this.request<T>(`/${entity}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(entity: string, id: string): Promise<APIResponse<void>> {
    return this.request<void>(`/${entity}/${id}`, {
      method: "DELETE",
    });
  }

  async search<T>(
    entity: string,
    searchTerm: string,
    filters?: FilterOptions,
  ): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams({ search: searchTerm });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request<T[]>(`/${entity}/search?${params.toString()}`);
  }

  async getStats(entity: string): Promise<APIResponse<any>> {
    return this.request<any>(`/${entity}/stats`);
  }

  async export(entity: string, options?: ExportOptions): Promise<APIResponse<any>> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return this.request<any>(`/${entity}/export${query}`);
  }
}

// Context interface
interface DataContextType {
  // API service
  api: APIService;

  // Loading states
  loading: {
    devices: boolean;
    problems: boolean;
    steps: boolean;
    remotes: boolean;
    stepActions: boolean;
    sessions: boolean;
    changeLogs: boolean;
    siteSettings: boolean;
  };

  // Error states
  errors: {
    devices: string | null;
    problems: string | null;
    steps: string | null;
    remotes: string | null;
    stepActions: string | null;
    sessions: string | null;
    changeLogs: string | null;
    siteSettings: string | null;
  };

  // Data states
  devices: Device[];
  problems: Problem[];
  steps: Step[];
  remotes: Remote[];
  stepActions: StepAction[];
  sessions: DiagnosticSession[];
  changeLogs: ChangeLog[];
  siteSettings: SiteSettings | null;

  // Data actions
  loadDevices: (filters?: FilterOptions) => Promise<void>;
  loadProblems: (filters?: FilterOptions) => Promise<void>;
  loadSteps: (filters?: FilterOptions) => Promise<void>;
  loadRemotes: (filters?: FilterOptions) => Promise<void>;
  loadStepActions: (filters?: FilterOptions) => Promise<void>;
  loadSessions: (filters?: FilterOptions) => Promise<void>;
  loadSiteSettings: () => Promise<void>;

  // CRUD operations
  createDevice: (data: Partial<Device>) => Promise<Device>;
  updateDevice: (id: string, data: Partial<Device>) => Promise<Device>;
  deleteDevice: (id: string) => Promise<void>;

  createProblem: (data: Partial<Problem>) => Promise<Problem>;
  updateProblem: (id: string, data: Partial<Problem>) => Promise<Problem>;
  deleteProblem: (id: string) => Promise<void>;

  createStep: (data: Partial<Step>) => Promise<Step>;
  updateStep: (id: string, data: Partial<Step>) => Promise<Step>;
  deleteStep: (id: string) => Promise<void>;

  createRemote: (data: Partial<Remote>) => Promise<Remote>;
  updateRemote: (id: string, data: Partial<Remote>) => Promise<Remote>;
  deleteRemote: (id: string) => Promise<void>;

  // Relationship queries
  getActiveDevices: () => Device[];
  getProblemsForDevice: (deviceId: string) => Problem[];
  getStepsForProblem: (problemId: string) => Step[];
  getDeviceById: (id: string) => Device | undefined;
  getProblemById: (id: string) => Problem | undefined;
  getStepById: (id: string) => Step | undefined;
  getRemoteById: (id: string) => Remote | undefined;

  // Statistics and analytics
  getEntityStats: (entity: string) => { total: number; active: number };
  getActiveSessions: () => DiagnosticSession[];

  // Utility functions
  clearAllData: () => void;
  refreshAllData: () => Promise<void>;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // API service
  const api = new APIService();

  // Loading states
  const [loading, setLoading] = useState({
    devices: false,
    problems: false,
    steps: false,
    remotes: false,
    stepActions: false,
    sessions: false,
    changeLogs: false,
    siteSettings: false,
  });

  // Error states
  const [errors, setErrors] = useState({
    devices: null as string | null,
    problems: null as string | null,
    steps: null as string | null,
    remotes: null as string | null,
    stepActions: null as string | null,
    sessions: null as string | null,
    changeLogs: null as string | null,
    siteSettings: null as string | null,
  });

  // Data states
  const [devices, setDevices] = useState<Device[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [stepActions, setStepActions] = useState<StepAction[]>([]);
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Helper function to handle API errors
  const handleError = (entity: string, error: Error) => {
    console.error(`Error loading ${entity}:`, error);
    setErrors(prev => ({ ...prev, [entity]: error.message }));
  };

  // Data loading functions
  const loadDevices = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, devices: true }));
      setErrors(prev => ({ ...prev, devices: null }));
      
      const response = await api.getAll<Device>("devices", filters);
      setDevices(response.data || []);
    } catch (error) {
      handleError("devices", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, devices: false }));
    }
  }, [api]);

  const loadProblems = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, problems: true }));
      setErrors(prev => ({ ...prev, problems: null }));
      
      const response = await api.getAll<Problem>("problems", filters);
      setProblems(response.data || []);
    } catch (error) {
      handleError("problems", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, problems: false }));
    }
  }, [api]);

  const loadSteps = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, steps: true }));
      setErrors(prev => ({ ...prev, steps: null }));
      
      const response = await api.getAll<Step>("steps", filters);
      setSteps(response.data || []);
    } catch (error) {
      handleError("steps", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, steps: false }));
    }
  }, [api]);

  const loadRemotes = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, remotes: true }));
      setErrors(prev => ({ ...prev, remotes: null }));
      
      const response = await api.getAll<Remote>("remotes", filters);
      setRemotes(response.data || []);
    } catch (error) {
      handleError("remotes", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, remotes: false }));
    }
  }, [api]);

  const loadStepActions = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, stepActions: true }));
      setErrors(prev => ({ ...prev, stepActions: null }));
      
      const response = await api.getAll<StepAction>("step-actions", filters);
      setStepActions(response.data || []);
    } catch (error) {
      handleError("stepActions", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, stepActions: false }));
    }
  }, [api]);

  const loadSessions = useCallback(async (filters?: FilterOptions) => {
    try {
      setLoading(prev => ({ ...prev, sessions: true }));
      setErrors(prev => ({ ...prev, sessions: null }));
      
      const response = await api.getAll<DiagnosticSession>("sessions", filters);
      setSessions(response.data || []);
    } catch (error) {
      handleError("sessions", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, sessions: false }));
    }
  }, [api]);

  const loadSiteSettings = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, siteSettings: true }));
      setErrors(prev => ({ ...prev, siteSettings: null }));
      
      const response = await api.getById<SiteSettings>("settings", "settings");
      setSiteSettings(response.data);
    } catch (error) {
      handleError("siteSettings", error as Error);
    } finally {
      setLoading(prev => ({ ...prev, siteSettings: false }));
    }
  }, [api]);

  // CRUD operations
  const createDevice = useCallback(async (data: Partial<Device>): Promise<Device> => {
    const response = await api.create<Device>("devices", data);
    const newDevice = response.data;
    setDevices(prev => [...prev, newDevice]);
    return newDevice;
  }, [api]);

  const updateDevice = useCallback(async (id: string, data: Partial<Device>): Promise<Device> => {
    const response = await api.update<Device>("devices", id, data);
    const updatedDevice = response.data;
    setDevices(prev => prev.map(device => device.id === id ? updatedDevice : device));
    return updatedDevice;
  }, [api]);

  const deleteDevice = useCallback(async (id: string): Promise<void> => {
    await api.delete("devices", id);
    setDevices(prev => prev.filter(device => device.id !== id));
  }, [api]);

  const createProblem = useCallback(async (data: Partial<Problem>): Promise<Problem> => {
    const response = await api.create<Problem>("problems", data);
    const newProblem = response.data;
    setProblems(prev => [...prev, newProblem]);
    return newProblem;
  }, [api]);

  const updateProblem = useCallback(async (id: string, data: Partial<Problem>): Promise<Problem> => {
    const response = await api.update<Problem>("problems", id, data);
    const updatedProblem = response.data;
    setProblems(prev => prev.map(problem => problem.id === id ? updatedProblem : problem));
    return updatedProblem;
  }, [api]);

  const deleteProblem = useCallback(async (id: string): Promise<void> => {
    await api.delete("problems", id);
    setProblems(prev => prev.filter(problem => problem.id !== id));
  }, [api]);

  const createStep = useCallback(async (data: Partial<Step>): Promise<Step> => {
    const response = await api.create<Step>("steps", data);
    const newStep = response.data;
    setSteps(prev => [...prev, newStep]);
    return newStep;
  }, [api]);

  const updateStep = useCallback(async (id: string, data: Partial<Step>): Promise<Step> => {
    const response = await api.update<Step>("steps", id, data);
    const updatedStep = response.data;
    setSteps(prev => prev.map(step => step.id === id ? updatedStep : step));
    return updatedStep;
  }, [api]);

  const deleteStep = useCallback(async (id: string): Promise<void> => {
    await api.delete("steps", id);
    setSteps(prev => prev.filter(step => step.id !== id));
  }, [api]);

  const createRemote = useCallback(async (data: Partial<Remote>): Promise<Remote> => {
    const response = await api.create<Remote>("remotes", data);
    const newRemote = response.data;
    setRemotes(prev => [...prev, newRemote]);
    return newRemote;
  }, [api]);

  const updateRemote = useCallback(async (id: string, data: Partial<Remote>): Promise<Remote> => {
    const response = await api.update<Remote>("remotes", id, data);
    const updatedRemote = response.data;
    setRemotes(prev => prev.map(remote => remote.id === id ? updatedRemote : remote));
    return updatedRemote;
  }, [api]);

  const deleteRemote = useCallback(async (id: string): Promise<void> => {
    await api.delete("remotes", id);
    setRemotes(prev => prev.filter(remote => remote.id !== id));
  }, [api]);

  // Relationship queries
  const getActiveDevices = useCallback((): Device[] => {
    return devices.filter((d) => d.isActive);
  }, [devices]);

  const getProblemsForDevice = useCallback((deviceId: string): Problem[] => {
    return problems.filter((p) => p.deviceId === deviceId && p.isActive);
  }, [problems]);

  const getStepsForProblem = useCallback((problemId: string): Step[] => {
    return steps
      .filter((s) => s.problemId === problemId && s.isActive)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }, [steps]);

  const getDeviceById = useCallback((id: string): Device | undefined => {
    return devices.find((d) => d.id === id);
  }, [devices]);

  const getProblemById = useCallback((id: string): Problem | undefined => {
    return problems.find((p) => p.id === id);
  }, [problems]);

  const getStepById = useCallback((id: string): Step | undefined => {
    return steps.find((s) => s.id === id);
  }, [steps]);

  const getRemoteById = useCallback((id: string): Remote | undefined => {
    return remotes.find((r) => r.id === id);
  }, [remotes]);

  // Statistics and analytics
  const getEntityStats = useCallback((entity: string) => {
    let data: any[] = [];
    switch (entity) {
      case "devices":
        data = devices;
        break;
      case "problems":
        data = problems;
        break;
      case "steps":
        data = steps;
        break;
      case "remotes":
        data = remotes;
        break;
      default:
        data = [];
    }

    return {
      total: data.length,
      active: data.filter((item) => item.isActive).length,
    };
  }, [devices, problems, steps, remotes]);

  const getActiveSessions = useCallback((): DiagnosticSession[] => {
    return sessions.filter((s) => s.isActive && !s.endTime);
  }, [sessions]);

  // Utility functions
  const clearAllData = useCallback(() => {
    setDevices([]);
    setProblems([]);
    setSteps([]);
    setRemotes([]);
    setStepActions([]);
    setSessions([]);
    setChangeLogs([]);
    setSiteSettings(null);
  }, []);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadDevices(),
      loadProblems(),
      loadSteps(),
      loadRemotes(),
      loadStepActions(),
      loadSessions(),
      loadSiteSettings(),
    ]);
  }, [loadDevices, loadProblems, loadSteps, loadRemotes, loadStepActions, loadSessions, loadSiteSettings]);

  // Load initial data
  useEffect(() => {
    refreshAllData();
  }, []);

  const value: DataContextType = {
    api,
    loading,
    errors,
    devices,
    problems,
    steps,
    remotes,
    stepActions,
    sessions,
    changeLogs,
    siteSettings,
    loadDevices,
    loadProblems,
    loadSteps,
    loadRemotes,
    loadStepActions,
    loadSessions,
    loadSiteSettings,
    createDevice,
    updateDevice,
    deleteDevice,
    createProblem,
    updateProblem,
    deleteProblem,
    createStep,
    updateStep,
    deleteStep,
    createRemote,
    updateRemote,
    deleteRemote,
    getActiveDevices,
    getProblemsForDevice,
    getStepsForProblem,
    getDeviceById,
    getProblemById,
    getStepById,
    getRemoteById,
    getEntityStats,
    getActiveSessions,
    clearAllData,
    refreshAllData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export default DataContext;
