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

// Default data - START WITH EMPTY ARRAYS
const defaultData = {
  devices: [],
  problems: [],
  steps: [],
  tvInterfaces: [],
  sessions: [],
};

// Helper functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const createTimestamp = () => {
  return new Date().toISOString();
};

// Ensure data directory exists
const ensureDataDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
};

// Load data from file
const loadFromFile = async (filePath, defaultValue = []) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log(`File ${filePath} not found, starting with empty data`);
    return defaultValue;
  }
};

// Save data to file
const saveToFile = async (filePath, data) => {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error saving to ${filePath}:`, error);
    throw error;
  }
};

// Generic CRUD operations
export const getAllItems = async (tableName) => {
  const fileMap = {
    devices: DEVICES_FILE,
    problems: PROBLEMS_FILE,
    steps: STEPS_FILE,
    tvInterfaces: TV_INTERFACES_FILE,
    sessions: SESSIONS_FILE,
  };

  const filePath = fileMap[tableName];
  if (!filePath) {
    throw new Error(`Unknown table: ${tableName}`);
  }

  return await loadFromFile(filePath, []);
};

export const getItemById = async (tableName, id) => {
  const items = await getAllItems(tableName);
  return items.find((item) => item.id === id);
};

export const createItem = async (tableName, data) => {
  const items = await getAllItems(tableName);

  const newItem = {
    id: generateId(),
    ...data,
    created_at: createTimestamp(),
    updated_at: createTimestamp(),
  };

  items.push(newItem);

  const fileMap = {
    devices: DEVICES_FILE,
    problems: PROBLEMS_FILE,
    steps: STEPS_FILE,
    tvInterfaces: TV_INTERFACES_FILE,
    sessions: SESSIONS_FILE,
  };

  await saveToFile(fileMap[tableName], items);
  return newItem;
};

export const updateItem = async (tableName, id, data) => {
  const items = await getAllItems(tableName);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error(`Item with id ${id} not found in ${tableName}`);
  }

  const updatedItem = {
    ...items[index],
    ...data,
    updated_at: createTimestamp(),
  };

  items[index] = updatedItem;

  const fileMap = {
    devices: DEVICES_FILE,
    problems: PROBLEMS_FILE,
    steps: STEPS_FILE,
    tvInterfaces: TV_INTERFACES_FILE,
    sessions: SESSIONS_FILE,
  };

  await saveToFile(fileMap[tableName], items);
  return updatedItem;
};

export const deleteItem = async (tableName, id) => {
  const items = await getAllItems(tableName);
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error(`Item with id ${id} not found in ${tableName}`);
  }

  items.splice(index, 1);

  const fileMap = {
    devices: DEVICES_FILE,
    problems: PROBLEMS_FILE,
    steps: STEPS_FILE,
    tvInterfaces: TV_INTERFACES_FILE,
    sessions: SESSIONS_FILE,
  };

  await saveToFile(fileMap[tableName], items);
  return true;
};

// Clear all data
export const clearAllData = async () => {
  const files = [
    DEVICES_FILE,
    PROBLEMS_FILE,
    STEPS_FILE,
    TV_INTERFACES_FILE,
    SESSIONS_FILE,
  ];

  for (const file of files) {
    await saveToFile(file, []);
  }
};

// Get database statistics
export const getStats = async () => {
  const [devices, problems, steps, tvInterfaces, sessions] = await Promise.all([
    getAllItems("devices"),
    getAllItems("problems"),
    getAllItems("steps"),
    getAllItems("tvInterfaces"),
    getAllItems("sessions"),
  ]);

  return {
    devices: devices.length,
    problems: problems.length,
    steps: steps.length,
    tvInterfaces: tvInterfaces.length,
    sessions: sessions.length,
  };
};

export default {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  clearAllData,
  getStats,
};
