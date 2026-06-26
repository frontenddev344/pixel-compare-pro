# 🚀 PIXEL COMPARE PRO - QUICK START GUIDE

## ⚡ 3-Step Installation

### Step 1️⃣ Install Dependencies
```bash
cd pixel-compare-pro
npm install
```
This will install all required packages:
- Express.js
- Playwright
- bcryptjs
- jsonwebtoken
- cors
- And more...

⏱️ Takes: 2-3 minutes

### Step 2️⃣ Start the Server
```bash
npm start
```

You'll see:
```
╔════════════════════════════════════════╗
║     PIXEL COMPARE PRO SERVER STARTED    ║
╠════════════════════════════════════════╣
║  Server running on: http://localhost:3000 ║
║  Time: 6/24/2026, 1:22:25 PM        ║
╚════════════════════════════════════════╝
```

### Step 3️⃣ Open Browser
Navigate to: **http://localhost:3000**

---

## 🎯 First Time Setup

### Create Your Account
1. Click "Sign Up"
2. Enter:
   - First Name
   - Last Name
   - Email
   - Password (min 6 characters)
3. Click "Create Account"
4. You're logged in! ✅

### Try a Comparison
1. Click "New Comparison"
2. Enter two URLs:
   - Reference: `https://google.com`
   - Target: `https://github.com`
3. Click "Start Comparison"
4. Wait 1-2 minutes for analysis
5. View detailed results! 📊

---

## 📱 What You Can Do

### Dashboard
- View statistics (comparisons, reports, match score)
- See recent comparisons
- Quick access to all features

### New Comparison
- Enter any two website URLs
- Automatic CSS analysis
- Get match percentage
- See detailed issues

### Results
- Match score visualization
- Side-by-side screenshots
- Issues by category (Typography, Colors, Spacing, Layout)
- Auto-generated CSS fixes
- Export reports

### Reports
- View all generated reports
- Search by URL or title
- Download reports as JSON
- Delete old reports

### Settings
- Update profile information
- Toggle theme (dark/light)
- Export account backup
- Import backup file
- Reset data

---

## 🔑 Default Account (For Testing)

After first login, you'll have:
- Email: `your-email@example.com`
- Password: Your chosen password
- API Token: Auto-generated (valid 7 days)

---

## 🛠️ Technical Details

### Server Info
- **Runtime**: Node.js
- **Framework**: Express.js
- **Port**: 3000 (default)
- **Database**: JSON files in `/data`
- **Auth**: JWT tokens

### Browser Automation
- **Engine**: Playwright
- **Mode**: Headless Chrome
- **Viewport**: 1280x720
- **Wait Time**: 2 seconds per page

### API Rate
- No rate limiting (local)
- Production: Add rate limiting

---

## 💾 File Locations

### After First Run
```
pixel-compare-pro/
├── data/
│   ├── users.json           ← Your account
│   ├── comparisons.json     ← Your comparisons
│   ├── reports.json         ← Your reports
│   └── settings.json        ← Your preferences
├── public/
│   └── screenshots/         ← Comparison images
└── node_modules/           ← Dependencies
```

---

## 🔐 Security Checklist

✅ Passwords are hashed (bcryptjs)
✅ Tokens expire after 7 days
✅ All routes are protected
✅ Input validation on all forms
✅ CORS enabled for local testing
✅ Error handling on all endpoints

---

## ⚙️ Configuration (Optional)

### Custom Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000;  // Change 3000 to your port
```

### Custom JWT Secret
Edit `auth.js`:
```javascript
const JWT_SECRET = 'your-custom-secret-key';
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Kill the process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### Dependencies Won't Install
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Playwright Issues
```bash
# Install browser binaries
npx playwright install

# Install system dependencies (Linux)
npx playwright install-deps
```

### Database Reset
```bash
# Delete data folder to reset
rm -rf data/

# Server will recreate JSON files on next start
npm start
```

### Can't Login
```javascript
// Open browser console and clear:
localStorage.clear()
sessionStorage.clear()

// Then refresh page and try again
```

---

## 📊 What Gets Compared

### CSS Properties (25+)

**Typography**
- font-size
- font-family
- font-weight
- line-height
- letter-spacing
- text-align

**Colors**
- text color
- background-color

**Spacing**
- padding (top, bottom, left, right)
- margin (top, bottom, left, right)

