# Privacy Popup - Shopify App

A modern Shopify app that adds a customizable privacy popup to your storefront as a theme app embed block.

## Features

- **Customizable Content**: Edit popup title, message, and button text
- **Flexible Positioning**: Choose between top, center, or bottom placement
- **Brand Theming**: Customize colors to match your brand
- **Accept/Decline Options**: Optional decline button
- **Privacy Policy Integration**: Link to your privacy policy
- **Mobile Responsive**: Optimized for all device sizes
- **Cookie Memory**: Remembers user choice for 1 year
- **GDPR Compliant**: Helps with privacy compliance

## Installation

### Prerequisites

- Node.js 18+ 
- Shopify Partners account
- Development store

### Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your Shopify app credentials

5. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables

Required environment variables:

- `SHOPIFY_API_KEY` - Your app's API key
- `SHOPIFY_API_SECRET` - Your app's API secret  
- `SCOPES` - App permissions (write_themes,read_themes)
- `HOST` - Your app's URL
- `APPLICATION_URL` - Your app's URL
- `SESSION_SECRET` - Random session secret
- `WEBHOOK_SECRET` - Webhook verification secret

## Usage

1. Install the app in your Shopify store
2. Go to your theme editor
3. Look for "App embeds" in the left sidebar
4. Find "Privacy Popup" and toggle it on
5. Customize the settings as needed
6. Save and preview your store

## Development

### Project Structure

```
├── extensions/                 # Theme app extension
│   └── privacy-popup-extension/
│       ├── blocks/            # Liquid templates
│       ├── assets/            # CSS/JS files
│       └── locales/           # Translation files
├── server/                    # Node.js backend
│   ├── index.js              # Main server file
│   └── utils/                # Utility functions
├── src/                      # React frontend
│   ├── components/           # React components
│   ├── pages/               # Page components
│   └── main.tsx             # App entry point
└── package.json             # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Deploy app using Shopify CLI

### Tech Stack

- **Frontend**: React, TypeScript, Shopify Polaris
- **Backend**: Node.js, Express, Shopify App Express
- **Theme Extension**: Liquid, CSS, JavaScript
- **Deployment**: Vercel
- **Authentication**: Shopify OAuth

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact [your-email@example.com] or create an issue in this repository.
