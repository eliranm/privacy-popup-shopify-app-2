import React from 'react';
import { AppProvider as PolarisProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import enTranslations from '@shopify/polaris/locales/en.json';

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Combined provider component that wraps the app with Polaris and App Bridge providers
 */
export function AppProvider({ children }: AppProviderProps) {
  // Get app configuration from URL parameters or environment
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get('shop') || '';
  const host = urlParams.get('host') || '';

  const appBridgeConfig = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || process.env.SHOPIFY_API_KEY || '',
    shop: shop,
    host: host,
    forceRedirect: true,
  };

  return (
    <AppBridgeProvider config={appBridgeConfig}>
      <PolarisProvider i18n={enTranslations}>
        {children}
      </PolarisProvider>
    </AppBridgeProvider>
  );
}
