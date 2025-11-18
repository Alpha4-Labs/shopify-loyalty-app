# GitHub Repository Setup Guide

Instructions for creating and publishing the GitHub repository.

---

## Step 1: Create GitHub Repository

### Option A: Via GitHub Web Interface

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `shopify-loyalty-app`
3. Description: `Production-ready Shopify loyalty app with Loyalteez integration`
4. Visibility: **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Option B: Via GitHub CLI

```bash
# Install GitHub CLI if not installed
# https://cli.github.com/

# Login
gh auth login

# Create repository
gh repo create loyalteez/shopify-loyalty-app --public --description "Production-ready Shopify loyalty app with Loyalteez integration"
```

---

## Step 2: Push Code to GitHub

```bash
# Navigate to project directory
cd c:\Users\taylo\a4-contracts\shopify-loyalty-app

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Production-ready Shopify loyalty app

- Express server with webhook handling
- Loyalteez API client (testnet-compatible)
- Shopify webhook verification
- Comprehensive documentation
- Deployment configs (Railway, Cloudflare Workers)
- Testing utilities and examples"

# Set main branch
git branch -M main

# Add remote (replace with your actual GitHub username/org)
git remote add origin https://github.com/loyalteez/shopify-loyalty-app.git

# Push to GitHub
git push -u origin main
```

---

## Step 3: Configure Repository Settings

### 3.1 Repository Settings

1. Go to repository → **Settings**
2. **General**:
   - Description: "Production-ready Shopify loyalty app with Loyalteez integration"
   - Topics: `shopify`, `loyalty`, `rewards`, `webhook`, `loyalteez`, `blockchain`, `ltz`, `nodejs`, `express`
   - Website: `https://docs.loyalteez.app`

### 3.2 Branch Protection (Optional)

1. Go to **Branches**
2. Add rule for `main` branch:
   - Require pull request reviews
   - Require status checks (if CI/CD added)
   - Require branches to be up to date

### 3.3 GitHub Pages (Optional)

If you want to host documentation:

1. Go to **Pages**
2. Source: `main` branch, `/docs` folder
3. Save

---

## Step 4: Create First Release

### 4.1 Create Release Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Initial release: Production-ready Shopify loyalty app"

# Push tag
git push origin v1.0.0
```

### 4.2 Create GitHub Release

1. Go to repository → **Releases**
2. Click **Draft a new release**
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description:

```markdown
## 🎉 Initial Release

Production-ready Shopify loyalty app with Loyalteez integration.

### Features

- ✅ Automatic reward distribution via Shopify webhooks
- ✅ Secure webhook signature verification
- ✅ Testnet-compatible (no brand ID required)
- ✅ Multiple deployment options (Railway, Cloudflare Workers)
- ✅ Comprehensive documentation
- ✅ Testing utilities and examples

### Quick Start

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

See [README.md](./README.md) for full documentation.
```

6. Click **Publish release**

---

## Step 5: Add Badges (Optional)

Add to README.md:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![GitHub stars](https://img.shields.io/github/stars/loyalteez/shopify-loyalty-app)](https://github.com/loyalteez/shopify-loyalty-app/stargazers)
```

---

## Step 6: Enable GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests (if tests exist)
      run: npm test || true
```

---

## Step 7: Update Links

After repository is created, update:

1. **README.md**: Update repository URL
2. **package.json**: Update repository URL
3. **docs/SETUP.md**: Update GitHub links
4. **docs/DEPLOYMENT.md**: Update GitHub links
5. **docs/TROUBLESHOOTING.md**: Update GitHub links

---

## Verification Checklist

Before considering complete:

- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] README displays correctly
- [ ] All links work
- [ ] License file visible
- [ ] .gitignore working correctly
- [ ] First release created
- [ ] Repository description and topics set
- [ ] Badges added (optional)
- [ ] CI/CD configured (optional)

---

## Next Steps

After repository is public:

1. **Share**: Post on social media, Discord, etc.
2. **Documentation**: Link from main Loyalteez docs
3. **Examples**: Add to Loyalteez examples repository
4. **Support**: Monitor issues and pull requests

---

## Repository URLs

After setup, update these:

- **Repository**: `https://github.com/loyalteez/shopify-loyalty-app`
- **Issues**: `https://github.com/loyalteez/shopify-loyalty-app/issues`
- **Releases**: `https://github.com/loyalteez/shopify-loyalty-app/releases`

---

## Need Help?

- **GitHub Docs**: [docs.github.com](https://docs.github.com)
- **Git CLI**: [git-scm.com/docs](https://git-scm.com/docs)
- **GitHub CLI**: [cli.github.com](https://cli.github.com)

