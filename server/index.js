import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import { shopifyApp } from '@shopify/shopify-app-express';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Debug environment variables
console.log('Environment check:');
console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY ? 'Set' : 'Missing');
console.log('SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET ? 'Set' : 'Missing');
console.log('HOST:', process.env.HOST);

// Check if required environment variables are set
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
  console.error('❌ Missing required environment variables: SHOPIFY_API_KEY and/or SHOPIFY_API_SECRET');
  console.error('Please set these in your Vercel environment variables');
}

// Shopify app configuration
const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY || 'missing',
    apiSecretKey: process.env.SHOPIFY_API_SECRET || 'missing',
    scopes: process.env.SCOPES?.split(',') || ['write_themes', 'read_themes'],
    hostName: process.env.HOST?.replace(/https?:\/\//, '') || 'privacy-popup.q-biz.co.il',
    hostScheme: 'https',
    apiVersion: '2024-10',
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  // sessionStorage will use default memory storage
});

const app = express();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Configuration check endpoint
app.get('/api/config', (req, res) => {
  res.status(200).json({
    shopifyApiKey: process.env.SHOPIFY_API_KEY ? 'Set' : 'Missing',
    shopifyApiSecret: process.env.SHOPIFY_API_SECRET ? 'Set' : 'Missing',
    host: process.env.HOST || 'Not set',
    scopes: process.env.SCOPES || 'Using defaults',
    configured: !!(process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET)
  });
});

// Debug endpoint to show OAuth URL construction (for troubleshooting)
app.get('/api/debug-oauth', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  const scopes = 'write_themes,read_themes';
  const redirectUri = `${process.env.HOST}/api/auth/callback`;
  const clientId = process.env.SHOPIFY_API_KEY;
  
  // Show the OAuth URL components (without actually redirecting)
  res.json({
    shop,
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'Missing',
    scopes,
    redirectUri,
    fullAuthUrl: `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=debug`,
    partnersAppUrl: process.env.HOST,
    expectedCallback: `${process.env.HOST}/api/auth/callback`
  });
});

// Test OAuth endpoint
app.get('/api/test-auth', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter is required' });
  }

  // Manual OAuth URL construction (like your blocks app probably does)
  const scopes = 'write_themes,read_themes';
  const redirectUri = `${process.env.HOST}/api/auth/callback`;
  const state = Math.random().toString(36).substring(7);
  
  const authUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${process.env.SHOPIFY_API_KEY}&` +
    `scope=${scopes}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `state=${state}`;
  
  console.log('Manual OAuth URL:', authUrl);
  
  res.redirect(authUrl);
});

// Manual OAuth callback handler
app.get('/api/auth/callback', async (req, res) => {
  const { code, shop, state } = req.query;
  
  console.log('OAuth callback received:', { shop, code: code ? 'present' : 'missing', state });
  
  if (!code || !shop) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.access_token) {
      console.log('Access token obtained for shop:', shop);
      
      // Redirect to the main app interface
      res.redirect(`/?shop=${shop}&host=${Buffer.from(`${shop}/admin`).toString('base64')}`);
    } else {
      console.error('Failed to get access token:', tokenData);
      res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Apply Shopify middleware
app.use(shopify.cspHeaders());

// Webhook handlers
app.post('/api/webhooks/app/uninstalled', express.raw({ type: 'application/json' }), async (req, res) => {
  const hmac = req.get('x-shopify-hmac-sha256');
  const body = req.body;
  const shop = req.get('x-shopify-shop-domain');

  console.log(`App uninstalled from shop: ${shop}`);
  
  // Here you would typically clean up any stored data for this shop
  // For now, we'll just log the event
  
  res.status(200).send('OK');
});

// API routes (protected)
app.use('/api/*', (req, res, next) => {
  // Skip auth for health and config endpoints
  if (req.path === '/api/health' || req.path === '/api/config') {
    return next();
  }
  return shopify.validateAuthenticatedSession()(req, res, next);
});

app.get('/api/shop', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const { Shop } = await import('@shopify/shopify-api/rest/admin/2024-10');
    
    const shop = new Shop({ session });
    const shopData = await shop.get({
      fields: 'id,name,domain,email,plan_name,plan_display_name'
    });

    res.status(200).json(shopData);
  } catch (error) {
    console.error('Error fetching shop data:', error);
    res.status(500).json({ error: 'Failed to fetch shop data' });
  }
});

// App settings API
app.get('/api/settings', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    
    // In a real app, you'd fetch settings from your database
    // For now, return default settings
    const settings = {
      popup_enabled: true,
      popup_title: 'Privacy Notice',
      popup_text: 'We use cookies to improve your experience on our site.',
      accept_text: 'Accept',
      decline_text: 'Decline',
      show_decline: false,
      privacy_policy_url: '',
      policy_link_text: 'Privacy Policy',
      position: 'bottom',
      delay: 2,
      background_color: '#ffffff',
      text_color: '#333333',
      accept_button_color: '#007cba'
    };

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    const settings = req.body;

    // In a real app, you'd save settings to your database
    console.log('Saving settings for shop:', session.shop, settings);

    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Theme extension deep linking
app.get('/api/theme-extension/activate', shopify.validateAuthenticatedSession(), async (req, res) => {
  const session = res.locals.shopify.session;
  const { template = 'index' } = req.query;
  
  const activateUrl = `https://${session.shop}/admin/themes/current/editor?context=apps&template=${template}&activateAppId=${process.env.SHOPIFY_API_KEY}/privacy-popup`;
  
  res.redirect(activateUrl);
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, '../dist')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  try {
    const indexPath = join(__dirname, '../dist/index.html');
    const indexHtml = readFileSync(indexPath, 'utf8');
    res.send(indexHtml);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Privacy Popup Shopify App running on port ${PORT}`);
  console.log(`📱 App URL: ${process.env.HOST || `http://localhost:${PORT}`}`);
});
