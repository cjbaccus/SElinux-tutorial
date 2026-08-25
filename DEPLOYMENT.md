# Deploying to Vercel

This guide shows you how to deploy the SELinux Interactive Tutorial to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- Git repository (GitHub, GitLab, or Bitbucket)

## Option 1: Deploy via Vercel Dashboard (Easiest)

### Step 1: Push to Git

First, commit and push your code to a Git repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SELinux Interactive Tutorial"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/my-selinux-tutorial.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your GitHub/GitLab/Bitbucket repository
4. Click **"Import"**

### Step 3: Configure Project

Vercel will auto-detect Vite settings:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

Click **"Deploy"**

### Step 4: Done!

Your site will be live at: `https://your-project-name.vercel.app`

---

## Option 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

```bash
# Navigate to project directory
cd /Users/cjbaccus/Desktop/Code/Tutorials/my-selinux-tutorial

# Deploy to production
vercel --prod
```

The CLI will:
1. Detect it's a Vite project
2. Build the project
3. Upload to Vercel
4. Provide you with a deployment URL

---

## Option 3: One-Command Deploy

If you already have the Vercel CLI:

```bash
# From project root
vercel --prod
```

That's it! 🎉

---

## Custom Domain

To add a custom domain:

1. Go to your project dashboard on Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your domain (e.g., `selinux-tutorial.com`)
4. Follow DNS configuration instructions

---

## Environment Variables (if needed)

If you need to add environment variables:

1. Go to project **"Settings"** → **"Environment Variables"**
2. Add variables as needed
3. Redeploy

---

## Automatic Deployments

Once connected to Git:

- **Every push to `main`** → Production deployment
- **Every push to other branches** → Preview deployment
- **Every pull request** → Preview deployment with unique URL

---

## Build Configuration

The project uses the following configuration (already set in `vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

The `rewrites` section ensures client-side routing works correctly.

---

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:

1. **Missing dependencies:** Make sure `package.json` is up to date
2. **Build errors:** Test locally with `npm run build`
3. **Node version:** Vercel uses Node 18 by default

### 404 on Routes

The `vercel.json` rewrites should handle this. If not:

1. Check `vercel.json` exists in root
2. Ensure `rewrites` section is present
3. Redeploy

### Markdown Lessons Not Loading

Ensure the `public/lessons/` directory is in your repository:

```bash
git add public/lessons/
git commit -m "Add lesson content"
git push
```

---

## Production Checklist

Before deploying to production:

- ✅ Test build locally: `npm run build && npm run preview`
- ✅ Check all lessons load correctly
- ✅ Verify dark mode works
- ✅ Test on mobile devices
- ✅ Check terminal simulator functionality
- ✅ Verify progress tracking and achievements
- ✅ Review README.md and update repository URL

---

## Deployment URL

After deployment, your tutorial will be available at:

```
https://your-project-name.vercel.app
```

You can customize the project name in Vercel settings.

---

## Analytics (Optional)

Enable Vercel Analytics:

1. Go to project **"Analytics"** tab
2. Click **"Enable Analytics"**
3. View real-time visitor stats

---

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Happy Deploying! 🚀**
