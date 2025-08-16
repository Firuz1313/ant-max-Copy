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
import { apiClient } from "@/api/client";

// Use unified API client instead of custom APIService
class APIService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const method = (options.method || "GET") as string;
      const body = options.body
        ? JSON.parse(options.body as string)
        : undefined;

      let response: any;
      switch (method.toUpperCase()) {
        case "GET":
          response = await apiClient.get<any>(endpoint);
          break;
        case "POST":
          response = await apiClient.post<any>(endpoint, body);
          break;
        case "PUT":
          response = await apiClient.put<any>(endpoint, body);
          break;
        case "PATCH":
          response = await apiClient.patch<any>(endpoint, body);
          break;
        case "DELETE":
          response = await apiClient.delete<any>(endpoint);
          break;
        default:
          response = await apiClient.get<any>(endpoint);
      }

      // Handle backend response format: { success: true, data: [...] }
      if (response && typeof response === "object" && "success" in response) {
        return response.data || response;
      }

      return response;
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

  async reorderSteps(problemId: string, stepIds: string[]): Promise<Step[]> {
    const response = await this.request<{ data: Step[] }>("/steps/reorder", {
      method: "PUT",
      body: JSON.stringify({ problem_id: problemId, step_ids: stepIds }),
    });
    return response.data;
  }

  // Remotes
  async getRemotes(): Promise<Remote[]> {
    const response = await this.request<{ data: Remote[] }>("/remotes");
    return response.data || [];
  }

  async getRemote(id: string): Promise<Remote> {
    const response = await this.request<{ data: Remote }>(`/remotes/${id}`);
    return response.data;
  }

  async createRemote(data: Partial<Remote>): Promise<Remote> {
    const response = await this.request<{ data: Remote }>("/remotes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateRemote(id: string, data: Partial<Remote>): Promise<Remote> {
    const response = await this.request<{ data: Remote }>(`/remotes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteRemote(id: string): Promise<void> {
    await this.request<void>(`/remotes/${id}`, {
      method: "DELETE",
    });
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

  async createSession(
    data: Partial<DiagnosticSession>,
  ): Promise<DiagnosticSession> {
    return this.request<DiagnosticSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUsers(filters?: any): Promise<any[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : "";
    const url = queryParams ? `/users?${queryParams}` : "/users";
    const response = await this.request<{ data: any[] }>(url);
    return response.data || [];
  }

  async getUser(id: string): Promise<any> {
    const response = await this.request<{ data: any }>(`/users/${id}`);
    return response.data;
  }

  async createUser(data: any): Promise<any> {
    const response = await this.request<{ data: any }>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateUser(id: string, data: any): Promise<any> {
    const response = await this.request<{ data: any }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.request<void>(`/users/${id}`, {
      method: "DELETE",
    });
  }

  async searchUsers(query: string, filters?: any): Promise<any[]> {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await this.request<{ data: any[] }>(
      `/users/search?${params}`,
    );
    return response.data || [];
  }

  async getUserStats(): Promise<any> {
    const response = await this.request<{ data: any }>("/users/stats");
    return response.data;
  }

  // Remotes
  async getRemotes(filters?: any): Promise<Remote[]> {
    const queryParams = filters ? new URLSearchParams(filters).toString() : "";
    const url = queryParams ? `/remotes?${queryParams}` : "/remotes";
    const response = await this.request<{ data: Remote[] }>(url);
    return response.data || [];
  }

  async getRemote(id: string): Promise<Remote> {
    const response = await this.request<{ data: Remote }>(`/remotes/${id}`);
    return response.data;
  }

  async getRemotesByDevice(deviceId: string): Promise<Remote[]> {
    const response = await this.request<{ data: Remote[] }>(
      `/remotes/device/${deviceId}`,
    );
    return response.data || [];
  }

  async getDefaultRemoteForDevice(deviceId: string): Promise<Remote | null> {
    try {
      const response = await this.request<{ data: Remote }>(
        `/remotes/device/${deviceId}/default`,
      );
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createRemote(data: Partial<Remote>): Promise<Remote> {
    const response = await this.request<{ data: Remote }>("/remotes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateRemote(id: string, data: Partial<Remote>): Promise<Remote> {
    const response = await this.request<{ data: Remote }>(`/remotes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteRemote(id: string): Promise<void> {
    await this.request<void>(`/remotes/${id}`, {
      method: "DELETE",
    });
  }

  async duplicateRemote(id: string, newName?: string): Promise<Remote> {
    const response = await this.request<{ data: Remote }>(
      `/remotes/${id}/duplicate`,
      {
        method: "POST",
        body: JSON.stringify({ name: newName }),
      },
    );
    return response.data;
  }

  async searchRemotes(query: string, filters?: any): Promise<Remote[]> {
    const params = new URLSearchParams({ q: query, ...filters });
    const response = await this.request<{ data: Remote[] }>(
      `/remotes/search?${params}`,
    );
    return response.data || [];
  }

  async getRemoteStats(): Promise<any> {
    const response = await this.request<{ data: any }>("/remotes/stats");
    return response.data;
  }

  async getPopularRemotes(limit = 10): Promise<Remote[]> {
    const response = await this.request<{ data: Remote[] }>(
      `/remotes/popular?limit=${limit}`,
    );
    return response.data || [];
  }

  async updateRemoteUsage(id: string): Promise<void> {
    await this.request<void>(`/remotes/${id}/usage`, {
      method: "POST",
    });
  }

  // Settings (not implemented in backend yet)
  async getSettings(): Promise<SiteSettings> {
    console.warn("Settings endpoint not implemented in backend");
    return {
      siteName: "ANT Support",
      siteDescription: "Система диагностики ТВ приставок",
      version: "1.0.0",
      maintenanceMode: false,
      debugMode: false,
    } as SiteSettings;
  }

  async updateSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    console.warn("Settings endpoint not implemented in backend");
    throw new Error("Settings endpoint not implemented");
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

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log("Checking database status...");
        const statusResponse = await apiClient.get("/init/status");

        if (statusResponse.success && statusResponse.connected) {
          const hasData = Object.values(statusResponse.stats).some(
            (count: any) => typeof count === "number" && count > 0,
          );

          if (!hasData) {
            console.log("Database is empty, initializing...");
            await apiClient.post("/init/init");
            console.log("Database initialized with sample data");
          } else {
            console.log(
              "Database already contains data:",
              statusResponse.stats,
            );
          }
        }
      } catch (error) {
        console.warn("Database initialization check failed:", error);
      }
    };

    initializeDatabase();
  }, []);

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
    return devices.filter((d) => d.isActive);
  }, [devices]);

  const getProblemsForDevice = useCallback(
    (deviceId: string): Problem[] => {
      return problems.filter((p) => p.deviceId === deviceId && p.isActive);
    },
    [problems],
  );

  const getAvailableProblems = useCallback((): Problem[] => {
    return problems.filter((p) => p.isActive);
  }, [problems]);

  const getStepsForProblem = useCallback(
    (problemId: string): Step[] => {
      return steps
        .filter((s) => s.problemId === problemId && s.isActive)
        .sort((a, b) => a.stepNumber - b.stepNumber);
    },
    [steps],
  );

  const getDeviceById = useCallback(
    (id: string): Device | undefined => {
      return devices.find((d) => d.id === id);
    },
    [devices],
  );

  const getProblemById = useCallback(
    (id: string): Problem | undefined => {
      return problems.find((p) => p.id === id);
    },
    [problems],
  );

  const getStepById = useCallback(
    (id: string): Step | undefined => {
      return steps.find((s) => s.id === id);
    },
    [steps],
  );

  const getRemoteById = useCallback(
    (id: string): Remote | undefined => {
      return remotes.find((r) => r.id === id);
    },
    [remotes],
  );

  const getActiveRemotes = useCallback((): Remote[] => {
    return remotes.filter((r) => r.isActive);
  }, [remotes]);

  const getRemotesForDevice = useCallback(
    (deviceId: string): Remote[] => {
      return remotes.filter((r) => r.deviceId === deviceId && r.isActive);
    },
    [remotes],
  );

  const getDefaultRemoteForDevice = useCallback(
    (deviceId: string): Remote | undefined => {
      return remotes.find((r) => r.deviceId === deviceId && r.isDefault && r.isActive);
    },
    [remotes],
  );

  const getDefaultRemote = useCallback((): Remote | undefined => {
    return remotes.find((r) => r.isDefault && r.isActive);
  }, [remotes]);

  const getActiveSessions = useCallback((): DiagnosticSession[] => {
    return sessions.filter((s) => s.isActive && !s.endTime);
  }, [sessions]);

  const getEntityStats = useCallback(
    (entity: string) => {
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
    },
    [devices, problems, steps, remotes],
  );

  // Load functions
  const loadDevices = useCallback(async () => {
    try {
      setLoading(true);
      const deviceData = await api.getDevices();
      setDevices(deviceData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
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
      setError(error instanceof Error ? error.message : "Unknown error");
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
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadRemotes = useCallback(async () => {
    try {
      setLoading(true);
      const remoteData = await api.getRemotes();
      setRemotes(remoteData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
      setRemotes([]);
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const sessionData = await api.getSessions();
      setSessions(sessionData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [api, setLoading, setError]);

  const loadSiteSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Backend doesn't have settings endpoint yet, use default settings
      console.warn(
        "Settings endpoint not implemented in backend, using default settings",
      );
      setSiteSettings({
        siteName: "ANT Support",
        siteDescription: "Си��тема диагностики ТВ приставок",
        version: "1.0.0",
        maintenanceMode: false,
        debugMode: false,
      } as SiteSettings);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
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
  }, [
    loadDevices,
    loadProblems,
    loadSteps,
    loadRemotes,
    loadSessions,
    loadSiteSettings,
  ]);

  // Export data function
  const exportData = useCallback(
    async (options: any) => {
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
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      return {
        downloadUrl: url,
        data: data,
      };
    },
    [devices, problems, steps, remotes, sessions],
  );

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
    loading: {
      devices: loading,
      problems: loading,
      steps: loading,
      remotes: loading,
      stepActions: loading,
      sessions: loading,
      changeLogs: loading,
      siteSettings: loading,
    },
    errors: {
      devices: null,
      problems: null,
      steps: null,
      remotes: null,
      stepActions: null,
      sessions: null,
      changeLogs: null,
      siteSettings: null,
    },
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
    getAvailableProblems,
    getStepsForProblem,
    getDeviceById,
    getProblemById,
    getStepById,
    getRemoteById,
    getActiveRemotes,
    getRemotesForDevice,
    getDefaultRemoteForDevice,
    getDefaultRemote,
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
    reorderSteps: api.reorderSteps.bind(api),
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
