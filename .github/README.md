# GitHub Actions CI/CD Pipeline

This directory contains GitHub Actions workflow configurations for continuous integration and continuous deployment of the House Expense Tracker application.

## Workflow: ci-cd.yml

This workflow automates testing, building, and deployment processes:

### What it does:

1. **Lint and Test Job**:
   - Runs on every push to main/master and on pull requests
   - Installs dependencies
   - Lints the client code
   - Runs tests
   - Builds the client application

2. **Deploy Backend Job**:
   - Runs only on pushes to main/master
   - Triggers a deployment to Render using a deploy hook

3. **Deploy Frontend Job**:
   - Runs only on pushes to main/master
   - Deploys the client application to Vercel

### Required Secrets:

To use this workflow, you need to add the following secrets to your GitHub repository:

- `RENDER_DEPLOY_HOOK_URL`: The webhook URL from Render to trigger deployments
- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

## How to Get the Required Secrets

### Render Deploy Hook:
1. Go to your Render dashboard
2. Select your backend service
3. Go to Settings
4. Scroll down to "Deploy Hooks"
5. Create a new deploy hook and copy the URL

### Vercel Secrets:
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel login`
3. Run `vercel link` in your project directory
4. Find your project and org IDs in the `.vercel/project.json` file
5. Generate a token in the Vercel dashboard under Account → Tokens
