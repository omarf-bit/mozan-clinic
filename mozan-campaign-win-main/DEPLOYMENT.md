# Mozan Campaign Deployment Guide

## 📦 Building for Production

### 1. **Build the Project**

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 2. **Preview the Build Locally (Optional)**

```bash
npm run preview
```

This starts a local server to preview your production build at http://localhost:4173

---

## 🚀 Deployment Options

### Option A: Deploy to Your Server (VPS/Dedicated Server)

#### Requirements:
- Node.js 18+ installed on server
- Nginx or Apache web server
- SSH access to your server

#### Steps:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder to your server:**
   ```bash
   # Using SCP
   scp -r dist/* user@your-server.com:/var/www/mozan-campaign
   
   # Or using SFTP client like FileZilla
   ```

3. **Configure Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /var/www/mozan-campaign;
       index index.html;
       
       # Handle client-side routing
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

### Option B: Deploy to Netlify (Easiest)

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Or connect via GitHub:**
   - Push code to GitHub
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`

---

### Option C: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Or connect via GitHub:**
   - Push code to GitHub
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite settings

---

### Option D: Deploy to GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install -D gh-pages
   ```

2. **Add to package.json scripts:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Update vite.config.ts:**
   ```typescript
   base: '/mozan-campaign-win/',
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

---

## 🔧 Pre-Deployment Checklist

- [ ] Test the build locally with `npm run preview`
- [ ] Verify all features work (forms, authentication, database)
- [ ] Check that all images load correctly
- [ ] Test on different browsers
- [ ] Verify mobile responsiveness
- [ ] Remove console.log statements (optional)
- [ ] Update any API endpoints if needed

---

## 🗄️ Important Notes About Database

⚠️ **Your SQLite database runs in the browser using localStorage**

- Data is stored in the user's browser
- Data persists on the same device/browser
- Each user has their own local database
- Admin needs to access the admin panel from a specific device to see the data
- Consider exporting data regularly using the "Export to CSV" feature

### Recommended: Backup Strategy

1. Regularly export leads to CSV from the admin panel
2. Store exports in a secure location
3. Consider migrating to a server-side database for production (PostgreSQL, MySQL, etc.)

---

## 🔐 Security Recommendations

1. **Change default admin password immediately after deployment**
2. **Add HTTPS** (Let's Encrypt is free)
3. **Consider adding rate limiting for the login page**
4. **Regularly export and backup your data**

---

## 📊 Monitoring

After deployment, monitor:
- Page load speed
- Form submission success rate
- Admin login access
- Browser console for errors

---

## 🆘 Troubleshooting

### Issue: Blank page after deployment
**Solution:** Check that routing is configured correctly. For SPAs, ensure your server redirects all routes to index.html

### Issue: Images not loading
**Solution:** Verify the base path in vite.config.ts matches your deployment URL

### Issue: Admin login doesn't work
**Solution:** Clear browser cache and localStorage, then create new admin credentials

---

## 📞 Need Help?

If you encounter issues during deployment, check:
1. Browser console for errors
2. Network tab for failed requests
3. Server logs (if self-hosting)
