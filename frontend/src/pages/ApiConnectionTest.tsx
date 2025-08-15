import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  RefreshCw,
} from "lucide-react";
import { apiClient } from "@/api/client";

interface TestResult {
  name: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  duration?: number;
}

export default function ApiConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    const testResults: TestResult[] = [];

    // Test 1: Database Status
    try {
      const start = Date.now();
      const response = await apiClient.get("/api/v1/init/status");
      const duration = Date.now() - start;

      testResults.push({
        name: "Database Connection",
        success: response.success && response.connected,
        message: response.connected
          ? "Database connected successfully"
          : "Database connection failed",
        data: response,
        duration,
      });
    } catch (error: any) {
      testResults.push({
        name: "Database Connection",
        success: false,
        message: "Failed to check database status",
        error: error.message,
      });
    }

    // Test 2: Health Check
    try {
      const start = Date.now();
      const response = await apiClient.get("/api/health");
      const duration = Date.now() - start;

      testResults.push({
        name: "API Health Check",
        success: response.success,
        message: response.message || "API health check successful",
        data: response,
        duration,
      });
    } catch (error: any) {
      testResults.push({
        name: "API Health Check",
        success: false,
        message: "API health check failed",
        error: error.message,
      });
    }

    // Test 3: Get Devices
    try {
      const start = Date.now();
      const response = await apiClient.get("/api/v1/devices");
      const duration = Date.now() - start;

      const devices = response.data || response;
      const isArray = Array.isArray(devices);

      testResults.push({
        name: "Get Devices",
        success: isArray,
        message: isArray
          ? `Retrieved ${devices.length} devices`
          : "Response is not an array",
        data: {
          count: isArray ? devices.length : 0,
          sample: isArray ? devices[0] : null,
        },
        duration,
      });
    } catch (error: any) {
      testResults.push({
        name: "Get Devices",
        success: false,
        message: "Failed to retrieve devices",
        error: error.message,
      });
    }

    // Test 4: Get Problems
    try {
      const start = Date.now();
      const response = await apiClient.get("/api/v1/problems");
      const duration = Date.now() - start;

      const problems = response.data || response;
      const isArray = Array.isArray(problems);

      testResults.push({
        name: "Get Problems",
        success: isArray,
        message: isArray
          ? `Retrieved ${problems.length} problems`
          : "Response is not an array",
        data: {
          count: isArray ? problems.length : 0,
          sample: isArray ? problems[0] : null,
        },
        duration,
      });
    } catch (error: any) {
      testResults.push({
        name: "Get Problems",
        success: false,
        message: "Failed to retrieve problems",
        error: error.message,
      });
    }

    // Test 5: API Validation
    try {
      const start = Date.now();
      const response = await apiClient.get("/api/v1/init/validate");
      const duration = Date.now() - start;

      testResults.push({
        name: "Full API Validation",
        success: response.success,
        message: response.message || "API validation completed",
        data: response.validation,
        duration,
      });
    } catch (error: any) {
      testResults.push({
        name: "Full API Validation",
        success: false,
        message: "API validation failed",
        error: error.message,
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const successCount = results.filter((r) => r.success).length;
  const totalTests = results.length;
  const allPassed = totalTests > 0 && successCount === totalTests;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="h-8 w-8" />
            API Connection Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Test the connection between frontend and backend API
          </p>
        </div>

        <Button onClick={runTests} disabled={testing}>
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Tests
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <Alert variant={allPassed ? "default" : "destructive"}>
          {allPassed ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <strong>Test Results:</strong> {successCount} of {totalTests} tests
            passed
            {allPassed
              ? " - All systems operational!"
              : " - Some issues detected"}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {results.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                {result.name}
                {result.duration && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    {result.duration}ms
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {result.message}
                {result.error && (
                  <span className="text-red-600 block mt-1">
                    Error: {result.error}
                  </span>
                )}
              </CardDescription>
            </CardHeader>

            {result.data && (
              <CardContent>
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    View Response Data
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {testing && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Running API tests...</span>
        </div>
      )}
    </div>
  );
}
