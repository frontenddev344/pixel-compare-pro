# Pixel Compare Pro - Installation & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (https://nodejs.org)
- npm or yarn package manager
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Extract the project**
   ```bash
   cd pixel-compare-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install:
   - **Express.js** - Web server framework
   - **Playwright** - Browser automation for website comparison
   - **bcryptjs** - Password hashing for security
   - **jsonwebtoken** - JWT authentication
   - **cors** - Cross-Origin Resource Sharing
   - **uuid** - Unique ID generation
   - Other required dependencies

3. **Start the server**
   ```bash
   npm start
   ```

   You should see:
   ```
   ╔════════════════════════════════════════╗
   ║     PIXEL COMPARE PRO SERVER STARTED    ║
   ╠════════════════════════════════════════╣
   ║  Server running on: http://localhost:3000 ║
   ╚════════════════════════════════════════╝
   ```

4. **Open in browser**
   - Navigate to http://localhost:3000
   - Create an account or login
   - Start comparing websites!

---

## 📁 Project Structure

```
pixel-compare-pro/
├── public/                 # Frontend files
│   ├── index.html         # Login/Register page
│   ├── dashboard.html     # Dashboard with stats
│   ├── comparison.html    # URL comparison form
│   ├── results.html       # Comparison results
│   ├── reports.html       # Reports management
│   ├── settings.html      # User settings
│   ├── styles.css         # Global glassmorphism styles
│   └── app.js             # Shared frontend utilities
├── data/                  # JSON database files (auto-created)
│   ├── users.json         # User accounts
│   ├── comparisons.json   # Comparison records
│   ├── reports.json       # Generated reports
│   └── settings.json      # User preferences
├── public/screenshots/    # Screenshot storage (auto-created)
├── package.json           # Dependencies
├── server.js              # Main Express server
├── db.js                  # JSON database module
├── compareEngine.js       # Playwright comparison engine
├── auth.js                # Authentication utilities
└── README.md              # This file
```

---

## 🔐 Authentication

### Register
1. Click "Don't have an account? Sign Up"
2. Enter first name, last name, email, and password
3. Account is created and you're automatically logged in

### Login
1. Enter email and password
2. Session is created with JWT token
3. Token stored in localStorage (7-day expiry)

### Security
- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens are signed and verified
- Protected routes check authentication before access
- Tokens expire after 7 days

---

## 🔄 How Comparison Works

### Process
1. User enters two URLs (reference and target)
2. Playwright launches a browser instance
3. Both websites are loaded with 2-second wait for JS execution
4. Full-page screenshots are captured
5. Computed styles are extracted from 200+ elements
6. Elements are matched by tag name and text similarity
7. CSS properties are compared:
   - Typography (font-size, font-family, font-weight, line-height, etc.)
   - Colors (text and background)
   - Spacing (padding, margin)
   - Layout (width, height, border-radius, display)
8. Match score is calculated (100 - penalty)
9. CSS fixes are auto-generated
10. Results are saved to database

### Supported CSS Properties
- `font-size`, `font-family`, `font-weight`, `line-height`
- `letter-spacing`, `text-align`, `color`, `background-color`
- `padding-*`, `margin-*`, `border-radius`, `border`
- `width`, `height`, `display`, `box-shadow`, `opacity`

### Match Score Calculation
```
Base Score: 100%
Penalty: Number of differences × 2 (capped at 100)
Match Score = Max(Base - Penalty, 0)

Example:
- 15 differences = 30 point penalty
- Match Score = 100 - 30 = 70%
```

---

## 📊 Dashboard Features

### Statistics
- **Total Comparisons** - Number of comparisons performed
- **Reports Generated** - Number of reports created
- **Average Match Score** - Average percentage match across all comparisons
- **Issues Found** - Total CSS property differences discovered

### Recent Comparisons
- Shows last 10 comparisons
- Includes URLs, match scores, and creation dates
- Click "View" to see detailed results

---

## 🎨 Results View

### Match Score Visualization
- Animated circular progress indicator
- Shows percentage match between websites
- Higher score = more similar websites

### Screenshots
- Side-by-side comparison of reference and target
- Full-page screenshots from Playwright
- Visual reference for detected issues

### Issues Breakdown (Tabs)
- **Typography Issues** - Font and text-related differences
- **Color Issues** - Text and background color variations
- **Spacing Issues** - Padding and margin differences
- **Layout Issues** - Size, border-radius, and display changes

### CSS Fixes
- Auto-generated CSS code
- Ready to copy and use
- Organized by element type
- Includes explanatory comments

### Export Options
- **Copy CSS** - Copy fixes to clipboard
- **Export Report** - Download as JSON
- **Delete** - Remove comparison from history

---

## 📋 Reports

### Features
- **List All Reports** - View all generated reports
- **Search** - Filter by title or URL
- **Download** - Export report as JSON
- **Delete** - Remove report from database
- **Persistence** - Reports stored in JSON database

### Report Contents
```json
{
  "title": "Report Name",
  "referenceUrl": "https://example.com",
  "targetUrl": "https://target.com",
  "matchScore": 75,
  "issues": {
    "typography": [...],
    "colors": [...],
    "spacing": [...],
    "layout": [...],
    "total": 20
  },
  "cssFixes": "/* CSS code */",
  "exportDate": "2024-01-15T10:30:00.000Z"
}
```

---

## ⚙️ Settings

### Profile Management
- Update first name and last name
- View email address
- See account creation date

### Preferences
- **Theme Toggle** - Dark/Light mode
- **Notifications** - Enable/disable notifications
- **Save Preferences** - Persist settings to database

### Data Management
- **Export Backup** - Download entire account as JSON
  - Includes: user info, all comparisons, all reports, settings
- **Import Backup** - Restore from backup file
- **Reset All Data** - Delete all account information (irreversible)

### Backup Structure
```json
{
  "user": { /* User info */ },
  "comparisons": [ /* All comparisons */ ],
  "reports": [ /* All reports */ ],
  "settings": { /* User preferences */ },
  "exportDate": "ISO timestamp"
}
```

---

## 🌐 UI/UX Design

### Glassmorphism Style
- Semi-transparent cards with blur effect
- Modern gradient backgrounds
- Smooth animations and transitions
- Color scheme:
  - Primary: `#7C3AED` (Purple)
  - Secondary: `#4F46E5` (Indigo)
  - Accent: `#06B6D4` (Cyan)
  - Background: Dark gradient blend

