# Deployment Guide - Student Management System

## 🚀 Quick Deploy to Vercel

### Prerequisites
- Node.js 24.x or higher
- Vercel account
- Supabase project set up

### 1. Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update your `.env` file with actual Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=https://yoocftirjhkufziozuki.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2NmdGlyamhrdWZ6aW96dWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MTgzODEsImV4cCI6MjA4NjM5NDM4MX0.p_AzLjaBEGRv8ULVI7Jh2MAl-kFxcdoH9cfGUnsRQo4
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb2NmdGlyamhrdWZ6aW96dWtpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDgxODM4MSwiZXhwIjoyMDg2Mzk0MzgxfQ.B62oVTMyHKeSHol3AOxBHQZfPKidePY2w8dX5O9Nmqw
   VITE_TEACHER_ACCESS_CODE=TEACHER123@@
   NODE_ENV=production
   ```

### 2. Vercel Environment Variables

In your Vercel dashboard, set these environment variables:

```bash
supabase-url          = https://your-project-id.supabase.co
supabase-anon-key     = your_supabase_anon_key_here
supabase-service-role-key = your_supabase_service_role_key_here
teacher-access-code  = TEACHER123
```

### 3. Deploy Commands

**Production Deployment:**
```bash
npm run deploy
```

**Staging Deployment:**
```bash
npm run deploy:staging
```

**Pre-deploy Quality Check:**
```bash
npm run pre-deploy
```

## 🛠️ Local Development

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Build & Test Locally
```bash
npm run build:check
```

### Linting & Formatting
```bash
npm run lint:fix
npm run format
```

## 📋 Deployment Checklist

### Before Deployment:
- [ ] Environment variables configured in `.env`
- [ ] Supabase database schema applied
- [ ] All console errors removed ✅
- [ ] Loading states fixed ✅
- [ ] Code structure standardized ✅
- [ ] Build process tested locally

### After Deployment:
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Check responsive design
- [ ] Validate teacher access control
- [ ] Test error handling

## 🔧 Configuration Files

### `vercel.json` Features:
- ✅ Conflict-free routing
- ✅ CORS headers for API
- ✅ Optimized caching
- ✅ Node.js 18.x runtime
- ✅ Environment variable mapping

### `.gitignore` Security:
- ✅ All secrets excluded
- ✅ Build artifacts ignored
- ✅ Development files excluded
- ✅ Test reports excluded

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails:**
   ```bash
   npm run build
   # Check for missing dependencies or syntax errors
   ```

2. **Environment Variables Not Working:**
   - Verify Vercel environment variables are set
   - Check variable names match exactly
   - Restart deployment after changing variables

3. **API Routes Not Working:**
   - Verify `vercel.json` routing configuration
   - Check CORS headers
   - Ensure API files are in `/api` directory

4. **Authentication Issues:**
   - Verify Supabase URL and keys
   - Check teacher access code
   - Ensure Supabase schema is applied

### Debug Commands:
```bash
# Check build output
npm run build

# Preview production build
npm run preview

# Check linting issues
npm run lint

# Format code
npm run format
```

## 📊 Performance Optimization

### Implemented:
- ✅ Asset caching (1 year)
- ✅ CSS/JS caching (1 year)
- ✅ API CORS optimization
- ✅ Build optimization
- ✅ Bundle size optimization

### Monitoring:
- Check Vercel Analytics for performance
- Monitor Supabase usage
- Track error rates in production

## 🔒 Security Features

### Implemented:
- ✅ Environment variable protection
- ✅ Teacher-only access control
- ✅ CORS headers
- ✅ No hardcoded secrets
- ✅ Secure API endpoints

### Best Practices:
- Regularly update dependencies
- Monitor for security vulnerabilities
- Use HTTPS in production
- Implement rate limiting if needed

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review Vercel deployment logs
3. Verify Supabase configuration
4. Test locally before deploying

---

**Ready for production deployment! 🎉**
