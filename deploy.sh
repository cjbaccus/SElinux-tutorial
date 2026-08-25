#!/bin/bash
# Quick Deployment Script for Vercel

set -e

echo "🚀 SELinux Tutorial - Vercel Deployment Script"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo ""
    echo "Install it with:"
    echo "  npm install -g vercel"
    echo ""
    echo "Or deploy via Vercel Dashboard:"
    echo "  1. Push code to GitHub"
    echo "  2. Visit vercel.com/new"
    echo "  3. Import your repository"
    echo ""
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "⚠️  Not a git repository. Initializing..."
    git init
    echo "✅ Git initialized"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    echo "⚠️  You have uncommitted changes"
    echo ""
    read -p "Commit changes before deploying? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    fi
fi

# Run build test
echo ""
echo "📦 Testing production build..."
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed! Fix errors before deploying."
    exit 1
fi

# Deploy
echo ""
echo "🚀 Deploying to Vercel..."
echo ""

vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Your site should be live at the URL shown above."
echo ""