**Layout**
- width
- height
- border-radius
- display
- border
- box-shadow

### Not Compared
- JavaScript functionality
- Forms and interactions
- Animation timing
- SEO metadata
- Images (only screenshots)

---

## 📈 Example Results

### Match Score: 78%
```
Reference: https://google.com
Target:    https://github.com

Issues Found: 15
├─ Typography: 6 issues
├─ Colors: 3 issues
├─ Spacing: 4 issues
└─ Layout: 2 issues

Generated CSS Fixes: Ready to copy
```

---

## 💡 Pro Tips

### Best Comparisons
1. Compare similar sites (better match score)
2. Use established brands (more CSS)
3. Try competitor websites
4. Compare old vs new versions

### Maximize Features
- Export backups regularly
- Search reports by URL
- Copy CSS fixes directly
- Use screenshots for reference

### Speed Up
- Run on powerful computer
- Close other browser tabs
- Use simpler websites
- Compare at night (less traffic)

---

## 🎓 Learning Path

### Beginner
1. Create account
2. Run first comparison
3. Explore results
4. View screenshots

### Intermediate
1. Compare multiple sites
2. Review CSS fixes
3. Export reports
4. Manage reports

### Advanced
1. Analyze CSS patterns
2. Export backups
3. Study differences
4. Customize settings

---

## 📱 Mobile Access

### Responsive Design
✅ Works on iPhone, Android
✅ Tablet optimized
✅ Touch-friendly buttons
✅ Full functionality

### Limitations
- Playwright screenshots take time on mobile
- Large comparisons may timeout
- Recommend desktop for best experience

---

## 🔄 Backup Your Data

### Export Backup
```
Settings → Export Backup
→ JSON file downloads
→ Save to safe location
```

### Restore from Backup
```
Settings → Import Backup
→ Select JSON file
→ Confirm action
→ Data restored
```

---

## 🚀 Production Deployment

### Before Deploying
- [ ] Change JWT_SECRET to random string
- [ ] Set environment variables
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test thoroughly

### Recommended Platforms
- Heroku (easy deploy)
- DigitalOcean (affordable)
- AWS (scalable)
- Vercel (frontend only)

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| README.md | Full documentation |
| SETUP_GUIDE.md | Comprehensive setup |
| QUICK_START.md | This file (quick ref) |

---

## 🆘 Getting Help

### Check These First
1. README.md (detailed guide)
2. SETUP_GUIDE.md (complete docs)
3. Browser console (error messages)
4. Server logs (terminal output)

### Common Questions

**Q: How long does comparison take?**
A: 1-2 minutes depending on website size

**Q: Can I compare dynamic sites?**
A: Yes, Playwright waits 2 seconds for JS

**Q: Is my data safe?**
A: Yes, stored locally in JSON files

**Q: Can I export data?**
A: Yes, export backup as JSON file

**Q: How many sites can I compare?**
A: Unlimited (storage dependent)

**Q: Can I reset my password?**
A: Not yet, create new account

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Server started successfully
- [ ] Can access http://localhost:3000
- [ ] Can create account
- [ ] Can login
- [ ] Can see dashboard
- [ ] Can access comparison page
- [ ] Can access reports
- [ ] Can access settings
- [ ] Can logout

---

## 🎉 You're All Set!

You now have a fully functional website comparison tool!

### Next Steps
1. Create your account
2. Try your first comparison
3. Explore the dashboard
4. Check settings
5. Export data

---

## 📞 Support

### Resources
- Documentation: See README.md & SETUP_GUIDE.md
- Code: All files are well-commented
- Console: Check browser developer tools
- Logs: Check terminal output

### Report Issues
1. Note exact error message
2. Check console for details
3. Review database files
4. Restart server

---

## 🎓 Learning Resources

### JavaScript/Web Development
- MDN Web Docs: mdn.org
- JavaScript Info: javascript.info
- FreeCodeCamp: freecodecamp.org

### Backend Development
- Node.js Guide: nodejs.org
- Express Docs: expressjs.com
- REST API Best Practices

### Security
- OWASP: owasp.org
- Auth Best Practices
- Password Hashing Guide

---

**Happy Comparing! 🚀**

**Version**: 1.0.0
**Last Updated**: June 24, 2024
**Status**: Production Ready ✅

---

For detailed information, see README.md or SETUP_GUIDE.md
