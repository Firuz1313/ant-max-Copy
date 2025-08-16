import { apiClient } from "@/api/client";

export const initializeDatabase = async () => {
  try {
    console.log("Checking database status...");

    // First check if database is initialized
    const statusResponse = await apiClient.get("/init/status");
    console.log("Database status:", statusResponse);

    if (statusResponse.success && statusResponse.connected) {
      // Check if we have data
      const hasData = Object.values(statusResponse.stats).some(
        (count: any) => typeof count === "number" && count > 0,
      );

      if (!hasData) {
        console.log("Database is empty, initializing...");
        const initResponse = await apiClient.post("/init/init");
        console.log("Database initialization result:", initResponse);
        return initResponse;
      } else {
        console.log("Database already has data:", statusResponse.stats);
        return statusResponse;
      }
    } else {
      throw new Error("Database connection failed");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
};
