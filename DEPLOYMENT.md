# House Expense Tracker - Deployment Guide

This guide explains how to deploy the House Expense Tracker application to production environments.

## Application Overview

The House Expense Tracker consists of:
- **Frontend**: React application built with Vite
- **Backend**: Node.js with Express and Supabase integration

## Deployment Options

You can deploy this application using any of the following services:
1. Render/Netlify (original setup)
2. Vercel (for both frontend and backend)

## Deployment Steps

### 1. Prepare for Deployment

We've already prepared the necessary configuration files:
- Added a production environment file (`.env.production`) for the frontend
- Updated CORS settings to accept production domains
- Created deployment configuration files (Netlify and Render)
- Added production scripts to package.json files

### 2. Frontend Deployment (Netlify)

1. **Build the frontend for production**:
   ```
   cd client
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect your GitHub repository to Netlify
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Set environment variables in Netlify's settings:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_API_URL` (Your deployed backend URL)

3. **Netlify will automatically deploy** when you push changes to your repository.

### 3. Backend Deployment (Render)

1. **Create a new Web Service on Render**:
   - Connect your GitHub repository
   - Set the build command: `npm install`
   - Set the start command: `npm start`

2. **Configure environment variables**:
   - `NODE_ENV`: production
   - `PORT`: 10000 (or let Render assign one)
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_KEY`: Your Supabase key
   - `JWT_SECRET`: A secure random string for JWT token generation
   - `CLIENT_URL`: Your frontend production URL (e.g., 'https://house-expense-tracker.netlify.app')

3. **Deploy** and Render will build and start your application.

### 4. Connect Frontend to Backend

Once both deployments are complete:
1. Get your Render backend URL (e.g., `https://house-expense-tracker-api.onrender.com`)
2. Update the frontend's environment variable (`VITE_API_URL`) in Netlify to point to your backend URL
3. Verify the connection by testing your deployed application

## Local Testing of Production Build

To test your production build locally:

1. **Backend**:
   ```
   cd server
   NODE_ENV=production npm start
   ```

2. **Frontend**:
   ```
   cd client
   npm run build
   npm run preview
   ```

## Troubleshooting

- **CORS Issues**: Verify that your backend CORS settings include your deployed frontend URL
- **API Connection Failures**: Ensure your frontend is using the correct backend URL
- **Authentication Issues**: Check that your Supabase credentials are correctly set in both environments

## Vercel Deployment Instructions

### Frontend Deployment (Vercel)

1. **Push your code to GitHub** if you haven't already

2. **Deploy the frontend**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the client directory as the root directory (important!)
   - Configure the build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_API_URL` (Use your backend Vercel URL once deployed)
   - Deploy

3. **Note the frontend deployment URL** for configuring the backend

### Backend Deployment (Vercel)

1. **Deploy the backend**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the server directory as the root directory (important!)
   - Configure the build settings:
     - Framework Preset: Node.js
     - Build Command: `npm install`
     - Output Directory: `.` (leave default)
   - Add environment variables:
     - `NODE_ENV`: production
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_ANON_KEY`: Your Supabase key
     - `JWT_SECRET`: A secure random string (optional)
     - `CLIENT_URL`: Your frontend Vercel URL (from step 2)
   - Deploy

2. **Update your frontend environment variables** with your backend URL:
   - Go to your frontend project in Vercel
   - Update the `VITE_API_URL` to point to your backend Vercel URL
   - Redeploy if necessary

3. **Update Supabase configuration**:
   - Log in to your Supabase dashboard
   - Go to Authentication > URL Configuration
   - Update Site URL and Redirect URLs to use your Vercel frontend domain

## Maintenance

After deploying, monitor your application using:
- Netlify/Vercel analytics for frontend
- Render/Vercel logs for backend
- Supabase dashboard for database and authentication

## Security Considerations

- Never commit `.env` files to your repository
- Regularly rotate JWT secrets
- Set appropriate CORS restrictions
- Monitor Supabase authentication logs
