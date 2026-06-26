import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import compareEngine from './compareEngine.js';
import { auth, authMiddleware } from './auth.js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await auth.hashPassword(password);
    const user = db.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    // Generate token
    const token = auth.generateToken(user.id);

    // Create default settings
    db.updateSettings(user.id, { theme: 'dark' });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await auth.comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = auth.generateToken(user.id);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    const user = db.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// DASHBOARD ROUTES
// ============================================

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  try {
    const stats = db.getStatistics(req.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

app.get('/api/dashboard/recent', authMiddleware, (req, res) => {
  try {
    const comparisons = db.getUserComparisons(req.userId);
    const recentComparisons = comparisons.slice(0, 10).map(c => ({
      id: c.id,
      referenceUrl: c.referenceUrl,
      targetUrl: c.targetUrl,
      matchScore: c.matchScore,
      createdAt: c.createdAt
    }));

    res.json(recentComparisons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recent comparisons' });
  }
});

// ============================================
// COMPARISON ROUTES
// ============================================

app.post('/api/comparisons/create', authMiddleware, async (req, res) => {
  try {
    const { referenceUrl, targetUrl } = req.body;

    if (!referenceUrl || !targetUrl) {
      return res.status(400).json({ error: 'Both URLs are required' });
    }

    // Validate URLs
    try {
      new URL(referenceUrl);
      new URL(targetUrl);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Run comparison
    const result = await compareEngine.compareWebsites(referenceUrl, targetUrl);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Save comparison to database
    const comparison = db.createComparison(req.userId, {
      referenceUrl,
      targetUrl,
      matchScore: result.matchScore,
      referenceScreenshot: result.referenceScreenshot,
      targetScreenshot: result.targetScreenshot,
      typographyIssues: result.typographyIssues,
      colorIssues: result.colorIssues,
      spacingIssues: result.spacingIssues,
      layoutIssues: result.layoutIssues,
      totalDifferences: result.totalDifferences,
      cssFixes: result.cssFixes
    });

    res.json({
      success: true,
      comparison: {
        id: comparison.id,
        matchScore: result.matchScore,
        referenceScreenshot: result.referenceScreenshot,
        targetScreenshot: result.targetScreenshot,
        typographyIssues: result.typographyIssues,
        colorIssues: result.colorIssues,
        spacingIssues: result.spacingIssues,
        layoutIssues: result.layoutIssues,
        totalDifferences: result.totalDifferences,
        cssFixes: result.cssFixes
      }
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: 'Comparison failed' });
  }
});

app.get('/api/comparisons/:id', authMiddleware, (req, res) => {
  try {
    const comparison = db.getComparison(req.params.id);

    if (!comparison || comparison.userId !== req.userId) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get comparison' });
  }
});

app.delete('/api/comparisons/:id', authMiddleware, (req, res) => {
  try {
    const comparison = db.getComparison(req.params.id);

    if (!comparison || comparison.userId !== req.userId) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    db.deleteComparison(req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comparison' });
  }
});

// ============================================
// REPORT ROUTES
// ============================================

app.post('/api/reports/create', authMiddleware, (req, res) => {
  try {
    const { comparisonId, title, format = 'pdf' } = req.body;

    if (!comparisonId || !title) {
      return res.status(400).json({ error: 'Comparison ID and title required' });
    }

    const comparison = db.getComparison(comparisonId);
    if (!comparison || comparison.userId !== req.userId) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    const report = db.createReport(req.userId, {
      comparisonId,
      title,
      referenceUrl: comparison.referenceUrl,
      targetUrl: comparison.targetUrl,
      matchScore: comparison.matchScore,
      format,
      issuesCount: comparison.totalDifferences
    });

    res.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create report' });
  }
});

app.get('/api/reports', authMiddleware, (req, res) => {
  try {
    const reports = db.getUserReports(req.userId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

app.get('/api/reports/:id', authMiddleware, (req, res) => {
  try {
    const report = db.getReport(req.params.id);

    if (!report || report.userId !== req.userId) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get report' });
  }
});

app.delete('/api/reports/:id', authMiddleware, (req, res) => {
  try {
    const report = db.getReport(req.params.id);

    if (!report || report.userId !== req.userId) {
      return res.status(404).json({ error: 'Report not found' });
    }

    db.deleteReport(req.params.id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

app.get('/api/reports/search/:query', authMiddleware, (req, res) => {
  try {
    const results = db.searchReports(req.userId, req.params.query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================
// SETTINGS ROUTES
// ============================================

app.get('/api/settings', authMiddleware, (req, res) => {
  try {
    const settings = db.getUserSettings(req.userId);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

app.put('/api/settings', authMiddleware, (req, res) => {
  try {
    const settings = db.updateSettings(req.userId, req.body);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.put('/api/settings/profile', authMiddleware, (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First and last name required' });
    }

    const user = db.updateUser(req.userId, { firstName, lastName });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Export backup
app.get('/api/settings/export/backup', authMiddleware, (req, res) => {
  try {
    const comparisons = db.getUserComparisons(req.userId);
    const reports = db.getUserReports(req.userId);
    const settings = db.getUserSettings(req.userId);
    const user = db.getUserById(req.userId);

    const backup = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      comparisons,
      reports,
      settings,
      exportDate: new Date().toISOString()
    };

    res.json(backup);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export backup' });
  }
});

// ============================================
// STATIC FILES
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/comparison', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'comparison.html'));
});

app.get('/results', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'results.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     PIXEL COMPARE PRO SERVER STARTED    ║
╠════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT} ║
║  Time: ${new Date().toLocaleString()}        ║
╚════════════════════════════════════════╝
  `);
});
