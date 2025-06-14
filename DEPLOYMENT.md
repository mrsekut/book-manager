# Deployment Guide

This guide will help you deploy the Book Management application to Vercel with Supabase and basic authentication.

## Prerequisites

- Vercel account
- Supabase account
- Git repository (if not already set up)

## Step 1: Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be initialized
3. Go to Settings > API to get your:
   - Project URL
   - Public anon key
4. Go to SQL Editor and run the contents of `database/schema.sql` to create the books table

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Set your basic authentication credentials:
   ```
   BASIC_AUTH_USER=your-username
   BASIC_AUTH_PASSWORD=your-secure-password
   ```

## Step 3: Test locally

1. Install dependencies: `bun install`
2. Run the development server: `bun dev`
3. Test the application at `http://localhost:3000`
4. Verify basic authentication works
5. Verify data is saved to Supabase

## Step 4: Deploy to Vercel

### Option 1: Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to deploy

### Option 2: Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Import your Git repository
3. Configure environment variables in the dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `BASIC_AUTH_USER`
   - `BASIC_AUTH_PASSWORD`
4. Deploy

## Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

## Security Notes

- The basic authentication username and password should be strong
- Consider using environment-specific credentials
- The Supabase anon key is public but protected by Row Level Security
- All data operations go through the database service layer

## Features After Deployment

- ✅ Basic authentication protects the entire application
- ✅ Data persists across devices and browsers
- ✅ Real-time data sync through Supabase
- ✅ Mobile-responsive design
- ✅ Book management with notes and links
- ✅ Priority system and hierarchical organization