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
} from "@/types";

// Pure API service without any caching or local storage
class APIService {
  private baseURL = "/api/v1";

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      // Clone the response to avoid "body stream already read" error
      const responseClone = response.clone();
      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try with the cloned response
        try {
          data = await responseClone.json();
        } catch (cloneError) {
          // If both fail, it might be an empty response or non-JSON
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data.data || data; // Return the data directly
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return this.request<Device[]>("/devices");
  }

  async getDevice(id: string): Promise<Device> {
    return this.request<Device>(`/devices/${id}`);
  }

  async createDevice(data: Partial<Device>): Promise<Device> {
    return this.request<Device>("/devices", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDevice(id: string, data: Partial<Device>): Promise<Device> {
    return this.request<Device>(`/devices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteDevice(id: string): Promise<void> {
    return this.request<void>(`/devices/${id}`, {
      method: "DELETE",
    });
  }

  // Problems
  async getProblems(deviceId?: string): Promise<Problem[]> {
    const url = deviceId ? `/problems?deviceId=${deviceId}` : "/problems";
    return this.request<Problem[]>(url);
  }

  async getProblem(id: string): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`);
  }

  async createProblem(data: Partial<Problem>): Promise<Problem> {
    return this.request<Problem>("/problems", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProblem(id: string, data: Partial<Problem>): Promise<Problem> {
    return this.request<Problem>(`/problems/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProblem(id: string): Promise<void> {
    return this.request<void>(`/problems/${id}`, {
      method: "DELETE",
    });
  }

  // Steps
  async getSteps(problemId?: string): Promise<Step[]> {
    const url = problemId ? `/steps?problemId=${problemId}` : "/steps";
    return this.request<Step[]>(url);
  }

  async getStep(id: string): Promise<Step> {
    return this.request<Step>(`/steps/${id}`);
  }

  async createStep(data: Partial<Step>): Promise<Step> {
    return this.request<Step>("/steps", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStep(id: string, data: Partial<Step>): Promise<Step> {
    return this.request<Step>(`/steps/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteStep(id: string): Promise<void> {
    return this.request<void>(`/steps/${id}`, {
      method: "DELETE",
    });
  }

  // Remotes (not implemented in backend yet)
  async getRemotes(): Promise<Remote[]> {
    console.warn('Remotes endpoint not implemented in backend');
    return [];
  }

  async getRemote(id: string): Promise<Remote> {
    console.warn('Remotes endpoint not implemented in backend');
    throw new Error('Remotes endpoint not implemented');
  }

  async createRemote(data: Partial<Remote>): Promise<Remote> {
    console.warn('Remotes endpoint not implemented in backend');
    throw new Error('Remotes endpoint not implemented');
  }

  async updateRemote(id: string, data: Partial<Remote>): Promise<Remote> {
    console.warn('Remotes endpoint not implemented in backend');
    throw new Error('Remotes endpoint not implemented');
  }

  async deleteRemote(id: string): Promise<void> {
    console.warn('Remotes endpoint not implemented in backend');
    throw new Error('Remotes endpoint not implemented');
  }

  // TV Interfaces
  async getTVInterfaces(): Promise<any[]> {
    return this.request<any[]>("/tv-interfaces");
  }

  async getTVInterface(id: string): Promise<any> {
    return this.request<any>(`/tv-interfaces/${id}`);
  }

  // Sessions
  async getSessions(): Promise<DiagnosticSession[]> {
    return this.request<DiagnosticSession[]>("/sessions");
  }

  async createSession(data: Partial<DiagnosticSession>): Promise<DiagnosticSession> {
    return this.request<DiagnosticSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Settings (not implemented in backend yet)
  async getSettings(): Promise<SiteSettings> {
    console.warn('Settings endpoint not implemented in backend');
    return {
      siteName: 'ANT Support',
      siteDescription: 'Система диагностики ТВ приставок',
      version: '1.0.0',
      maintenanceMode: false,
      debugMode: false,
    } as SiteSettings;
  }

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    console.warn('Settings endpoint not implemented in backend');
    throw new Error('Settings endpoint not implemented');
  }
}

// Context interface
interface ApiContextType {
  api: APIService;
  loading: boolean;
  error: string | null;
  
  // Loading states for individual operations
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new APIService();

  const value: ApiContextType = {
    api,
    loading,
    error,
    setLoading,
    setError,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

// Hook to use the context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

// Compatibility hook for existing components
export const useData = () => {
  const { api, loading, setLoading, setError } = useApi();

  // State to hold loaded data for the old interface compatibility
  const [devices, setDevices] = useState<Device[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [remotes, setRemotes] = useState<Remote[]>([]);
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Helper functions that mimic the old DataContext interface
  const getActiveDevices = useCallback((): Device[] => {
    return devices.filter(d => d.isActive);
  }, [devices]);

  const getProblemsForDevice = useCallback((deviceId: string): Problem[] => {
    return problems.filter(p => p.deviceId === deviceId && p.isActive);
  }, [problems]);

  const getStepsForProblem = useCallback((problemId: string): Step[] => {
    return steps
      .filter(s => s.problemId === problemId && s.isActive)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }, [steps]);

  const getDeviceById = useCallback((id: string): Device | undefined => {
    return devices.find(d => d.id === id);
  }, [devices]);

  const getProblemById = useCallback((id: string): Problem | undefined => {
    return problems.find(p => p.id === id);
  }, [problems]);

  const getStepById = useCallback((id: string): Step | undefined => {
    return steps.find(s => s.id === id);
  }, [steps]);

  const getRemoteById = useCallback((id: string): Remote | undefined => {
    return remotes.find(r => r.id === id);
  }, [remotes]);

  const getActiveRemotes = useCallback((): Remote[] => {
    return remotes.filter(r => r.isActive);
  }, [remotes]);

  const getActiveSessions = useCallback((): DiagnosticSession[] => {
    return sessions.filter(s => s.isActive && !s.endTime);
  }, [sessions]);

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

  // Load functions
  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const deviceData = await api.getDevices();
      setDevices(deviceData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadProblems = useCallback(async () => {
    try {
      setLoading(true);
      const problemData = await api.getProblems();
      setProblems(problemData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadSteps = useCallback(async () => {
    try {
      setLoading(true);
      const stepData = await api.getSteps();
      setSteps(stepData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadRemotes = useCallback(async () => {
    try {
      setLoading(true);
      // Backend doesn't have remotes endpoint yet, use empty array
      console.warn('Remotes endpoint not implemented in backend, using empty array');
      setRemotes([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setRemotes([]);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const sessionData = await api.getSessions();
      setSessions(sessionData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadSiteSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Backend doesn't have settings endpoint yet, use default settings
      console.warn('Settings endpoint not implemented in backend, using default settings');
      setSiteSettings({
        siteName: 'ANT Support',
        siteDescription: 'Си��тема диагностики ТВ приставок',
        version: '1.0.0',
        maintenanceMode: false,
        debugMode: false,
      } as SiteSettings);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
      setSiteSettings(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([
      loadDevices(),
      loadProblems(),
      loadSteps(),
      loadRemotes(),
      loadSessions(),
      loadSiteSettings(),
    ]);
  }, [loadDevices, loadProblems, loadSteps, loadRemotes, loadSessions, loadSiteSettings]);

  // Export data function
  const exportData = useCallback(async (options: any) => {
    // Mock export functionality - would need to be implemented based on backend
    const data = {
      devices,
      problems,
      steps,
      remotes,
      sessions,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    return {
      downloadUrl: url,
      data: data
    };
  }, [devices, problems, steps, remotes, sessions]);

  // Refresh data function (alias for refreshAllData)
  const refreshData = useCallback(async () => {
    await refreshAllData();
  }, [refreshAllData]);

  // Load initial data
  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    api,
    loading: { devices: loading, problems: loading, steps: loading, remotes: loading, stepActions: loading, sessions: loading, changeLogs: loading, siteSettings: loading },
    errors: { devices: null, problems: null, steps: null, remotes: null, stepActions: null, sessions: null, changeLogs: null, siteSettings: null },
    devices,
    problems,
    steps,
    remotes,
    stepActions: [],
    sessions,
    changeLogs,
    siteSettings,

    // API methods
    getActiveDevices,
    getProblemsForDevice,
    getStepsForProblem,
    getDeviceById,
    getProblemById,
    getStepById,
    getRemoteById,
    getActiveRemotes,
    getActiveSessions,

    // CRUD operations
    createDevice: api.createDevice.bind(api),
    updateDevice: api.updateDevice.bind(api),
    deleteDevice: api.deleteDevice.bind(api),
    createProblem: api.createProblem.bind(api),
    updateProblem: api.updateProblem.bind(api),
    deleteProblem: api.deleteProblem.bind(api),
    createStep: api.createStep.bind(api),
    updateStep: api.updateStep.bind(api),
    deleteStep: api.deleteStep.bind(api),
    createRemote: api.createRemote.bind(api),
    updateRemote: api.updateRemote.bind(api),
    deleteRemote: api.deleteRemote.bind(api),

    // Utility functions
    getEntityStats,
    clearAllData: () => {
      setDevices([]);
      setProblems([]);
      setSteps([]);
      setRemotes([]);
      setSessions([]);
      setChangeLogs([]);
      setSiteSettings(null);
    },
    refreshAllData,
    refreshData,
    exportData,
    loadDevices,
    loadProblems,
    loadSteps,
    loadRemotes,
    loadStepActions: async () => {},
    loadSessions,
    loadSiteSettings,
  };
};

export default ApiContext;
