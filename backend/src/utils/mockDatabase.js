// Mock database implementation for development environments where PostgreSQL is not available
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock data storage - START WITH EMPTY DATA
let mockData = {
  devices: [],
  problems: [],
  steps: [],
  sessions: [],
  tvInterfaces: [],
  tvInterfaceMarks: [],
};

// Helper functions
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const createTimestamp = () => {
  return new Date().toISOString();
};

// Generic CRUD operations
export const getAllItems = async (tableName) => {
  console.log(`🔍 MockDB: Getting all items from ${tableName}`);
  return mockData[tableName] || [];
};

export const getItemById = async (tableName, id) => {
  console.log(`🔍 MockDB: Getting item ${id} from ${tableName}`);
  const items = mockData[tableName] || [];
  return items.find((item) => item.id === id);
};

export const createItem = async (tableName, data) => {
  console.log(`➕ MockDB: Creating item in ${tableName}`);
  if (!mockData[tableName]) {
    mockData[tableName] = [];
  }
  
  const newItem = {
    id: generateId(),
    ...data,
    created_at: createTimestamp(),
    updated_at: createTimestamp(),
  };
  
  mockData[tableName].push(newItem);
  return newItem;
};

export const updateItem = async (tableName, id, data) => {
  console.log(`📝 MockDB: Updating item ${id} in ${tableName}`);
  const items = mockData[tableName] || [];
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
  return updatedItem;
};

export const deleteItem = async (tableName, id) => {
  console.log(`🗑️ MockDB: Deleting item ${id} from ${tableName}`);
  const items = mockData[tableName] || [];
  const index = items.findIndex((item) => item.id === id);
  
  if (index === -1) {
    throw new Error(`Item with id ${id} not found in ${tableName}`);
  }
  
  items.splice(index, 1);
  return true;
};

// Clear all data
export const clearAllData = () => {
  console.log("🧹 MockDB: Clearing all data");
  mockData = {
    devices: [],
    problems: [],
    steps: [],
    sessions: [],
    tvInterfaces: [],
    tvInterfaceMarks: [],
  };
};

// Get database statistics
export const getStats = () => {
  return {
    devices: mockData.devices?.length || 0,
    problems: mockData.problems?.length || 0,
    steps: mockData.steps?.length || 0,
    sessions: mockData.sessions?.length || 0,
    tvInterfaces: mockData.tvInterfaces?.length || 0,
    tvInterfaceMarks: mockData.tvInterfaceMarks?.length || 0,
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
