# RelationshipOS Environment Setup
## 15-Minute Developer Onboarding Guide

> **⚡ Quick Start Goal**: Get from zero to productive RelationshipOS development in 15 minutes with this comprehensive setup guide.

---

## 🎯 **SETUP OVERVIEW**

### **What You'll Have After Setup**
- ✅ Complete RelationshipOS development environment
- ✅ All integrations configured (Supabase, OpenAI, Vercel)
- ✅ Oracle Engine ready for development and testing
- ✅ Development tools and extensions installed
- ✅ First Oracle query working locally

### **Prerequisites**
- Node.js 18+ installed
- Git configured with GitHub access
- VSCode or Cursor IDE
- GitHub CLI (optional but recommended)

---

## 🚀 **QUICK START (5 Minutes)**

### **Step 1: Repository Setup**
```bash
# Clone the repository
git clone https://github.com/kylesonlin/RelationshipOS-app.git
cd RelationshipOS-app

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
```

### **Step 2: Basic Configuration**
```bash
# Verify Node.js version
node --version  # Should be 18+

# Install global tools (if not already installed)
npm install -g @supabase/cli
npm install -g vercel

# Verify installation
supabase --version
vercel --version
```

### **Step 3: Quick Test**
```bash
# Run development server
npm run dev

# Should open http://localhost:3000
# Basic UI should load (even without full configuration)
```

---

## ⚙️ **DETAILED ENVIRONMENT VARIABLE REFERENCE**

### **Required Environment Variables**
Create `.env.local` file with these variables:

```env
# === CORE APPLICATION ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=RelationshipOS

# === SUPABASE (Database & Auth) ===
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# === OPENAI (Oracle Engine AI) ===
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo

# === INTEGRATION APIs ===
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

GOOGLE_CLIENT_ID=your_google_client_id  
GOOGLE_CLIENT_SECRET=your_google_client_secret

# === PERFORMANCE & CACHING ===
REDIS_URL=your_redis_connection_string
NEXT_PUBLIC_CACHE_TTL=300

# === MONITORING & ANALYTICS ===
NEXT_PUBLIC_ENVIRONMENT=development
SENTRY_DSN=your_sentry_dsn_optional

# === VERCEL DEPLOYMENT ===
VERCEL_URL=your_vercel_deployment_url
VERCEL_ENV=development
```

### **Environment Variable Sources**
```markdown
🔐 **SUPABASE**: Get from Supabase Dashboard → Settings → API
🤖 **OPENAI**: Get from OpenAI Platform → API Keys
💼 **LINKEDIN**: Get from LinkedIn Developer Portal
📧 **GOOGLE**: Get from Google Cloud Console
⚡ **REDIS**: Get from Redis Cloud or local installation
📊 **SENTRY**: Get from Sentry.io (optional for monitoring)
```

---

## 🗄️ **DATABASE SETUP (Supabase)**

### **Quick Supabase Setup**
```bash
# Login to Supabase CLI
supabase login

# Link to existing project (or create new one)
supabase link --project-ref your_project_id

# Run migrations to set up database schema
supabase db push

# Verify database setup
supabase db diff
```

### **Database Schema Verification**
```sql
-- Check that core tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'people', 'relationships', 'queries', 'intelligence_cache');

-- Should return 5 rows with our core tables
```

### **Local Database Development**
```bash
# Start local Supabase (optional - for offline development)
supabase start

# Reset database to clean state
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

---

## 🤖 **AI SERVICES SETUP**

### **OpenAI Configuration**
```bash
# Test OpenAI API connection
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4-turbo","messages":[{"role":"user","content":"Hello"}],"max_tokens":10}' \
     https://api.openai.com/v1/chat/completions

# Should return successful response with "Hello" completion
```

### **Oracle Engine Test**
```typescript
// Test Oracle Engine locally
// Add this to a test file and run with npm run test

import { oracleEngine } from '@/lib/oracle-engine';

const testOracleEngine = async () => {
  const response = await oracleEngine.processQuery(
    "Who should I prioritize this week?",
    "test-user-id"
  );
  
  console.log('Oracle Response:', response);
  console.log('Response Time:', response.responseTime, 'ms');
  
  // Should complete in <10 seconds
  if (response.responseTime > 10000) {
    throw new Error('Oracle Engine too slow!');
  }
};
```

---

## 🔗 **INTEGRATION APIS SETUP**

### **LinkedIn API Setup**
```markdown
1. Go to LinkedIn Developer Portal: https://developer.linkedin.com/
2. Create new app with these settings:
   - App name: RelationshipOS (Development)
   - Products: Sign In with LinkedIn, LinkedIn API
   - Redirect URLs: http://localhost:3000/api/auth/callback/linkedin
