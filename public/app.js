// ============================================
// API & UTILITIES
// ============================================

const API_BASE = '/api';

class API {
  static getToken() {
    return localStorage.getItem('token');
  }

  static setToken(token) {
    localStorage.setItem('token', token);
  }

  static removeToken() {
    localStorage.removeItem('token');
  }

  static getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  static async register(email, password, firstName, lastName) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName })
    });
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Dashboard endpoints
  static async getStats() {
    return this.request('/dashboard/stats');
  }

  static async getRecentComparisons() {
    return this.request('/dashboard/recent');
  }

  // Comparison endpoints
  static async createComparison(referenceUrl, targetUrl) {
    return this.request('/comparisons/create', {
      method: 'POST',
      body: JSON.stringify({ referenceUrl, targetUrl })
    });
  }

  static async getComparison(id) {
    return this.request(`/comparisons/${id}`);
  }

  static async deleteComparison(id) {
    return this.request(`/comparisons/${id}`, {
      method: 'DELETE'
    });
  }

  // Report endpoints
  static async createReport(comparisonId, title, format) {
    return this.request('/reports/create', {
      method: 'POST',
      body: JSON.stringify({ comparisonId, title, format })
    });
  }

  static async getReports() {
    return this.request('/reports');
  }

  static async getReport(id) {
    return this.request(`/reports/${id}`);
  }

  static async deleteReport(id) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE'
    });
  }

  static async searchReports(query) {
    return this.request(`/reports/search/${encodeURIComponent(query)}`);
  }

  // Settings endpoints
  static async getSettings() {
    return this.request('/settings');
  }

  static async updateSettings(settings) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  static async updateProfile(firstName, lastName) {
    return this.request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify({ firstName, lastName })
    });
  }

  static async exportBackup() {
    return this.request('/settings/export/backup');
  }
}

// ============================================
// UI HELPERS
// ============================================

class UI {
  static showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 4000);
  }

  static showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  static hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  static showSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.id = 'loading-spinner';
    if (container) {
      container.innerHTML = '';
      container.appendChild(spinner);
    }
    return spinner;
  }

  static hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
  }

  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static formatUrl(url) {
    const u = new URL(url);
    return u.hostname;
  }

  static copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      UI.showAlert('Copied to clipboard!', 'success');
    });
  }

  static downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ============================================
// AUTH MANAGER
// ============================================

class Auth {
  static async register(email, password, firstName, lastName) {
    const response = await API.register(email, password, firstName, lastName);
    API.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  static async login(email, password) {
    const response = await API.login(email, password);
    API.setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  static logout() {
    API.removeToken();
    localStorage.removeItem('user');
    window.location.href = '/';
  }

  static isAuthenticated() {
    return !!API.getToken();
  }

  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static async validateToken() {
    try {
      await API.getCurrentUser();
      return true;
    } catch {
      this.logout();
      return false;
    }
  }
}

// ============================================
// THEME MANAGER
// ============================================

class Theme {
  static init() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    this.setTheme(savedTheme);
  }

  static setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  static toggle() {
    const current = localStorage.getItem('theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  static getCurrent() {
    return localStorage.getItem('theme') || 'dark';
  }
}

// ============================================
// VALIDATION
// ============================================

class Validation {
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isPassword(password) {
    return password.length >= 6;
  }

  static validateRegister(email, password, firstName, lastName) {
    if (!email || !password || !firstName || !lastName) {
      return { valid: false, error: 'All fields are required' };
    }
    if (!this.isEmail(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    if (!this.isPassword(password)) {
      return { valid: false, error: 'Password must be at least 6 characters' };
    }
    return { valid: true };
  }

  static validateLogin(email, password) {
    if (!email || !password) {
      return { valid: false, error: 'Email and password required' };
    }
    if (!this.isEmail(email)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  }

  static validateComparison(referenceUrl, targetUrl) {
    if (!referenceUrl || !targetUrl) {
      return { valid: false, error: 'Both URLs are required' };
    }
    if (!this.isUrl(referenceUrl)) {
      return { valid: false, error: 'Invalid reference URL' };
    }
    if (!this.isUrl(targetUrl)) {
      return { valid: false, error: 'Invalid target URL' };
    }
    return { valid: true };
  }
}

// ============================================
// PROTECTED ROUTES
// ============================================

async function protectRoute() {
  if (!Auth.isAuthenticated()) {
    window.location.href = '/';
    return false;
  }

  if (!(await Auth.validateToken())) {
    return false;
  }

  return true;
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
});

export { API, UI, Auth, Theme, Validation, protectRoute };
