import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '@/api/client';

interface DatabaseStatus {
  success: boolean;
  connected: boolean;
  tables: string[];
  stats: Record<string, number | string>;
  database?: any;
  error?: string;
}

interface InitResponse {
  success: boolean;
  message?: string;
  stats?: Record<string, number>;
  error?: string;
  details?: string;
}

export default function DatabaseInit() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [initResult, setInitResult] = useState<InitResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<DatabaseStatus>('/api/v1/init/status');
      setStatus(response);
    } catch (error: any) {
      setStatus({
        success: false,
        connected: false,
        tables: [],
        stats: {},
        error: error.message || 'Failed to check database status'
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializing(true);
    setInitResult(null);
    
    try {
      const response = await apiClient.post<InitResponse>('/api/v1/init/init');
      setInitResult(response);
      
      // Refresh status after successful initialization
      if (response.success) {
        setTimeout(() => {
          checkDatabaseStatus();
        }, 1000);
      }
    } catch (error: any) {
      setInitResult({
        success: false,
        error: error.message || 'Failed to initialize database',
        details: error.response?.data?.details
      });
    } finally {
      setInitializing(false);
    }
  };

  const validateSystem = async () => {
    setValidating(true);
    setValidationResult(null);

    try {
      const response = await apiClient.get<any>('/api/v1/init/validate');
      setValidationResult(response);
    } catch (error: any) {
      setValidationResult({
        success: false,
        error: error.message || 'Failed to validate system',
        details: error.response?.data?.details
      });
    } finally {
      setValidating(false);
    }
  };

  const resetSystem = async () => {
    setResetting(true);
    setResetResult(null);

    try {
      const response = await apiClient.post<any>('/api/v1/init/reset');
      setResetResult(response);

      // Refresh status after successful reset
      if (response.success) {
        setTimeout(() => {
          checkDatabaseStatus();
        }, 1000);
      }
    } catch (error: any) {
      setResetResult({
        success: false,
        error: error.message || 'Failed to reset system',
        details: error.response?.data?.details
      });
    } finally {
      setResetting(false);
    }
  };

  const formatTableStats = (stats: Record<string, number | string>) => {
    return Object.entries(stats).map(([table, count]) => (
      <div key={table} className="flex justify-between items-center py-1">
        <span className="text-sm font-medium capitalize">{table.replace('_', ' ')}</span>
        <span className={`text-sm px-2 py-1 rounded ${
          count === 'missing' ? 'bg-red-100 text-red-700' :
          count === 'error' ? 'bg-yellow-100 text-yellow-700' :
          typeof count === 'number' && count > 0 ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {count === 'missing' ? 'Missing' : 
           count === 'error' ? 'Error' : 
           count}
        </span>
      </div>
    ));
  };

  React.useEffect(() => {
    checkDatabaseStatus();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            Database Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Initialize and manage the PostgreSQL database for ANT Support
          </p>
        </div>
        
        <Button 
          onClick={checkDatabaseStatus} 
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh Status
        </Button>
      </div>

      {/* Database Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.connected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            Database Status
          </CardTitle>
          <CardDescription>
            Current connection and schema status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Checking database status...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Connection</h4>
                  <p className={`text-sm ${status.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Tables Found</h4>
                  <p className="text-sm text-muted-foreground">
                    {status.tables.length} tables
                  </p>
                </div>
              </div>

              {status.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{status.error}</AlertDescription>
                </Alert>
              )}

              {status.tables.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Database Tables</h4>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    {status.tables.join(', ')}
                  </div>
                </div>
              )}

              {Object.keys(status.stats).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Table Statistics</h4>
                  <div className="space-y-1">
                    {formatTableStats(status.stats)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No status data available</p>
          )}
        </CardContent>
      </Card>

      {/* Initialize Database Card */}
      <Card>
        <CardHeader>
          <CardTitle>Initialize Database</CardTitle>
          <CardDescription>
            Set up the complete database schema with sample data. This will drop existing tables and recreate them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This operation will drop all existing tables and data. 
                Use only for initial setup or when you want to reset the database completely.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={initializeDatabase} 
              disabled={initializing}
              variant="destructive"
              size="lg"
            >
              {initializing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Initializing Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Initialize Database
                </>
              )}
            </Button>

            {initResult && (
              <Alert variant={initResult.success ? "default" : "destructive"}>
                {initResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <div>
                    <p className="font-medium">
                      {initResult.success ? 'Success!' : 'Error'}
                    </p>
                    <p>{initResult.message || initResult.error}</p>
                    {initResult.stats && (
                      <div className="mt-2 text-sm">
                        <p>Database initialized with:</p>
                        <ul className="list-disc list-inside">
                          {Object.entries(initResult.stats).map(([key, value]) => (
                            <li key={key}>{value} {key}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {initResult.details && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Details: {initResult.details}
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
