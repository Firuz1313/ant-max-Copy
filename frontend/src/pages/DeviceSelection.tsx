import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ChevronRight,
  Tv,
  Zap,
  Settings,
  Star,
} from "lucide-react";
import { useApi } from "@/contexts/ApiContext";
import { useState, useEffect } from "react";

interface Device {
  id: string;
  name: string;
  model: string;
  brand: string;
  color: string;
  isActive: boolean;
}

interface Problem {
  id: string;
  title: string;
  deviceId: string;
  isActive: boolean;
}

const DeviceSelection = () => {
  const navigate = useNavigate();
  const { api, setError } = useApi();
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [devicesData, problemsData] = await Promise.all([
          api.getDevices(),
          api.getProblems()
        ]);
        
        setDevices(devicesData || []);
        setProblems(problemsData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [api, setError]);

  const handleDeviceSelect = (deviceId: string) => {
    navigate(`/problems/${deviceId}`);
  };

  const handleBack = () => {
    navigate("/");
  };

  const getDeviceIcon = (deviceId: string) => {
    switch (deviceId) {
      case "openbox":
      case "openbox_standard":
        return <Tv className="h-8 w-8" />;
      case "uclan":
      case "uclan_hd":
        return <Zap className="h-8 w-8" />;
      case "hdbox":
      case "hdbox_pro":
        return <Settings className="h-8 w-8" />;
      case "openbox_gold":
        return <Star className="h-8 w-8" />;
      default:
        return <Tv className="h-8 w-8" />;
    }
  };

  const getProblemsForDevice = (deviceId: string): number => {
    return problems.filter(p => p.deviceId === deviceId && p.isActive).length;
  };

  const activeDevices = devices.filter(d => d.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-white hover:bg-white/10 hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Tv className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">ANT Support</span>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20 pb-8">
        {/* Page Title */}
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Какая у вас приставка?
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Выберите модель вашей ТВ-приставки для получения
              персонализированной помощи
            </p>
          </div>
        </div>

        {/* Devices Grid */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full text-center text-gray-300 py-12">
                  <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" role="status">
                    <span className="sr-only">Загрузка...</span>
                  </div>
                  <p className="mt-2">Загрузка устройств...</p>
                </div>
              ) : activeDevices.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-12">
                  <Tv className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold mb-2">
                    Нет доступных устройств
                  </h3>
                  <p className="text-gray-500">
                    В данный момент устройства не найдены
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Обратитесь к администратору для добавления устройств.
                  </p>
                </div>
              ) : (
                activeDevices.map((device) => {
                  const problemsCount = getProblemsForDevice(device.id);

                  return (
                    <Card
                      key={device.id}
                      className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:scale-105"
                      onClick={() => handleDeviceSelect(device.id)}
                    >
                      <CardHeader className="text-center pb-4">
                        <div
                          className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${device.color || 'from-blue-500 to-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                        >
                          {getDeviceIcon(device.id)}
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors">
                          {device.name}
                        </CardTitle>
                        <p className="text-sm text-gray-300 mt-1">
                          {device.model}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-1">
                            {problemsCount}
                          </div>
                          <div className="text-sm text-gray-400 mb-4">
                            решений доступно
                          </div>
                          <div className="flex items-center justify-center text-sm text-gray-300 group-hover:text-blue-300 transition-colors">
                            <span>Выбрать</span>
                            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="container mx-auto px-4 mt-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">
                Не видите свою модель?
              </h3>
              <p className="text-gray-300 mb-6">
                Мы постоянно добавляем поддержку новых устройств. Свяжитесь с нами,
                и мы поможем найти решение для вашей приставки.
              </p>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate("/support")}
              >
                Связаться с поддержкой
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelection;