### Responsive Breakpoints
- **Desktop** (1024px+) - Full layout with sidebar
- **Tablet** (768px-1023px) - Adjusted grid layout
- **Mobile** (< 768px) - Single column, touch-optimized

### Accessibility
- Semantic HTML structure
- Proper heading hierarchy
- Color contrast compliance
- Keyboard navigation support
- Loading states and feedback

---

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/recent` - Get recent comparisons

### Comparisons
- `POST /api/comparisons/create` - Create new comparison
- `GET /api/comparisons/:id` - Get comparison details
- `DELETE /api/comparisons/:id` - Delete comparison

### Reports
- `POST /api/reports/create` - Create report
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get report details
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/search/:query` - Search reports

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `PUT /api/settings/profile` - Update profile
- `GET /api/settings/export/backup` - Export backup

---

## 💾 Database

### JSON-Based Storage
Uses JSON files instead of SQLite for simplicity and portability.

### Data Files
1. **users.json** - User accounts with hashed passwords
2. **comparisons.json** - Comparison records and results
3. **reports.json** - Generated reports
4. **settings.json** - User preferences

### Data Structure Examples

**User**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password": "bcrypt_hash",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "ISO timestamp"
}
```

**Comparison**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "referenceUrl": "https://ref.com",
  "targetUrl": "https://target.com",
  "matchScore": 75,
  "referenceScreenshot": "/screenshots/ref_*.png",
  "targetScreenshot": "/screenshots/target_*.png",
  "typographyIssues": [...],
  "colorIssues": [...],
  "spacingIssues": [...],
  "layoutIssues": [...],
  "totalDifferences": 20,
  "cssFixes": "/* CSS */",
  "createdAt": "ISO timestamp"
}
```

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Playwright Installation Issues
```bash
# Reinstall Playwright browsers
npx playwright install
```

### Screenshots Not Appearing
- Check `/public/screenshots` folder exists
- Verify write permissions
- Clear browser cache

### Database Errors
- Delete `/data` folder to reset
- Server will recreate JSON files on startup
- Check file permissions in project directory

### Authentication Issues
- Clear localStorage: `localStorage.clear()` in console
- Clear browser cookies
- Restart server

### Comparison Fails
- Check internet connection
- Ensure both URLs are accessible
- Try with simpler websites first
- Check browser console for errors

---

## 📝 Environment Variables (Optional)

Create `.env` file for customization:
```
PORT=3000
JWT_SECRET=your_secret_key_here
```

---

## 🔒 Security Considerations

### Current Implementation
- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ CORS protection
- ✅ Protected routes
- ✅ Input validation

### Production Recommendations
- Use HTTPS in production
- Store JWT_SECRET in environment variables
- Implement rate limiting
- Add input sanitization
- Use a proper database (PostgreSQL/MongoDB)
- Add request logging
- Implement backup strategy

---

## 📈 Performance Tips

### For Large Websites
- Playwright will limit to 200 elements
- Increase timeout if needed
- Close other browser windows
- Use a dedicated server

### Database Optimization
- JSON works well for < 10K comparisons
- For larger scale, migrate to PostgreSQL
- Implement indexing
- Archive old comparisons

---

## 🤝 Support & Contributions

### Issues
- Check console for error messages
- Review troubleshooting section
- Check API endpoints are responding

### Future Enhancements
- Database migration tools
- Advanced analytics
- Team collaboration features
- Scheduled comparisons
- Custom CSS rules
- A/B testing integration
- Slack/Email notifications

---

## 📄 License

MIT License - Feel free to use for commercial projects

---

## ✨ Features Summary

✅ User Authentication (Register/Login/Logout)
✅ Website Comparison Engine (Playwright-based)
✅ CSS Property Detection (25+ properties)
✅ Auto-generated CSS Fixes
✅ Dashboard with Statistics
✅ Screenshots & Visualization
✅ Issues Categorization
✅ Report Management & Export
✅ User Settings & Preferences
✅ Data Backup & Restore
✅ Responsive Design
✅ Glassmorphism UI
✅ JSON Database
✅ JWT Authentication
✅ Protected Routes
✅ Error Handling

---

**Happy comparing! 🎉**

For updates and more info: pixelcomparepro.dev (fictional)