3. Copy Client ID and Client Secret to .env.local
4. Request access to additional products if needed
```

### **Google APIs Setup**
```markdown
1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create new project or select existing one
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
   - Google People API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
5. Copy Client ID and Client Secret to .env.local
```

### **Integration Test**
```bash
# Test LinkedIn integration
npm run test:integrations:linkedin

# Test Google integrations  
npm run test:integrations:google

# Test all integrations
npm run test:integrations
```

---

## 🚀 **DEPLOYMENT SETUP (Vercel)**

### **Vercel Configuration**
```bash
# Login to Vercel
vercel login

# Link project to Vercel
vercel link

# Set environment variables in Vercel
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all environment variables

# Deploy to preview
vercel

# Deploy to production (after testing)
vercel --prod
```

### **Vercel Environment Setup**
```json
// vercel.json configuration
{
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://app.wisedom.ai",
    "NEXT_PUBLIC_ENVIRONMENT": "production"
  },
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## 🧪 **TESTING SETUP**

### **Test Environment Configuration**
```bash
# Install testing dependencies (should already be in package.json)
npm install --save-dev jest @testing-library/react @testing-library/jest-dom vitest

# Create test environment file
cp .env.local .env.test.local

# Update test environment variables
# Use test database and API keys with lower limits
```

### **Run Test Suite**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## 💻 **DEVELOPMENT TOOLS SETUP**

### **VSCode Extensions (Recommended)**
```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### **VSCode Settings**
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.experimental.configFile": "tailwind.config.js"
}
```

### **Git Hooks Setup**
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Set up pre-commit hook
npx husky init
echo "npm run lint && npm run type-check" > .husky/pre-commit

# Set up pre-push hook for quality gates
echo "npm run test && npm run build" > .husky/pre-push
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions**

#### **Build Failures**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### **Database Connection Issues**
```bash
# Check Supabase status
supabase status

# Test database connection
supabase db ping

# Reset local database
supabase db reset --linked
```

#### **API Integration Failures**
```bash
# Test environment variables
echo $OPENAI_API_KEY | head -c 20

# Test API connectivity
curl -I https://api.openai.com/v1/models

# Check rate limits and quotas
# Review API dashboard for usage and errors
```

#### **Performance Issues**
```bash
# Check Oracle Engine response times
npm run test:performance

# Profile bundle size
npm run analyze

# Check memory usage
npm run dev -- --inspect
```

---

## ✅ **SETUP VERIFICATION CHECKLIST**

### **Basic Setup Verification**
```markdown
□ Repository cloned and dependencies installed
□ Development server starts without errors (npm run dev)
□ Environment variables configured correctly
□ Database connection working (Supabase)
□ Basic UI loads at http://localhost:3000
```

### **Integration Verification**
```markdown
□ OpenAI API connection successful
□ Oracle Engine processes test query in <10 seconds
□ LinkedIn OAuth flow working (if configured)
□ Google APIs accessible (if configured)
□ Redis caching operational (if configured)
```

### **Development Tools Verification**
```markdown
□ TypeScript compilation successful (npm run type-check)
□ Linting passes (npm run lint)
□ Tests run successfully (npm test)
□ Build completes (npm run build)
□ Git hooks functioning
```

### **Deployment Readiness**
```markdown
□ Vercel project linked and configured
□ Environment variables set in Vercel dashboard
□ Preview deployment successful
□ Production deployment tested
□ Domain and SSL configured (for production)
```

---

## 🎯 **NEXT STEPS**

### **After Setup Completion**
1. **Read Documentation**: Review docs/RELATIONSHIPOS_VISION_MANIFESTO.md
2. **Understand Strategy**: Study docs/RELATIONSHIPOS_REFINED_STRATEGY.md  
3. **Review Constraints**: Read docs/AI_CONSTRAINTS.md for development guidelines
4. **Start Development**: Follow docs/AI_DEVELOPMENT_PLAYBOOK.md for phase-specific guidance
5. **Join Virtual Team**: Use @hotkeys for expert consultation

### **First Development Tasks**
```markdown
□ Create test Oracle query and verify <10 second response
□ Set up user authentication flow
□ Implement basic relationship data model
□ Build Oracle search interface component
□ Add integration for at least one data source (email/LinkedIn)
```

---

**⚡ Environment Setup Complete! You're ready to build the AI virtual assistant that replaces expensive human VAs with revolutionary relationship intelligence.**

**🎯 Remember: Every feature must pass the 5-test framework and advance our mission of 10x better relationship management.**

**Ready to develop RelationshipOS with elite standards and AI-first methodology!** 🚀 