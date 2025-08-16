import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react";
import { apiClient } from "@/api/client";

export const DatabaseInitializer = () => {
  const [status, setStatus] = useState<"loading" | "ready" | "needs_init" | "error">("loading");
  const [stats, setStats] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      setStatus("loading");
      setError(null);
      
      const response = await apiClient.get("/init/status");
      
      if (response.success && response.connected) {
        const hasData = Object.values(response.stats).some(
          (count: any) => typeof count === "number" && count > 0
        );
        
        if (hasData) {
          setStatus("ready");
          setStats(response.stats);
        } else {
          setStatus("needs_init");
          setStats(response.stats);
        }
      } else {
        setStatus("error");
        setError(response.error || "Database connection failed");
      }
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to check database status");
    }
  };

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      const response = await apiClient.post("/init/init");
      
      if (response.success) {
        setStatus("ready");
        setStats(response.stats);
      } else {
        throw new Error(response.error || "Initialization failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize database");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    const autoInitialize = async () => {
      await checkStatus();

      // Auto-initialize if database is connected but empty
      if (status === "needs_init") {
        console.log("Auto-initializing database...");
        await initializeDatabase();
      }
    };

    autoInitialize();
  }, []);

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Проверка базы данных...</span>
        </CardContent>
      </Card>
    );
  }

  if (status === "ready") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            База данных готова
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats && Object.entries(stats).map(([table, count]: [string, any]) => (
              <div key={table} className="flex justify-between items-center">
                <span className="capitalize">{table}:</span>
                <Badge variant="outline">
                  {typeof count === "number" ? count : count}
                </Badge>
              </div>
            ))}
          </div>
          <Button 
            onClick={checkStatus} 
            className="w-full mt-4" 
            variant="outline"
          >
            Обновить статус
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "needs_init") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 text-blue-600 mr-2" />
            Требуется инициализация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            База данных подключена, но не содержит данных. Инициализируйте систему для начала работы.
          </p>
          <Button 
            onClick={initializeDatabase} 
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Инициализация...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Инициализировать
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          Ошибка подключения
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600 mb-4">
          {error || "Не удалось подключиться к базе данных"}
        </p>
        <Button 
          onClick={checkStatus} 
          className="w-full" 
          variant="outline"
        >
          Повторить
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseInitializer;
