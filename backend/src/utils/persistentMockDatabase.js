// Persistent mock database implementation that saves data to files
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data storage directory
const DATA_DIR = path.join(__dirname, "../../data");
const DEVICES_FILE = path.join(DATA_DIR, "devices.json");
const PROBLEMS_FILE = path.join(DATA_DIR, "problems.json");
const STEPS_FILE = path.join(DATA_DIR, "steps.json");
const TV_INTERFACES_FILE = path.join(DATA_DIR, "tv_interfaces.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

// Default data
const defaultData = {
  devices: [
    {
      id: "openbox",
      name: "OpenBox",
      brand: "OpenBox",
      model: "Standard",
      type: "set_top_box",
      description: "Стандартные приставки OpenBox для цифрового телевидения",
      color: "from-blue-500 to-blue-600",
      image_url: "/images/devices/openbox-standard.jpg",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "uclan",
      name: "UCLAN",
      brand: "UCLAN",
      model: "HD Series",
      type: "set_top_box",
      description: "Высококачественные HD приставки UCLAN",
      color: "from-green-500 to-green-600",
      image_url: "/images/devices/uclan-hd.jpg",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "hdbox",
      name: "HDBox",
      brand: "HDBox",
      model: "Pro",
      type: "set_top_box",
      description: "Профессиональные приставки HDBox",
      color: "from-purple-500 to-purple-600",
      image_url: "/images/devices/hdbox-pro.jpg",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "openbox_gold",
      name: "OpenBox Gold",
      brand: "OpenBox",
      model: "Gold Edition",
      type: "set_top_box",
      description: "Премиум приставки OpenBox Gold с расширенными возможностями",
      color: "from-yellow-500 to-yellow-600",
      image_url: "/images/devices/openbox-gold.jpg",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  problems: [
    {
      id: 1,
      title: "Нет сигнала на экране",
      description: "Экран остается черным, нет изображения",
      severity: "high",
      category: "display",
      device_id: "openbox",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Проблемы со звуком",
      description: "Звук отсутствует или искажен",
      severity: "medium",
      category: "audio",
      device_id: "openbox",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Не работает пульт управления",
      description: "Приставка не реагирует на команды пульта",
      severity: "medium",
      category: "remote",
      device_id: "uclan",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  steps: [],
  tv_interfaces: [
    {
      id: "tv_int_825",
      name: "OpenBox Main Menu",
      description: "Main menu interface for OpenBox devices",
      type: "home",
      device_id: "openbox",
      screenshot_url: null,
      screenshot_data: null,
      clickable_areas: "[]",
      highlight_areas: "[]",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  sessions: [],
};

// Initialize storage
async function initStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log("📁 Mock database storage initialized");
  } catch (error) {
    console.error("❌ Failed to initialize storage:", error);
  }
}

// Load data from file
async function loadData(filename, defaultValue = []) {
  try {
    const data = await fs.readFile(filename, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return default
    return defaultValue;
  }
}

// Save data to file
async function saveData(filename, data) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`💾 Data saved to ${path.basename(filename)}`);
  } catch (error) {
    console.error(`❌ Failed to save data to ${filename}:`, error);
  }
}

// Generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Mock database class
class PersistentMockDatabase {
  constructor() {
    this.initialized = false;
    this.init();
  }

  async init() {
    await initStorage();
    
    // Load existing data or initialize with defaults
    const devices = await loadData(DEVICES_FILE, defaultData.devices);
    const problems = await loadData(PROBLEMS_FILE, defaultData.problems);
    const steps = await loadData(STEPS_FILE, defaultData.steps);
    const tv_interfaces = await loadData(TV_INTERFACES_FILE, defaultData.tv_interfaces);
    const sessions = await loadData(SESSIONS_FILE, defaultData.sessions);

    // Save defaults if files don't exist
    if (devices.length === 0 || devices === defaultData.devices) {
      await saveData(DEVICES_FILE, defaultData.devices);
    }
    if (problems.length === 0 || problems === defaultData.problems) {
      await saveData(PROBLEMS_FILE, defaultData.problems);
    }
    if (steps.length === 0) {
      await saveData(STEPS_FILE, defaultData.steps);
    }
    if (tv_interfaces.length === 0 || tv_interfaces === defaultData.tv_interfaces) {
      await saveData(TV_INTERFACES_FILE, defaultData.tv_interfaces);
    }
    if (sessions.length === 0) {
      await saveData(SESSIONS_FILE, defaultData.sessions);
    }

    this.initialized = true;
    console.log("✅ Persistent mock database initialized");
  }

  async waitForInit() {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Generic query method
  async query(text, params = []) {
    await this.waitForInit();

    console.log(`🔍 Mock Query: ${text.substring(0, 100)}...`);
    console.log(`🔍 Parameters:`, params);

    try {
      // Parse SQL-like queries for mock implementation
      const queryLower = text.toLowerCase().trim();

      // SELECT queries
      if (queryLower.startsWith("select")) {
        return await this.handleSelect(text, params);
      }

      // INSERT queries
      if (queryLower.startsWith("insert")) {
        return await this.handleInsert(text, params);
      }

      // UPDATE queries
      if (queryLower.startsWith("update")) {
        return await this.handleUpdate(text, params);
      }

      // DELETE queries
      if (queryLower.startsWith("delete")) {
        return await this.handleDelete(text, params);
      }

      // Default response
      return { rows: [], rowCount: 0 };
    } catch (error) {
      console.error("❌ Mock query error:", error);
      throw error;
    }
  }

  async handleSelect(text, params) {
    const queryLower = text.toLowerCase();

    // Devices
    if (queryLower.includes("from devices")) {
      const devices = await loadData(DEVICES_FILE, []);
      let filteredDevices = devices;

      // Apply basic filtering
      if (queryLower.includes("where is_active = true")) {
        filteredDevices = devices.filter(d => d.is_active === true);
      }

      // Apply ordering
      if (queryLower.includes("order by order_index")) {
        filteredDevices.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
      }

      // Apply limit
      const limitMatch = queryLower.match(/limit\s+\$?(\d+)/);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        filteredDevices = filteredDevices.slice(0, limit);
      }

      // Count query
      if (queryLower.includes("count(*)")) {
        return { rows: [{ total: devices.length }], rowCount: 1 };
      }

      return { rows: filteredDevices, rowCount: filteredDevices.length };
    }

    // Problems
    if (queryLower.includes("from problems")) {
      const problems = await loadData(PROBLEMS_FILE, []);
      let filteredProblems = problems;

      if (queryLower.includes("where is_active = true")) {
        filteredProblems = problems.filter(p => p.is_active === true);
      }

      if (queryLower.includes("count(*)")) {
        return { rows: [{ total: problems.length }], rowCount: 1 };
      }

      return { rows: filteredProblems, rowCount: filteredProblems.length };
    }

    // TV Interfaces
    if (queryLower.includes("from tv_interfaces")) {
      const interfaces = await loadData(TV_INTERFACES_FILE, []);
      let filteredInterfaces = interfaces;

      if (queryLower.includes("where") && queryLower.includes("is_active = true")) {
        filteredInterfaces = interfaces.filter(i => i.is_active === true);
      }

      return { rows: filteredInterfaces, rowCount: filteredInterfaces.length };
    }

    // Sessions
    if (queryLower.includes("from diagnostic_sessions") || queryLower.includes("from sessions")) {
      const sessions = await loadData(SESSIONS_FILE, []);
      return { rows: sessions, rowCount: sessions.length };
    }

    // Default empty result
    return { rows: [], rowCount: 0 };
  }

  async handleInsert(text, params) {
    const queryLower = text.toLowerCase();

    if (queryLower.includes("into devices")) {
      const devices = await loadData(DEVICES_FILE, []);
      const newDevice = {
        id: generateId(),
        name: params[0] || "New Device",
        brand: params[1] || "Unknown",
        model: params[2] || "Unknown",
        description: params[3] || "",
        color: params[4] || "from-blue-500 to-blue-600",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      devices.push(newDevice);
      await saveData(DEVICES_FILE, devices);
      return { rows: [newDevice], rowCount: 1 };
    }

    if (queryLower.includes("into problems")) {
      const problems = await loadData(PROBLEMS_FILE, []);
      const newProblem = {
        id: problems.length + 1,
        title: params[0] || "New Problem",
        description: params[1] || "",
        device_id: params[2] || null,
        severity: params[3] || "medium",
        category: params[4] || "other",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      problems.push(newProblem);
      await saveData(PROBLEMS_FILE, problems);
      return { rows: [newProblem], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }

  async handleUpdate(text, params) {
    const queryLower = text.toLowerCase();

    if (queryLower.includes("devices")) {
      const devices = await loadData(DEVICES_FILE, []);
      // Simple update implementation - update first matching device
      if (devices.length > 0) {
        devices[0].updated_at = new Date().toISOString();
        await saveData(DEVICES_FILE, devices);
        return { rows: [devices[0]], rowCount: 1 };
      }
    }

    return { rows: [], rowCount: 0 };
  }

  async handleDelete(text, params) {
    const queryLower = text.toLowerCase();

    if (queryLower.includes("from devices")) {
      const devices = await loadData(DEVICES_FILE, []);
      // Simple delete implementation
      const originalLength = devices.length;
      const filteredDevices = devices.slice(0, -1); // Remove last device as example
      await saveData(DEVICES_FILE, filteredDevices);
      return { rows: [], rowCount: originalLength - filteredDevices.length };
    }

    return { rows: [], rowCount: 0 };
  }

  // Transaction support (simplified)
  async transaction(callback) {
    try {
      // In a real implementation, we'd handle rollbacks
      return await callback({
        query: this.query.bind(this)
      });
    } catch (error) {
      console.error("❌ Mock transaction error:", error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    await this.waitForInit();
    return {
      success: true,
      serverTime: new Date().toISOString(),
      version: "Mock Database v1.0",
    };
  }

  // Create database (no-op for mock)
  async createDatabase() {
    console.log("📊 Mock database created (no-op)");
    return { success: true };
  }
}

// Export singleton instance
const mockDb = new PersistentMockDatabase();

export default {
  query: mockDb.query.bind(mockDb),
  transaction: mockDb.transaction.bind(mockDb),
  testConnection: mockDb.testConnection.bind(mockDb),
  createDatabase: mockDb.createDatabase.bind(mockDb),
};
