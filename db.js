import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbFile = {
  users: path.join(dataDir, 'users.json'),
  comparisons: path.join(dataDir, 'comparisons.json'),
  reports: path.join(dataDir, 'reports.json'),
  settings: path.join(dataDir, 'settings.json')
};

// Initialize all database files
Object.values(dbFile).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
  }
});

// Database operations
const db = {
  // User operations
  createUser: (userData) => {
    const users = JSON.parse(fs.readFileSync(dbFile.users, 'utf-8'));
    const newUser = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    fs.writeFileSync(dbFile.users, JSON.stringify(users, null, 2));
    return newUser;
  },

  getUserByEmail: (email) => {
    const users = JSON.parse(fs.readFileSync(dbFile.users, 'utf-8'));
    return users.find(u => u.email === email);
  },

  getUserById: (id) => {
    const users = JSON.parse(fs.readFileSync(dbFile.users, 'utf-8'));
    return users.find(u => u.id === id);
  },

  updateUser: (id, updates) => {
    const users = JSON.parse(fs.readFileSync(dbFile.users, 'utf-8'));
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    fs.writeFileSync(dbFile.users, JSON.stringify(users, null, 2));
    return users[index];
  },

  // Comparison operations
  createComparison: (userId, comparisonData) => {
    const comparisons = JSON.parse(fs.readFileSync(dbFile.comparisons, 'utf-8'));
    const newComparison = {
      id: uuidv4(),
      userId,
      ...comparisonData,
      createdAt: new Date().toISOString()
    };
    comparisons.push(newComparison);
    fs.writeFileSync(dbFile.comparisons, JSON.stringify(comparisons, null, 2));
    return newComparison;
  },

  getComparison: (id) => {
    const comparisons = JSON.parse(fs.readFileSync(dbFile.comparisons, 'utf-8'));
    return comparisons.find(c => c.id === id);
  },

  getUserComparisons: (userId) => {
    const comparisons = JSON.parse(fs.readFileSync(dbFile.comparisons, 'utf-8'));
    return comparisons.filter(c => c.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  deleteComparison: (id) => {
    const comparisons = JSON.parse(fs.readFileSync(dbFile.comparisons, 'utf-8'));
    const filtered = comparisons.filter(c => c.id !== id);
    fs.writeFileSync(dbFile.comparisons, JSON.stringify(filtered, null, 2));
    return true;
  },

  // Report operations
  createReport: (userId, reportData) => {
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    const newReport = {
      id: uuidv4(),
      userId,
      ...reportData,
      createdAt: new Date().toISOString()
    };
    reports.push(newReport);
    fs.writeFileSync(dbFile.reports, JSON.stringify(reports, null, 2));
    return newReport;
  },

  getReport: (id) => {
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    return reports.find(r => r.id === id);
  },

  getUserReports: (userId) => {
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    return reports.filter(r => r.userId === userId).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  },

  deleteReport: (id) => {
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    const filtered = reports.filter(r => r.id !== id);
    fs.writeFileSync(dbFile.reports, JSON.stringify(filtered, null, 2));
    return true;
  },

  searchReports: (userId, query) => {
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    return reports.filter(r => 
      r.userId === userId && (
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.referenceUrl.toLowerCase().includes(query.toLowerCase()) ||
        r.targetUrl.toLowerCase().includes(query.toLowerCase())
      )
    );
  },

  // Settings operations
  getUserSettings: (userId) => {
    const settings = JSON.parse(fs.readFileSync(dbFile.settings, 'utf-8'));
    let userSettings = settings.find(s => s.userId === userId);
    if (!userSettings) {
      userSettings = {
        userId,
        theme: 'dark',
        notifications: true,
        autoExport: false
      };
      settings.push(userSettings);
      fs.writeFileSync(dbFile.settings, JSON.stringify(settings, null, 2));
    }
    return userSettings;
  },

  updateSettings: (userId, settingsData) => {
    const settings = JSON.parse(fs.readFileSync(dbFile.settings, 'utf-8'));
    let index = settings.findIndex(s => s.userId === userId);
    if (index === -1) {
      const newSettings = { userId, ...settingsData };
      settings.push(newSettings);
      fs.writeFileSync(dbFile.settings, JSON.stringify(settings, null, 2));
      return newSettings;
    }
    settings[index] = { ...settings[index], ...settingsData };
    fs.writeFileSync(dbFile.settings, JSON.stringify(settings, null, 2));
    return settings[index];
  },

  // Statistics
  getStatistics: (userId) => {
    const comparisons = JSON.parse(fs.readFileSync(dbFile.comparisons, 'utf-8'));
    const reports = JSON.parse(fs.readFileSync(dbFile.reports, 'utf-8'));
    
    const userComparisons = comparisons.filter(c => c.userId === userId);
    const userReports = reports.filter(r => r.userId === userId);
    
    const avgMatchScore = userComparisons.length > 0 
      ? (userComparisons.reduce((sum, c) => sum + (c.matchScore || 0), 0) / userComparisons.length).toFixed(2)
      : 0;

    const totalIssues = userComparisons.reduce((sum, c) => sum + (c.issues?.length || 0), 0);

    return {
      totalComparisons: userComparisons.length,
      totalReports: userReports.length,
      avgMatchScore: parseFloat(avgMatchScore),
      totalIssues
    };
  }
};

export default db;
