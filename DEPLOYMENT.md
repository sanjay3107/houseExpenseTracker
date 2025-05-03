# House Expense Tracker - Deployment Guide

This guide explains how to deploy the House Expense Tracker application to production environments.

## Application Overview

The House Expense Tracker consists of:
- **Frontend**: React application built with Vite
- **Backend**: Node.js with Express and Supabase integration

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

## Maintenance

After deploying, monitor your application using:
- Netlify analytics for frontend
- Render logs for backend
- Supabase dashboard for database and authentication

## Security Considerations

- Never commit `.env` files to your repository
- Regularly rotate JWT secrets
- Set appropriate CORS restrictions
- Monitor Supabase authentication logs
