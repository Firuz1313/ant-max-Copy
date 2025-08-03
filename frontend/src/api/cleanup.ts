import { apiClient } from './client';

export interface CleanupResponse {
  success: boolean;
  created: number;
}

export const cleanupAPI = {
  // Очистить TV интерфейсы и создать пользовательские
  cleanupTVInterfaces: async (): Promise<{ success: boolean; data?: CleanupResponse; error?: string }> => {
    try {
      const response = await apiClient.post('/cleanup/tv-interfaces');
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error cleaning up TV interfaces:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Произошла оши��ка при очистке TV интерфейсов'
      };
    }
  }
};

export default cleanupAPI;
