# Lost Love Memorial Website

A memorial website with gallery, donation, and tribute features.

## Features

- **Gallery**: Upload and view images in categorized groups
- **Donations**: Support through mobile money payments (MTN MoMo, Vodafone Cash, AirtelTigo Money)
- **Tributes**: Leave messages and memories

## Deployment to Netlify

### Option 1: Deploy with Netlify CLI

1. Install Netlify CLI:
   ```
   npm install netlify-cli -g
   ```

2. Login to Netlify:
   ```
   netlify login
   ```

3. Initialize and deploy:
   ```
   netlify init
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. Go to [Netlify](https://app.netlify.com/)
2. Sign up or log in
3. Click "New site from Git"
4. Connect to your Git provider (GitHub, GitLab, etc.)
5. Select your repository
6. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Click "Deploy site"

### Environment Variables

Set these environment variables in Netlify dashboard:

- `VITE_SUPABASE_URL`: Your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_MTN_MOMO_NUMBER`: MTN Mobile Money number
- `VITE_VODAFONE_CASH_NUMBER`: Vodafone Cash number
- `VITE_AIRTELTIGO_MONEY_NUMBER`: AirtelTigo Money number

## Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ``` 